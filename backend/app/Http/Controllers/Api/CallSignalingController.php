<?php

namespace App\Http\Controllers\Api;

use App\Events\CallInitiated;
use App\Events\CallSignal;
use App\Http\Controllers\Controller;
use App\Models\CallSession;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CallSignalingController extends Controller
{
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'call_type' => 'required|in:voice,video',
            'callee_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($validated['conversation_id']);

        // Verify caller is participant
        $isParticipant = $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Not a participant'], 403);
        }

        // Check for active call in this conversation
        $activeCall = CallSession::where('conversation_id', $conversation->id)
            ->whereIn('status', ['pending', 'active'])
            ->first();

        if ($activeCall) {
            return response()->json(['error' => 'Active call already exists'], 409);
        }

        $sessionId = (string) Str::uuid();

        $callSession = CallSession::create([
            'session_id' => $sessionId,
            'conversation_id' => $conversation->id,
            'caller_id' => $user->id,
            'callee_id' => $validated['callee_id'],
            'call_type' => $validated['call_type'],
            'status' => 'pending',
            'started_at' => now(),
        ]);

        // Broadcast to callee
        broadcast(new CallInitiated($callSession))->toOthers();

        return response()->json([
            'data' => [
                'session_id' => $sessionId,
                'call_type' => $validated['call_type'],
                'status' => 'pending',
            ],
        ]);
    }

    public function signal(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:call_sessions,session_id',
            'signal_type' => 'required|in:offer,answer,ice_candidate,accept,decline,end',
            'payload' => 'required|array',
        ]);

        $user = $request->user();
        $callSession = CallSession::where('session_id', $validated['session_id'])->firstOrFail();

        // Verify user is caller or callee
        if (!in_array($user->id, [$callSession->caller_id, $callSession->callee_id])) {
            return response()->json(['error' => 'Not authorized for this call'], 403);
        }

        // Handle state changes
        switch ($validated['signal_type']) {
            case 'accept':
                $callSession->markAnswered();
                break;
            case 'decline':
                $callSession->update(['status' => 'declined', 'ended_at' => now(), 'end_reason' => 'declined']);
                break;
            case 'end':
                $callSession->markEnded($validated['payload']['reason'] ?? 'completed');
                break;
        }

        // Broadcast signal to the OTHER participant
        $recipientId = $user->id === $callSession->caller_id 
            ? $callSession->callee_id 
            : $callSession->caller_id;

        broadcast(new CallSignal($callSession, $validated['signal_type'], $validated['payload'], $user->id))
            ->toOthers();

        return response()->json(['success' => true]);
    }

    public function history(Request $request)
    {
        $calls = CallSession::where('caller_id', $request->user()->id)
            ->orWhere('callee_id', $request->user()->id)
            ->with(['caller', 'callee', 'conversation'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $calls]);
    }
}

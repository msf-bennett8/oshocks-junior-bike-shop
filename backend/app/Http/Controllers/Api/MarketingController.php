<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketingCampaign;
use App\Services\MarketingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MarketingController extends Controller
{
    /**
     * Create marketing campaign
     * POST /api/v1/marketing/campaigns
     */
    public function createCampaign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,sms,push,mixed',
            'subject' => 'required_if:type,email,mixed|string|max:255',
            'content' => 'required|array',
            'audience_segment' => 'required|array',
            'audience_count' => 'required|integer|min:1',
            'scheduled_at' => 'nullable|date|after:now',
            'ip_warmup' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign = MarketingService::createCampaign($request->all(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Campaign created',
            'data' => $campaign
        ], 201);
    }

    /**
     * Get campaigns
     * GET /api/v1/marketing/campaigns
     */
    public function listCampaigns(Request $request)
    {
        $campaigns = MarketingCampaign::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $campaigns
        ]);
    }

    /**
     * Get campaign details
     * GET /api/v1/marketing/campaigns/{id}
     */
    public function showCampaign(Request $request, $id)
    {
        $campaign = MarketingCampaign::with(['logs.user', 'creator'])
            ->where('campaign_id', $id)
            ->first();

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $campaign
        ]);
    }

    /**
     * Launch campaign immediately
     * POST /api/v1/marketing/campaigns/{id}/launch
     */
    public function launchCampaign(Request $request, $id)
    {
        $campaign = MarketingCampaign::where('campaign_id', $id)->first();

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found'
            ], 404);
        }

        if ($campaign->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Campaign already ' . $campaign->status
            ], 400);
        }

        $campaign->update(['status' => 'sending', 'started_at' => now()]);

        // Dispatch job to send campaign
        // SendCampaignJob::dispatch($campaign);

        return response()->json([
            'success' => true,
            'message' => 'Campaign launched'
        ]);
    }

    /**
     * Track email open (pixel)
     * GET /api/v1/marketing/pixel/{campaignId}/{userId}/{messageId}
     */
    public function trackingPixel(Request $request, $campaignId, $userId, $messageId)
    {
        MarketingService::trackOpen(
            $campaignId,
            $userId,
            $messageId,
            $request->ip(),
            $request->userAgent()
        );

        // Return 1x1 transparent GIF
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Track email click
     * GET /api/v1/marketing/click/{campaignId}/{userId}/{messageId}
     */
    public function trackClick(Request $request, $campaignId, $userId, $messageId)
    {
        $redirectUrl = $request->get('redirect', '/');

        $finalUrl = MarketingService::trackClick(
            $campaignId,
            $userId,
            $messageId,
            $redirectUrl,
            $request->ip()
        );

        return redirect($finalUrl);
    }

    /**
     * Handle Postmark webhook
     * POST /api/v1/marketing/webhooks/postmark
     */
    public function postmarkWebhook(Request $request)
    {
        $type = $request->input('Type');
        $messageId = $request->input('MessageID');
        
        // Extract campaign and user from metadata (would be stored in MessageStream or custom headers)
        $metadata = $request->input('Metadata', []);
        $campaignId = $metadata['campaign_id'] ?? 'unknown';
        $userId = $metadata['user_id'] ?? 'unknown';

        switch ($type) {
            case 'Delivery':
                MarketingService::trackDelivery($campaignId, $userId, $messageId, [
                    'provider' => 'postmark',
                    'delivered_at' => $request->input('DeliveredAt'),
                ]);
                break;

            case 'Bounce':
                MarketingService::trackBounce(
                    $campaignId,
                    $userId,
                    $messageId,
                    $request->input('Type') === 'HardBounce' ? 'hard' : 'soft',
                    $request->input('Description', 'Unknown')
                );
                break;

            case 'SpamComplaint':
                MarketingService::trackComplaint(
                    $campaignId,
                    $userId,
                    $messageId,
                    'spam'
                );
                break;
        }

        return response()->json(['success' => true]);
    }

    /**
     * Handle unsubscribe
     * GET /api/v1/marketing/unsubscribe
     */
    public function unsubscribe(Request $request)
    {
        $token = $request->get('token');
        
        // Validate token and get user
        // $user = User::where('unsubscribe_token', $token)->first();
        
        // if (!$user) {
        //     return response()->json(['success' => false, 'message' => 'Invalid token'], 400);
        // }

        // MarketingService::unsubscribe($user, 'marketing', 'link');

        return response()->json([
            'success' => true,
            'message' => 'You have been unsubscribed from marketing emails'
        ]);
    }

    /**
     * Get campaign analytics
     * GET /api/v1/marketing/campaigns/{id}/analytics
     */
    public function campaignAnalytics(Request $request, $id)
    {
        $campaign = MarketingCampaign::where('campaign_id', $id)->first();

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found'
            ], 404);
        }

        // Calculate rates
        $sent = $campaign->sent_count;
        $delivered = $campaign->delivered_count;
        $opened = $campaign->opened_count;
        $clicked = $campaign->clicked_count;

        return response()->json([
            'success' => true,
            'data' => [
                'campaign_id' => $campaign->campaign_id,
                'status' => $campaign->status,
                'counts' => [
                    'sent' => $sent,
                    'delivered' => $delivered,
                    'opened' => $opened,
                    'clicked' => $clicked,
                    'bounced' => $campaign->bounced_count,
                    'complained' => $campaign->complained_count,
                    'unsubscribed' => $campaign->unsubscribed_count,
                ],
                'rates' => [
                    'delivery_rate' => $sent > 0 ? round($delivered / $sent * 100, 2) : 0,
                    'open_rate' => $delivered > 0 ? round($opened / $delivered * 100, 2) : 0,
                    'click_rate' => $delivered > 0 ? round($clicked / $delivered * 100, 2) : 0,
                    'bounce_rate' => $sent > 0 ? round($campaign->bounced_count / $sent * 100, 2) : 0,
                    'complaint_rate' => $sent > 0 ? round($campaign->complained_count / $sent * 100, 2) : 0,
                    'unsubscribe_rate' => $sent > 0 ? round($campaign->unsubscribed_count / $sent * 100, 2) : 0,
                ],
            ]
        ]);
    }
}

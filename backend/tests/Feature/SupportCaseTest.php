<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\SupportCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportCaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $admin;
    protected User $agent;
    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'buyer']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->agent = User::factory()->create(['role' => 'support_agent']);
        $this->superAdmin = User::factory()->create(['role' => 'super_admin']);
    }

    public function test_user_can_create_support_case(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/conversations', [
                'type' => 'support',
                'case_type' => 'report_problem',
                'subject' => 'Website is broken',
                'description' => 'I cannot checkout',
                'priority' => 'high',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data',
                'support_case' => ['case_id', 'status', 'case_type'],
                'case_id',
            ]);

        $this->assertDatabaseHas('support_cases', [
            'case_type' => 'report_problem',
            'status' => 'new',
            'priority' => 'high',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_order_issue_requires_order_number(): void
    {
        $order = Order::factory()->create(['order_number' => 'ORD-2026-0001']);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/conversations', [
                'type' => 'order_support',
                'case_type' => 'order_issue',
                'subject' => 'Missing item',
                'order_number' => 'ORD-2026-0001',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('support_cases', [
            'case_type' => 'order_issue',
            'order_id' => $order->id,
        ]);
    }

    public function test_invalid_order_number_returns_error(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/conversations', [
                'type' => 'order_support',
                'case_type' => 'order_issue',
                'subject' => 'Missing item',
                'order_number' => 'INVALID-ORDER',
            ]);

        $response->assertStatus(422);
    }

    public function test_agent_can_claim_case(): void
    {
        $case = SupportCase::factory()->unclaimed()->create();

        $response = $this->actingAs($this->agent)
            ->postJson("/api/v1/support-queue/{$case->case_id}/claim");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.assigned_to', $this->agent->id);

        $this->assertDatabaseHas('support_cases', [
            'case_id' => $case->case_id,
            'status' => 'open',
            'assigned_to' => $this->agent->id,
        ]);
    }

    public function test_non_agent_cannot_claim_case(): void
    {
        $case = SupportCase::factory()->unclaimed()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/support-queue/{$case->case_id}/claim");

        $response->assertStatus(403);
    }

    public function test_agent_can_resolve_case(): void
    {
        $case = SupportCase::factory()->claimed()->create([
            'assigned_to' => $this->agent->id,
        ]);

        $response = $this->actingAs($this->agent)
            ->postJson("/api/v1/support-queue/{$case->case_id}/resolve", [
                'resolution_notes' => 'Issue fixed, refunded customer',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('support_cases', [
            'case_id' => $case->case_id,
            'status' => 'resolved',
            'resolution_notes' => 'Issue fixed, refunded customer',
        ]);
    }

    public function test_user_can_escalate_case(): void
    {
        $case = SupportCase::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/support-cases/{$case->case_id}/escalate", [
                'reason' => 'Agent is not responding to my messages at all',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'escalated');

        $this->assertDatabaseHas('support_cases', [
            'case_id' => $case->case_id,
            'status' => 'escalated',
        ]);
    }

    public function test_super_admin_can_view_escalated_cases(): void
    {
        SupportCase::factory()->escalated()->count(3)->create();

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/super-admin/support/escalated');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.data');
    }

    public function test_queue_stats_are_accurate(): void
    {
        SupportCase::factory()->unclaimed()->count(5)->create();
        SupportCase::factory()->claimed()->count(3)->create(['assigned_to' => $this->agent->id]);
        SupportCase::factory()->escalated()->count(2)->create();

        $response = $this->actingAs($this->agent)
            ->getJson('/api/v1/support-queue/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.total_unclaimed', 5)
            ->assertJsonPath('data.total_active', 10)
            ->assertJsonPath('data.total_escalated', 2)
            ->assertJsonPath('data.my_open', 3);
    }

    public function test_case_history_is_recorded(): void
    {
        $case = SupportCase::factory()->unclaimed()->create();

        // Claim it
        $this->actingAs($this->agent)
            ->postJson("/api/v1/support-queue/{$case->case_id}/claim");

        $this->assertDatabaseHas('support_case_history', [
            'case_id' => $case->case_id,
            'from_status' => 'new',
            'to_status' => 'open',
            'to_assigned_to' => $this->agent->id,
        ]);
    }

    public function test_first_response_is_tracked(): void
    {
        $case = SupportCase::factory()->unclaimed()->create();
        $conversation = Conversation::factory()->create(['support_case_id' => $case->case_id]);

        // Claim case
        $this->actingAs($this->agent)
            ->postJson("/api/v1/support-queue/{$case->case_id}/claim");

        // Send message as agent
        $this->actingAs($this->agent)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'How can I help you today?',
            ]);

        $this->assertDatabaseHas('support_cases', [
            'case_id' => $case->case_id,
            'first_response_at' => now()->format('Y-m-d H:i'),
        ]);
    }

    public function test_user_can_rate_satisfaction(): void
    {
        $case = SupportCase::factory()->resolved()->create([
            'user_id' => $this->user->id,
            'resolved_by' => $this->agent->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/support-cases/{$case->case_id}/satisfaction", [
                'rating' => 5,
                'comment' => 'Great service!',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('support_cases', [
            'case_id' => $case->case_id,
            'satisfaction_rating' => 5,
            'satisfaction_comment' => 'Great service!',
        ]);
    }

    public function test_guest_can_create_support_case(): void
    {
        $response = $this->postJson('/api/v1/conversations', [
            'type' => 'support',
            'case_type' => 'report_problem',
            'subject' => 'Cannot browse products',
            'guest_name' => 'Guest User',
        ], ['X-Guest-Session-ID' => 'test-session-123']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('support_cases', [
            'case_type' => 'report_problem',
            'guest_session_id' => 'test-session-123',
        ]);
    }

    public function test_case_id_format_follows_codec_spec(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/conversations', [
                'type' => 'support',
                'case_type' => 'order_issue',
                'subject' => 'Test case ID format',
            ]);

        $caseId = $response->json('case_id');
        $this->assertEquals(13, strlen($caseId));
        $this->assertMatchesRegularExpression('/^[A-Z]{2}[A-Z]{1,2}[A-Z]{3}[0-9][7][A-Z]{3}$/', $caseId);
    }

    public function test_conversation_list_includes_support_case_data(): void
    {
        $case = SupportCase::factory()->create(['user_id' => $this->user->id]);
        $conversation = Conversation::factory()->create([
            'support_case_id' => $case->case_id,
            'created_by' => $this->user->id,
        ]);
        $conversation->participants()->attach($this->user->id);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.support_case.case_id', $case->case_id);
    }
}

<?php

namespace Database\Factories;

use App\Models\SupportCase;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Order;
use App\Services\SupportCaseIdService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportCase>
 */
class SupportCaseFactory extends Factory
{
    protected $model = SupportCase::class;

    public function definition(): array
    {
        $caseTypes = ['order_issue', 'account_help', 'report_problem', 'delivery_question'];
        $statuses = ['new', 'open', 'in_progress', 'pending_user', 'resolved', 'closed', 'escalated'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        return [
            'conversation_id' => Conversation::factory(),
            'user_id' => User::factory(),
            'case_type' => fake()->randomElement($caseTypes),
            'status' => fake()->randomElement($statuses),
            'priority' => fake()->randomElement($priorities),
            'subject' => fake()->sentence(4),
            'description' => fake()->paragraph(2),
            'source' => fake()->randomElement(['web', 'email', 'phone', 'chat']),
            'metadata' => [
                'ip' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
            ],
        ];
    }

    public function unclaimed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'new',
            'assigned_to' => null,
            'claimed_at' => null,
        ]);
    }

    public function claimed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open',
            'assigned_to' => User::factory(),
            'claimed_at' => now(),
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => User::factory(),
            'resolution_notes' => fake()->paragraph(),
        ]);
    }

    public function escalated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'escalated',
            'escalated_at' => now(),
            'escalated_by' => User::factory(),
            'escalation_reason' => fake()->sentence(10),
        ]);
    }

    public function withOrder(): static
    {
        return $this->state(fn (array $attributes) => [
            'case_type' => 'order_issue',
            'order_id' => Order::factory(),
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgent',
        ]);
    }

    public function slaBreached(): static
    {
        return $this->state(fn (array $attributes) => [
            'sla_breached' => true,
            'sla_deadline' => now()->subHours(2),
            'breach_reason' => 'Auto-escalated: SLA deadline exceeded',
        ]);
    }
}

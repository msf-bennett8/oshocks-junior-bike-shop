<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\SupportCase;
use App\Models\SupportCaseHistory;
use App\Models\SupportCaseNote;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupportCaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating support case test data...');

        // Ensure we have users
        $admin = User::firstOrCreate(
            ['email' => 'admin@oshocks.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $supportAgent = User::firstOrCreate(
            ['email' => 'agent@oshocks.com'],
            [
                'name' => 'Support Agent',
                'username' => 'agent',
                'password' => bcrypt('password'),
                'role' => 'support_agent',
                'is_active' => true,
            ]
        );

        $superAdmin = User::firstOrCreate(
            ['email' => 'super@oshocks.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        $regularUser = User::firstOrCreate(
            ['email' => 'user@oshocks.com'],
            [
                'name' => 'Regular User',
                'username' => 'user',
                'password' => bcrypt('password'),
                'role' => 'buyer',
                'is_active' => true,
            ]
        );

        // Create diverse support cases
        $scenarios = [
            // Unclaimed cases
            ['count' => 5, 'state' => 'unclaimed', 'type' => 'order_issue'],
            ['count' => 3, 'state' => 'unclaimed', 'type' => 'account_help'],
            ['count' => 4, 'state' => 'unclaimed', 'type' => 'report_problem'],
            ['count' => 2, 'state' => 'unclaimed', 'type' => 'delivery_question'],

            // Claimed/in-progress
            ['count' => 4, 'state' => 'claimed', 'type' => 'order_issue', 'agent' => $supportAgent],
            ['count' => 3, 'state' => 'claimed', 'type' => 'account_help', 'agent' => $admin],
            ['count' => 2, 'state' => 'claimed', 'type' => 'report_problem', 'agent' => $supportAgent],

            // Pending user
            ['count' => 2, 'state' => 'pending_user', 'type' => 'order_issue', 'agent' => $supportAgent],

            // Resolved
            ['count' => 3, 'state' => 'resolved', 'type' => 'delivery_question', 'agent' => $admin],

            // Escalated
            ['count' => 2, 'state' => 'escalated', 'type' => 'report_problem', 'agent' => $supportAgent],

            // Closed
            ['count' => 2, 'state' => 'closed', 'type' => 'account_help', 'agent' => $admin],

            // SLA breached
            ['count' => 1, 'state' => 'slaBreached', 'type' => 'order_issue'],
        ];

        foreach ($scenarios as $scenario) {
            for ($i = 0; $i < $scenario['count']; $i++) {
                $conversation = Conversation::create([
                    'type' => $scenario['type'] === 'order_issue' ? 'order_support' : 'support',
                    'title' => ucfirst(str_replace('_', ' ', $scenario['type'])),
                    'created_by' => $regularUser->id,
                    'status' => 'active',
                    'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
                ]);

                $conversation->participants()->attach($regularUser->id, ['joined_at' => now()]);

                // Add initial message
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $regularUser->id,
                    'body' => fake()->paragraph(2),
                    'type' => 'text',
                ]);

                $factory = SupportCase::factory()
                    ->for($conversation)
                    ->for($regularUser, 'user')
                    ->state([
                        'case_type' => $scenario['type'],
                        'subject' => fake()->sentence(4) . ' (' . ucfirst(str_replace('_', ' ', $scenario['type'])) . ')',
                        'description' => fake()->paragraph(3),
                    ]);

                // Apply state
                match ($scenario['state']) {
                    'unclaimed' => $factory = $factory->unclaimed(),
                    'claimed' => $factory = $factory->claimed()->state(['assigned_to' => $scenario['agent']->id]),
                    'pending_user' => $factory = $factory->claimed()->state([
                        'status' => 'pending_user',
                        'assigned_to' => $scenario['agent']->id,
                        'first_response_at' => now()->subHours(2),
                    ]),
                    'resolved' => $factory = $factory->resolved()->state(['resolved_by' => $scenario['agent']->id]),
                    'escalated' => $factory = $factory->escalated()->state([
                        'escalated_by' => $scenario['agent']->id,
                        'assigned_to' => $superAdmin->id,
                    ]),
                    'closed' => $factory = $factory->resolved()->state([
                        'resolved_by' => $scenario['agent']->id,
                        'status' => 'closed',
                        'closed_at' => now(),
                        'closed_by' => $regularUser->id,
                    ]),
                    'slaBreached' => $factory = $factory->slaBreached()->unclaimed(),
                    default => $factory,
                };

                $case = $factory->create();

                // Link conversation to case
                $conversation->update(['support_case_id' => $case->case_id]);

                // Add agent as participant for claimed cases
                if (in_array($scenario['state'], ['claimed', 'pending_user', 'resolved', 'escalated', 'closed'])) {
                    $conversation->participants()->attach($scenario['agent']->id, ['joined_at' => now()]);
                }

                // Add history for claimed+ cases
                if ($scenario['state'] !== 'unclaimed' && $scenario['state'] !== 'slaBreached') {
                    SupportCaseHistory::create([
                        'case_id' => $case->case_id,
                        'changed_by' => $scenario['agent']->id,
                        'from_status' => 'new',
                        'to_status' => $case->status === 'closed' ? 'resolved' : $case->status,
                        'to_assigned_to' => $scenario['agent']->id,
                        'reason' => 'Case claimed by agent',
                    ]);
                }

                // Add notes for some cases
                if (fake()->boolean(30)) {
                    SupportCaseNote::create([
                        'case_id' => $case->case_id,
                        'agent_id' => $scenario['agent']->id ?? $admin->id,
                        'content' => fake()->paragraph(2),
                        'is_private' => fake()->boolean(70),
                    ]);
                }
            }
        }

        $this->command->info('Support cases seeded successfully!');
        $this->command->info('Test accounts:');
        $this->command->info('  Admin: admin@oshocks.com / password');
        $this->command->info('  Agent: agent@oshocks.com / password');
        $this->command->info('  Super: super@oshocks.com / password');
        $this->command->info('  User:  user@oshocks.com / password');
    }
}

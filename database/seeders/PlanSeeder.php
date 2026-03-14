<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::updateOrCreate(
            ['name' => 'Basic Plan'],
            [
                'price' => 29.99,
            'description' => 'Perfect for beginners who want to get started with their fitness journey.',
            'features' => [
                '4-week workout program',
                'Nutrition guide',
                'Email support',
                'Progress tracking',
            ],
                'active' => true,
            ]
        );

        Plan::updateOrCreate(
            ['name' => 'Premium Plan'],
            [
                'price' => 59.99,
            'description' => 'Comprehensive training program with personalized support and advanced features.',
            'features' => [
                '12-week workout program',
                'Customized meal plans',
                'Priority chat support',
                'Video tutorials',
                'Progress tracking & analytics',
                'Monthly check-ins',
            ],
                'active' => true,
            ]
        );

        Plan::updateOrCreate(
            ['name' => 'Advanced Form Mastery'],
            [
                'price' => 279,
            'description' => 'Advanced coaching with same/next-day response and injury prevention focus.',
            'features' => [
                '15-20 exercise videos/month',
                'Advanced video breakdowns',
                'Priority or same/next-day response',
                'Efficiency & injury prevention focus',
                '12-24 hour turnaround',
            ],
                'active' => true,
            ]
        );
    }
}

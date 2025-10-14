<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mountain Bikes',
                'slug' => 'mountain-bikes',
                'description' => 'High-performance mountain bikes for all terrains',
                'is_active' => true,
                'display_order' => 1
            ],
            [
                'name' => 'Road Bikes',
                'slug' => 'road-bikes',
                'description' => 'Speed-focused road bikes for racing and commuting',
                'is_active' => true,
                'display_order' => 2
            ],
            [
                'name' => 'Kids Bikes',
                'slug' => 'kids-bikes',
                'description' => 'Safe and fun bicycles for children',
                'is_active' => true,
                'display_order' => 3
            ],
            [
                'name' => 'Electric Bikes',
                'slug' => 'electric-bikes',
                'description' => 'E-bikes with motor assistance',
                'is_active' => true,
                'display_order' => 4
            ],
            [
                'name' => 'Helmets',
                'slug' => 'helmets',
                'description' => 'Safety helmets for all cycling types',
                'is_active' => true,
                'display_order' => 5
            ],
            [
                'name' => 'Lights',
                'slug' => 'lights',
                'description' => 'Bike lights for visibility and safety',
                'is_active' => true,
                'display_order' => 6
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Various cycling accessories',
                'is_active' => true,
                'display_order' => 7
            ],
            [
                'name' => 'Spare Parts',
                'slug' => 'spare-parts',
                'description' => 'Replacement parts and components',
                'is_active' => true,
                'display_order' => 8
            ],
            [
                'name' => 'Tires & Tubes',
                'slug' => 'tires-tubes',
                'description' => 'Tires, tubes, and wheel components',
                'is_active' => true,
                'display_order' => 9
            ],
            [
                'name' => 'Brakes',
                'slug' => 'brakes',
                'description' => 'Brake systems and components',
                'is_active' => true,
                'display_order' => 10
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $this->command->info('Categories seeded successfully!');
    }
}

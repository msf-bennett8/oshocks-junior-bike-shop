<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\SellerProfile;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    private $faker;
    private $categories = [];
    private $sellers = [];
    
    // Bike brands
    private $brands = [
        'Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida',
        'Bianchi', 'Colnago', 'Pinarello', 'Cervelo', 'Santa Cruz',
        'Yeti', 'Pivot', 'Norco', 'Kona', 'GT', 'Mongoose', 'Schwinn',
        'Raleigh', 'Fuji', 'Marin', 'Cube', 'Focus', 'BMC', 'Wilier'
    ];
    
    // Bike categories with subcategories
    private $bikeCategories = [
        'Mountain Bikes' => [
            'Cross-Country (XC)', 'Trail', 'Enduro', 'Downhill',
            'Fat Bikes', 'Hardtail', 'Full Suspension'
        ],
        'Road Bikes' => [
            'Racing', 'Endurance', 'Gravel', 'Cyclocross', 'Time Trial',
            'Triathlon', 'Touring'
        ],
        'Hybrid & Commuter' => [
            'City Bikes', 'Commuter', 'Comfort', 'Fitness', 'Dutch Style'
        ],
        'Electric Bikes' => [
            'E-Mountain', 'E-Road', 'E-City', 'E-Cargo', 'E-Folding'
        ],
        'Kids Bikes' => [
            'Balance Bikes', 'Kids Mountain', 'Kids Road', 'BMX Kids'
        ],
        'Specialty' => [
            'BMX', 'Folding', 'Cargo', 'Tandem', 'Recumbent', 'Unicycles'
        ]
    ];
    
    // Accessories and parts
    private $accessories = [
        'Helmets' => ['Road Helmets', 'MTB Helmets', 'Kids Helmets', 'Commuter Helmets'],
        'Clothing' => ['Jerseys', 'Shorts', 'Jackets', 'Gloves', 'Shoes', 'Socks'],
        'Components' => ['Groupsets', 'Wheels', 'Tires', 'Brakes', 'Chains', 'Cassettes'],
        'Accessories' => ['Lights', 'Locks', 'Pumps', 'Bottles', 'Bags', 'Computers'],
        'Maintenance' => ['Tools', 'Lubricants', 'Cleaners', 'Repair Kits']
    ];
    
    // Colors
    private $colors = [
        'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange',
        'Silver', 'Grey', 'Purple', 'Pink', 'Matte Black', 'Gloss White',
        'Carbon', 'Titanium', 'Neon Green', 'Electric Blue'
    ];
    
    // Sizes
    private $bikeSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    private $clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    private $kidsSizes = ['12"', '14"', '16"', '18"', '20"', '24"'];

    public function run(): void
    {
        $this->faker = Faker::create();
        
        echo "🚴 Starting Oshocks Product Seeding...\n\n";
        
        // Step 1: Create categories
        echo "📁 Creating categories...\n";
        $this->createCategories();
        
        // Step 2: Create seller accounts
        echo "👥 Creating seller accounts...\n";
        $this->createSellers();
        
        // Step 3: Create bike products
        echo "🚲 Creating bike products...\n";
        $this->createBikeProducts(800); // 800 bikes
        
        // Step 4: Create accessory products
        echo "🎒 Creating accessory products...\n";
        $this->createAccessoryProducts(300); // 300 accessories
        
        echo "\n✅ Seeding completed successfully!\n";
        echo "📊 Total products created: 1100+\n";
        echo "📁 Total categories: " . Category::count() . "\n";
        echo "👥 Total sellers: " . count($this->sellers) . "\n";
    }
    
    private function createCategories()
    {
        // Create main bike categories
        foreach ($this->bikeCategories as $mainCat => $subCats) {
            $parent = Category::create([
                'name' => $mainCat,
                'slug' => Str::slug($mainCat),
                'description' => "Explore our collection of {$mainCat}",
                'is_active' => true,
                'display_order' => 0,
            ]);
            
            $this->categories[$mainCat] = $parent;
            
            // Create subcategories
            foreach ($subCats as $subCat) {
                $child = Category::create([
                    'name' => $subCat,
                    'slug' => Str::slug($subCat),
                    'parent_id' => $parent->id,
                    'description' => "Shop {$subCat} bikes",
                    'is_active' => true,
                    'display_order' => 0,
                ]);
                
                $this->categories[$mainCat . '|' . $subCat] = $child;
            }
        }
        
        // Create accessory categories
        foreach ($this->accessories as $mainCat => $subCats) {
            $parent = Category::create([
                'name' => $mainCat,
                'slug' => Str::slug($mainCat),
                'description' => "Browse {$mainCat} for cycling",
                'is_active' => true,
                'display_order' => 0,
            ]);
            
            $this->categories[$mainCat] = $parent;
            
            foreach ($subCats as $subCat) {
                $child = Category::create([
                    'name' => $subCat,
                    'slug' => Str::slug($subCat),
                    'parent_id' => $parent->id,
                    'description' => "Shop {$subCat}",
                    'is_active' => true,
                    'display_order' => 0,
                ]);
                
                $this->categories[$mainCat . '|' . $subCat] = $child;
            }
        }
    }
    
    private function createSellers()
    {
        // Create Oshocks as main seller
        $oshocksUser = User::create([
            'name' => 'Oshocks Junior Bike Shop',
            'email' => 'sales@oshocks.co.ke',
            'password' => bcrypt('password'),
            'phone' => '+254712345678',
            'role' => 'seller',
            'is_active' => true,
        ]);
        
        $oshocks = SellerProfile::create([
            'user_id' => $oshocksUser->id,
            'business_name' => 'Oshocks Junior Bike Shop',
            'business_description' => 'Kenya\'s premier cycling shop offering quality bikes and accessories',
            'business_address' => 'Nairobi, Kenya',
            'business_phone' => '+254712345678',
            'business_email' => 'sales@oshocks.co.ke',
            'status' => 'approved',
            'commission_rate' => 0,
            'is_verified' => true,
        ]);
        
        $this->sellers[] = $oshocks;
        
        // Create 9 more sellers
        $sellerNames = [
            'Nairobi Bikes Hub', 'Mountain Peak Cycles', 'Velocity Bike Store',
            'Pedal Power Kenya', 'Cycle Zone', 'Bike Masters KE',
            'Urban Riders', 'Trail Blazers Bikes', 'Coast Cycles'
        ];
        
        foreach ($sellerNames as $name) {
            $user = User::create([
                'name' => $name,
                'email' => Str::slug($name) . '@bikes.co.ke',
                'password' => bcrypt('password'),
                'phone' => '+2547' . rand(10000000, 99999999),
                'role' => 'seller',
                'is_active' => true,
            ]);
            
            $seller = SellerProfile::create([
                'user_id' => $user->id,
                'business_name' => $name,
                'business_description' => $this->faker->sentence(10),
                'business_address' => $this->faker->city() . ', Kenya',
                'business_phone' => '+2547' . rand(10000000, 99999999),
                'business_email' => Str::slug($name) . '@bikes.co.ke',
                'status' => 'approved',
                'commission_rate' => rand(5, 15),
                'is_verified' => rand(0, 1) ? true : false,
            ]);
            
            $this->sellers[] = $seller;
        }
    }
    
    private function createBikeProducts($count)
    {
        $productsCreated = 0;
        
        foreach ($this->bikeCategories as $mainCat => $subCats) {
            $productsPerSubcat = (int)($count / (count($this->bikeCategories) * count($subCats)));
            
            foreach ($subCats as $subCat) {
                $categoryKey = $mainCat . '|' . $subCat;
                $category = $this->categories[$categoryKey];
                
                for ($i = 0; $i < $productsPerSubcat; $i++) {
                    $brand = $this->brands[array_rand($this->brands)];
                    $model = $this->faker->word() . ' ' . rand(100, 999);
                    $year = rand(2020, 2024);
                    
                    $name = "{$brand} {$model} {$year} {$subCat}";
                    $price = $this->generateBikePrice($subCat);
                    
                    $product = Product::create([
                        'seller_id' => $this->sellers[array_rand($this->sellers)]->id,
                        'category_id' => $category->id,
                        'name' => $name,
                        'slug' => Str::slug($name) . '-' . Str::random(6),
                        'description' => $this->generateBikeDescription($brand, $subCat),
                        'price' => $price,
                        'compare_price' => $price * 1.2,
                        'cost_price' => $price * 0.7,
                        'sku' => strtoupper(Str::random(8)),
                        'barcode' => rand(1000000000000, 9999999999999),
                        'quantity' => rand(0, 50),
                        'weight' => rand(8, 15) . '.00',
                        'dimensions' => rand(150, 200) . 'x' . rand(50, 80) . 'x' . rand(80, 120),
                        'brand' => $brand,
                        'condition' => 'new',
                        'warranty_period' => rand(12, 36),
                        'meta_title' => $name,
                        'meta_description' => substr($this->generateBikeDescription($brand, $subCat), 0, 160),
                        'is_active' => true,
                        'is_featured' => rand(0, 10) > 7,
                        'views_count' => rand(0, 500),
                    ]);
                    
                    // Create variants (sizes and colors)
                    $this->createBikeVariants($product);
                    
                    // Create images
                    $this->createProductImages($product, 'bike');
                    
                    $productsCreated++;
                }
            }
        }
        
        echo "  ✓ Created {$productsCreated} bike products\n";
    }
    
    private function createAccessoryProducts($count)
    {
        $productsCreated = 0;
        
        foreach ($this->accessories as $mainCat => $subCats) {
            $productsPerSubcat = (int)($count / (count($this->accessories) * count($subCats)));
            
            foreach ($subCats as $subCat) {
                $categoryKey = $mainCat . '|' . $subCat;
                $category = $this->categories[$categoryKey];
                
                for ($i = 0; $i < $productsPerSubcat; $i++) {
                    $brand = $this->brands[array_rand($this->brands)];
                    $name = "{$brand} {$subCat} " . $this->faker->word();
                    $price = $this->generateAccessoryPrice($subCat);
                    
                    $product = Product::create([
                        'seller_id' => $this->sellers[array_rand($this->sellers)]->id,
                        'category_id' => $category->id,
                        'name' => $name,
                        'slug' => Str::slug($name) . '-' . Str::random(6),
                        'description' => $this->generateAccessoryDescription($subCat),
                        'price' => $price,
                        'compare_price' => $price * 1.15,
                        'cost_price' => $price * 0.6,
                        'sku' => strtoupper(Str::random(8)),
                        'barcode' => rand(1000000000000, 9999999999999),
                        'quantity' => rand(10, 200),
                        'weight' => rand(1, 5) . '.00',
                        'brand' => $brand,
                        'condition' => 'new',
                        'warranty_period' => rand(6, 24),
                        'meta_title' => $name,
                        'is_active' => true,
                        'is_featured' => rand(0, 10) > 8,
                        'views_count' => rand(0, 300),
                    ]);
                    
                    // Create variants for clothing/helmets
                    if (in_array($mainCat, ['Helmets', 'Clothing'])) {
                        $this->createAccessoryVariants($product, $mainCat);
                    }
                    
                    // Create images
                    $this->createProductImages($product, 'accessory');
                    
                    $productsCreated++;
                }
            }
        }
        
        echo "  ✓ Created {$productsCreated} accessory products\n";
    }
    
    private function createBikeVariants($product)
    {
        $numSizes = rand(3, 6);
        $sizes = array_slice($this->bikeSizes, 0, $numSizes);
        $numColors = rand(2, 4);
        $colors = array_rand(array_flip($this->colors), $numColors);
        
        foreach ($sizes as $size) {
            foreach ($colors as $color) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku . '-' . $size . '-' . substr($color, 0, 3) . '-' . rand(100, 999),
                    'name' => "Size {$size} - {$color}",
                    'price' => $product->price,
                    'quantity' => rand(0, 10),
                    'attributes' => json_encode([
                        'size' => $size,
                        'color' => $color,
                    ]),
                ]);
            }
        }
    }
    
    private function createAccessoryVariants($product, $category)
    {
        if ($category === 'Helmets') {
            $sizes = ['S', 'M', 'L', 'XL'];
        } else {
            $sizes = $this->clothingSizes;
        }
        
        $numColors = rand(2, 3);
        $colors = array_rand(array_flip($this->colors), $numColors);
        
        foreach ($sizes as $size) {
            foreach ($colors as $color) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku . '-' . $size . '-' . substr($color, 0, 3) . '-' . rand(100, 999),
                    'name' => "Size {$size} - {$color}",
                    'price' => $product->price,
                    'quantity' => rand(5, 30),
                    'attributes' => json_encode([
                        'size' => $size,
                        'color' => $color,
                    ]),
                ]);
            }
        }
    }
    
    private function createProductImages($product, $type)
    {
        $numImages = rand(3, 6);
        
        for ($i = 0; $i < $numImages; $i++) {
            // Using placeholder image services
            $imageUrl = "https://placehold.co/800x600/png?text=" . urlencode($product->name);
            
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $imageUrl,
                'alt_text' => $product->name,
                'is_primary' => $i === 0,
                'display_order' => $i,
            ]);
        }
    }
    
    private function generateBikePrice($category)
    {
        $priceRanges = [
            'Cross-Country (XC)' => [80000, 350000],
            'Trail' => [70000, 300000],
            'Enduro' => [150000, 500000],
            'Downhill' => [200000, 600000],
            'Fat Bikes' => [90000, 250000],
            'Racing' => [120000, 800000],
            'Endurance' => [100000, 400000],
            'Gravel' => [80000, 350000],
            'E-Mountain' => [200000, 700000],
            'E-Road' => [180000, 650000],
            'E-City' => [120000, 350000],
            'Kids Mountain' => [15000, 50000],
            'Balance Bikes' => [8000, 25000],
            'BMX' => [20000, 80000],
            'Folding' => [30000, 150000],
        ];
        
        $range = $priceRanges[$category] ?? [50000, 200000];
        return rand($range[0], $range[1]);
    }
    
    private function generateAccessoryPrice($category)
    {
        $priceRanges = [
            'Road Helmets' => [3000, 15000],
            'MTB Helmets' => [3500, 18000],
            'Jerseys' => [2000, 8000],
            'Shorts' => [2500, 10000],
            'Shoes' => [5000, 25000],
            'Groupsets' => [30000, 200000],
            'Wheels' => [15000, 150000],
            'Tires' => [2000, 8000],
            'Lights' => [1500, 8000],
            'Locks' => [1000, 5000],
            'Tools' => [500, 10000],
        ];
        
        $range = $priceRanges[$category] ?? [1000, 10000];
        return rand($range[0], $range[1]);
    }
    
    private function generateBikeDescription($brand, $category)
    {
        $descriptions = [
            "The {$brand} {$category} combines cutting-edge technology with exceptional performance. Features a lightweight carbon frame, premium components, and advanced suspension system for ultimate riding experience.",
            "Experience unmatched performance with this {$brand} {$category}. Designed for serious riders who demand the best, featuring industry-leading components and innovative engineering.",
            "This {$brand} {$category} sets the standard for excellence. With its aerodynamic design, responsive handling, and durable construction, it's built to conquer any terrain.",
            "Engineered for perfection, the {$brand} {$category} delivers exceptional value. Features precision craftsmanship, reliable components, and a geometry optimized for all-day comfort.",
        ];
        
        return $descriptions[array_rand($descriptions)];
    }
    
    private function generateAccessoryDescription($category)
    {
        return "Premium quality {$category} designed for serious cyclists. Features advanced materials, excellent durability, and superior performance. Perfect for both casual riders and professional athletes.";
    }
}

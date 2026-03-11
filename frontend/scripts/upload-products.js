require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Cloudinary configuration from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Database configuration from env
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

// Seller ID from env
const SELLER_ID = parseInt(process.env.SELLER_ID) || 4;

// Image directory from env
const IMAGE_DIR = process.env.IMAGE_DIR || '/home/msf_bennett/Downloads/oshocks';

// Validate required env variables
function validateEnv() {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded successfully');
  console.log(`   Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Seller ID: ${SELLER_ID}`);
  console.log(`   Image Dir: ${IMAGE_DIR}\n`);
}

// Product mappings based on your images
const products = [
  {
    file: 'mountain-bike-1.png',
    name: 'Mountain Bike Pro',
    description: 'High-performance mountain bike designed for rugged terrains. Features durable frame, advanced suspension, and professional-grade components perfect for trail riding and mountain adventures.',
    type: 'bike',
    category_id: 1,
    price: 45000,
    quantity: 5,
    condition: 'new',
    year: 2024,
    brand: 'ProMountain'
  },
  {
    file: 'road-bike-1.png',
    name: 'Road Bike Elite',
    description: 'Premium road bike built for speed and endurance. Lightweight carbon frame, aerodynamic design, and high-end gearing system for competitive racing and long-distance rides.',
    type: 'bike',
    category_id: 2,
    price: 52000,
    quantity: 3,
    condition: 'new',
    year: 2024,
    brand: 'SpeedMax'
  },
  {
    file: 'road-bike-2.png',
    name: 'Road Bike Sport',
    description: 'Versatile road bike perfect for fitness riding and commuting. Comfortable geometry, reliable components, and excellent value for everyday cyclists.',
    type: 'bike',
    category_id: 2,
    price: 38000,
    quantity: 7,
    condition: 'new',
    year: 2024,
    brand: 'UrbanRide'
  },
  {
    file: 'cardio-cycling-stationery-training-bike.png',
    name: 'Stationary Training Bike',
    description: 'Professional indoor cycling bike for cardio workouts and training. Adjustable resistance, digital display, and ergonomic design for home gym setups.',
    type: 'bike',
    category_id: 4,
    price: 65000,
    quantity: 4,
    condition: 'new',
    year: 2024,
    brand: 'CardioFit'
  },
  {
    file: 'cycling-helmet.png',
    name: 'Cycling Helmet Premium',
    description: 'Advanced safety helmet with MIPS technology, aerodynamic ventilation, and lightweight construction. Meets highest safety standards for road and mountain cycling.',
    type: 'accessory',
    category_id: 5,
    price: 3500,
    quantity: 20,
    condition: 'new',
    brand: 'SafeRide'
  },
  {
    file: 'cycling-glasses.png',
    name: 'Cycling Glasses Pro',
    description: 'High-performance cycling sunglasses with UV protection, anti-fog coating, and interchangeable lenses. Lightweight frame designed for comfort during long rides.',
    type: 'accessory',
    category_id: 7,
    price: 2500,
    quantity: 15,
    condition: 'new',
    brand: 'VisionPro'
  },
  {
    file: 'cycling-shoes-1',
    name: 'Cycling Shoes Elite',
    description: 'Professional cycling shoes with carbon fiber sole, precise fit system, and excellent power transfer. Compatible with all major clipless pedal systems.',
    type: 'accessory',
    category_id: 7,
    price: 8500,
    quantity: 10,
    condition: 'new',
    brand: 'SpeedStep'
  },
  {
    file: 'biker-short-1.png',
    name: 'Biker Shorts Pro',
    description: 'Premium padded cycling shorts with moisture-wicking fabric, ergonomic chamois, and compression fit. Designed for long-distance comfort and performance.',
    type: 'accessory',
    category_id: 7,
    price: 1800,
    quantity: 25,
    condition: 'new',
    brand: 'ComfortRide'
  },
  {
    file: 'drop-bar.png',
    name: 'Drop Handlebar',
    description: 'High-quality drop handlebar for road bikes. Lightweight aluminum construction, ergonomic design, and compatible with standard stem clamps.',
    type: 'accessory',
    category_id: 8,
    price: 4200,
    quantity: 12,
    condition: 'new',
    brand: 'ControlPro'
  },
  {
    file: 'spedometer-1.png',
    name: 'Cycling Speedometer',
    description: 'Digital bike computer with GPS tracking, speed, distance, and time metrics. Waterproof design with backlit display for all-weather riding.',
    type: 'accessory',
    category_id: 7,
    price: 3200,
    quantity: 18,
    condition: 'new',
    brand: 'TrackMax'
  },
  {
    file: 'water-bottle.png',
    name: 'Cycling Water Bottle',
    description: 'Insulated cycling water bottle keeps drinks cold for hours. Leak-proof design, easy-squeeze body, and fits standard bottle cages.',
    type: 'accessory',
    category_id: 7,
    price: 800,
    quantity: 50,
    condition: 'new',
    brand: 'HydroRide'
  },
  {
    file: 'far-horizon-mens-pro-jersey.png',
    name: 'Cycling Jersey Pro',
    description: 'Professional cycling jersey with breathable fabric, full-length zipper, and rear pockets. Moisture-wicking technology for optimal comfort.',
    type: 'accessory',
    category_id: 7,
    price: 2800,
    quantity: 20,
    condition: 'new',
    brand: 'AeroWear'
  }
];

// Generate SKU
function generateSKU(name) {
  const prefix = name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
  const unique = Date.now().toString(36).substring(0, 4).toUpperCase();
  return `SKU-${prefix}-${unique}`;
}

// Generate slug
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

// Find file with or without extension
function findFile(filename) {
  const directPath = path.join(IMAGE_DIR, filename);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  
  // Try adding .png extension
  const withExt = path.join(IMAGE_DIR, filename + '.png');
  if (fs.existsSync(withExt)) {
    return withExt;
  }
  
  // List directory and find matching file
  const files = fs.readdirSync(IMAGE_DIR);
  const match = files.find(f => f.startsWith(filename));
  if (match) {
    return path.join(IMAGE_DIR, match);
  }
  
  return null;
}

// Upload image to Cloudinary
async function uploadToCloudinary(filePath, productName) {
  try {
    console.log(`📤 Uploading ${path.basename(filePath)} to Cloudinary...`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return null;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'oshocks/products',
      public_id: `product_${Date.now()}_${path.basename(filePath, path.extname(filePath))}`,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log(`✅ Uploaded: ${result.secure_url}`);
    
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 300,
      height: 300,
      crop: 'fill',
      secure: true
    });

    return {
      image_url: result.secure_url,
      public_id: result.public_id,
      thumbnail_url: thumbnailUrl
    };
  } catch (error) {
    console.error(`❌ Cloudinary upload failed for ${filePath}:`, error.message);
    return null;
  }
}

// Insert product into database - FIXED: escaped reserved keywords
async function insertProduct(connection, product, imageData) {
  try {
    const sku = generateSKU(product.name);
    const slug = generateSlug(product.name);
    
    // FIXED: Added backticks around `condition` since it's a reserved keyword
    const [result] = await connection.execute(
      `INSERT INTO products (
        seller_id, name, slug, description, type, category_id, 
        price, quantity, \`condition\`, year, brand, sku, 
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        SELLER_ID,
        product.name,
        slug,
        product.description,
        product.type,
        product.category_id,
        product.price,
        product.quantity,
        product.condition,
        product.year || null,
        product.brand || null,
        sku,
        true
      ]
    );

    const productId = result.insertId;
    console.log(`✅ Created product: ${product.name} (ID: ${productId})`);

    if (imageData) {
      await connection.execute(
        `INSERT INTO product_images (
          product_id, image_url, public_id, thumbnail_url, 
          is_primary, display_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          productId,
          imageData.image_url,
          imageData.public_id,
          imageData.thumbnail_url,
          true,
          1
        ]
      );
      console.log(`✅ Linked image to product`);
    }

    return productId;
  } catch (error) {
    console.error(`❌ Failed to insert product ${product.name}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  let connection;
  
  try {
    console.log('=== 🚴 OSHOCKS PRODUCT UPLOADER ===\n');
    
    validateEnv();
    
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected\n');

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      console.log(`\n--- Processing: ${product.name} ---`);
      
      // Use findFile to handle files with or without extensions
      const filePath = findFile(product.file);
      
      if (!filePath) {
        console.error(`❌ File not found: ${product.file} (tried with and without .png)`);
        failCount++;
        continue;
      }
      
      const imageData = await uploadToCloudinary(filePath, product.name);
      
      if (!imageData) {
        console.error(`❌ Skipping ${product.name} due to image upload failure`);
        failCount++;
        continue;
      }

      const productId = await insertProduct(connection, product, imageData);
      
      if (productId) {
        successCount++;
      } else {
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n=== 📊 UPLOAD COMPLETE ===`);
    console.log(`✅ Success: ${successCount} products`);
    console.log(`❌ Failed: ${failCount} products`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

main();

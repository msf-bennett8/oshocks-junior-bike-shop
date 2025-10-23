#!/bin/bash

# Configuration
API_URL="https://oshocks-junior-bike-shop-backend.onrender.com/api/v1"
TOKEN="74|LWFgNOJsruu3P9loG9XftJBGm2egwRha7odaEzpx1fd7ecda"
BASE_DIR="$HOME/ctrl.dev/studio.dev/oshocks/backend/product_images"

# Product 1: Trek Marlin 7 Mountain Bike
echo "=== Uploading Product 1: Trek Marlin 7 Mountain Bike ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Trek Marlin 7 Mountain Bike 2024" \
  -F "description=The Trek Marlin 7 is a cross-country mountain bike built to give you an efficient off-road ride with a suspension fork that locks out, and smoother-shifting 1x drivetrain. Marlin 7 is a great choice for riders who want to take on technical trails and gravel paths with confidence. It features a lightweight aluminum frame, modern geometry for stable handling, 29-inch wheels, and upgraded components like a 1x drivetrain and a dropper post for extra control on descents." \
  -F "type=bike" \
  -F "category_id=1" \
  -F "brand_id=Trek" \
  -F "price=125000" \
  -F "quantity=5" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"Alpha Silver Aluminum","wheel_size":"29 inches","gear_system":"Shimano Deore 1x12","brake_type":"Shimano MT200 hydraulic disc","weight":"14.2 kg"}' \
  -F 'sizes=[{"id":1,"name":"Small (15.5\")","value":"S","available":true,"recommended":"5.3ft - 5.6ft"},{"id":2,"name":"Medium (17.5\")","value":"M","available":true,"recommended":"5.6ft - 5.10ft"},{"id":3,"name":"Large (19.5\")","value":"L","available":true,"recommended":"5.10ft - 6.2ft"},{"id":4,"name":"X-Large (21.5\")","value":"XL","available":true,"recommended":"6.2ft - 6.5ft"}]' \
  -F 'keyFeatures=[{"id":1,"text":"RockShox Judy Silver TK fork with 100mm travel"},{"id":2,"text":"Shimano Deore 1x12 drivetrain"},{"id":3,"text":"Internal routing keeps cables protected"},{"id":4,"text":"Boost110 front and Boost148 rear spacing"}]' \
  -F "colors[0][name]=Matte Trek Black" \
  -F "colors[0][images][]=@$BASE_DIR/product_1/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_1/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_1/image3.jpg"

echo -e "\n\n"

# Product 2: Specialized Allez Sprint Road Bike
echo "=== Uploading Product 2: Specialized Allez Sprint Road Bike ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Specialized Allez Sprint Comp Disc Road Bike" \
  -F "description=Built for speed and competition, the Allez Sprint Comp Disc delivers pro-level performance at an accessible price. This road bike features a responsive aluminum frame with aggressive race geometry, powerful hydraulic disc brakes, and a precise Shimano 105 Di2 electronic drivetrain. Perfect for criteriums, road racing, or fast group rides." \
  -F "type=bike" \
  -F "category_id=2" \
  -F "brand_id=Specialized" \
  -F "price=189000" \
  -F "quantity=3" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"Premium E5 Aluminum","wheel_size":"700c","gear_system":"Shimano 105 Di2 2x11","brake_type":"Shimano 105 hydraulic disc","weight":"8.5 kg"}' \
  -F 'sizes=[{"id":1,"name":"52cm","value":"52","available":true,"recommended":"5.4ft - 5.7ft"},{"id":2,"name":"54cm","value":"54","available":true,"recommended":"5.7ft - 5.10ft"},{"id":3,"name":"56cm","value":"56","available":true,"recommended":"5.10ft - 6.1ft"},{"id":4,"name":"58cm","value":"58","available":false,"recommended":"6.1ft - 6.3ft"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Race-proven sprint geometry for explosive acceleration"},{"id":2,"text":"Electronic shifting for lightning-fast gear changes"},{"id":3,"text":"Carbon fiber fork with tapered steerer"},{"id":4,"text":"Internal cable routing for clean aesthetics"}]' \
  -F "colors[0][name]=Gloss Dove Gray" \
  -F "colors[0][images][]=@$BASE_DIR/product_2/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_2/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_2/image3.jpg"

echo -e "\n\n"

# Product 3: Giant Talon E+ Electric Mountain Bike
echo "=== Uploading Product 3: Giant Talon E+ Electric MTB ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Giant Talon E+ 2 Electric Mountain Bike" \
  -F "description=Experience the thrill of electric mountain biking with the Giant Talon E+ 2. This capable e-MTB features Giant's SyncDrive Core motor system, providing smooth, natural pedal assistance up to 25km/h. With a 400Wh battery, 100mm front suspension, and reliable 1x9 drivetrain, it's perfect for trail riding, commuting, or exploring new terrain with confidence." \
  -F "type=bike" \
  -F "category_id=4" \
  -F "brand_id=Giant" \
  -F "price=245000" \
  -F "quantity=4" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"ALUXX-Grade Aluminum","wheel_size":"27.5 inches","gear_system":"Shimano Altus 1x9","brake_type":"Tektro HD-M275 hydraulic disc","weight":"22.5 kg","motor":"SyncDrive Core 60Nm","battery":"400Wh"}' \
  -F 'sizes=[{"id":1,"name":"Small","value":"S","available":true,"recommended":"5.2ft - 5.6ft"},{"id":2,"name":"Medium","value":"M","available":true,"recommended":"5.6ft - 5.11ft"},{"id":3,"name":"Large","value":"L","available":true,"recommended":"5.11ft - 6.2ft"}]' \
  -F 'keyFeatures=[{"id":1,"text":"250W SyncDrive Core motor with 60Nm torque"},{"id":2,"text":"400Wh integrated battery with 80km range"},{"id":3,"text":"RideControl ONE handlebar controller"},{"id":4,"text":"SR Suntour XCT-E fork with 100mm travel"}]' \
  -F "colors[0][name]=Metallic Black" \
  -F "colors[0][images][]=@$BASE_DIR/product_3/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_3/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_3/image3.jpg"

echo -e "\n\n"

# Product 4: Bell Super Air R MIPS Helmet
echo "=== Uploading Product 4: Bell Super Air R MIPS Helmet ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Bell Super Air R MIPS MTB Helmet" \
  -F "description=The Bell Super Air R MIPS is a premium mountain bike helmet designed for aggressive trail and enduro riding. Featuring MIPS technology for enhanced protection, excellent ventilation with 24 vents, and a goggle-compatible design with breakaway visor. The Integrated Overbrow Ventilation system channels air through the helmet while maintaining structural integrity." \
  -F "type=accessory" \
  -F "category_id=5" \
  -F "brand_id=Bell" \
  -F "price=18500" \
  -F "quantity=12" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"375g","certification":"CPSC Bicycle, CE EN1078"}' \
  -F 'sizes=[{"id":1,"name":"Small (52-56cm)","value":"S","available":true,"recommended":"20.5-22 inches"},{"id":2,"name":"Medium (55-59cm)","value":"M","available":true,"recommended":"21.7-23.2 inches"},{"id":3,"name":"Large (58-62cm)","value":"L","available":true,"recommended":"22.8-24.4 inches"}]' \
  -F 'keyFeatures=[{"id":1,"text":"MIPS brain protection system"},{"id":2,"text":"24 vents with Integrated Overbrow Ventilation"},{"id":3,"text":"Goggle-compatible design with breakaway visor"},{"id":4,"text":"Fidlock magnetic buckle for easy one-handed use"}]' \
  -F "colors[0][name]=Matte Black/Crimson" \
  -F "colors[0][images][]=@$BASE_DIR/product_4/image1.jpg"

echo -e "\n\n"

# Product 5: Cannondale Trail 8 Hardtail MTB
echo "=== Uploading Product 5: Cannondale Trail 8 Mountain Bike ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Cannondale Trail 8 29er Hardtail Mountain Bike" \
  -F "description=The Cannondale Trail 8 offers exceptional value for recreational mountain bikers. Built on Cannondale's lightweight SmartForm C3 Alloy frame with modern trail geometry, it features 29-inch wheels for smooth rolling, a 100mm SR Suntour fork, and reliable Shimano components. Perfect for XC trails, light technical terrain, and fitness riding." \
  -F "type=bike" \
  -F "category_id=1" \
  -F "brand_id=Cannondale" \
  -F "price=98000" \
  -F "quantity=6" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"SmartForm C3 Alloy","wheel_size":"29 inches","gear_system":"Shimano Altus 2x9","brake_type":"Tektro mechanical disc","weight":"14.8 kg"}' \
  -F 'sizes=[{"id":1,"name":"Small","value":"S","available":true,"recommended":"5.3ft - 5.7ft"},{"id":2,"name":"Medium","value":"M","available":true,"recommended":"5.7ft - 6.0ft"},{"id":3,"name":"Large","value":"L","available":true,"recommended":"6.0ft - 6.3ft"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Lightweight SmartForm C3 Alloy frame"},{"id":2,"text":"SR Suntour XCT-HLO 100mm fork"},{"id":3,"text":"29-inch double wall wheels"},{"id":4,"text":"Internal cable routing"}]' \
  -F "colors[0][name]=Alpine Blue" \
  -F "colors[0][images][]=@$BASE_DIR/product_5/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_5/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_5/image3.jpg"

echo -e "\n\n"

# Product 6: Lezyne Macro Drive 1300XL Front Light
echo "=== Uploading Product 6: Lezyne Macro Drive 1300XL ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Lezyne Macro Drive 1300XL Front Light" \
  -F "description=The Lezyne Macro Drive 1300XL is a powerful, USB-C rechargeable front light perfect for road cycling and commuting. With 1300 lumens maximum output, 9 lighting modes, and up to 38 hours runtime on low, this light keeps you visible and safe. Features include side visibility ports, lightweight CNC machined aluminum construction, and IPX7 waterproof rating." \
  -F "type=accessory" \
  -F "category_id=6" \
  -F "brand_id=Lezyne" \
  -F "price=8500" \
  -F "quantity=20" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"180g","lumens":"1300","battery":"5000mAh","charge_time":"5 hours"}' \
  -F 'sizes=[{"id":1,"name":"Universal","value":"One Size","available":true,"recommended":"22.2-35mm handlebars"}]' \
  -F 'keyFeatures=[{"id":1,"text":"1300 lumen maximum output"},{"id":2,"text":"USB-C fast charging (5 hours)"},{"id":3,"text":"9 output modes including Day Flash"},{"id":4,"text":"IPX7 waterproof rating"}]' \
  -F "colors[0][name]=Black" \
  -F "colors[0][images][]=@$BASE_DIR/product_6/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_6/image2.jpg"

echo -e "\n\n"

# Product 7: Kryptonite Evolution Series 4 U-Lock
echo "=== Uploading Product 7: Kryptonite Evolution Series 4 ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Kryptonite Evolution Series 4 U-Lock with Cable" \
  -F "description=Gold-rated security for high-crime areas. The Kryptonite Evolution Series 4 features a 14mm hardened steel shackle, anti-drill, anti-pull cylinder protection, and comes with a 4-foot flex cable for securing wheels. Includes 3 stainless steel keys (one with LED light) and Kryptonite's Anti-Theft Protection Offer registration." \
  -F "type=accessory" \
  -F "category_id=7" \
  -F "brand_id=Kryptonite" \
  -F "price=6800" \
  -F "quantity=15" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"1.95 kg","shackle_diameter":"14mm","dimensions":"10.2cm x 22.9cm"}' \
  -F 'sizes=[{"id":1,"name":"Standard","value":"One Size","available":true,"recommended":"Universal"}]' \
  -F 'keyFeatures=[{"id":1,"text":"14mm hardened MAX-Performance steel shackle"},{"id":2,"text":"Anti-drill and anti-pick cylinder"},{"id":3,"text":"Transit FlexFrame-U bracket included"},{"id":4,"text":"Kryptonite Anti-Theft Protection Offer"}]' \
  -F "colors[0][name]=Black/Yellow" \
  -F "colors[0][images][]=@$BASE_DIR/product_7/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_7/image3.jpg"

echo -e "\n\n"

# Product 8: Scott Scale 970 Cross Country MTB
echo "=== Uploading Product 8: Scott Scale 970 XC Race Bike ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Scott Scale 970 Carbon Hardtail Race Bike" \
  -F "description=Race-ready performance meets incredible value in the Scott Scale 970. This carbon hardtail features a lightweight HMF carbon frame, 100mm RockShox Judy fork, Shimano Deore 1x12 drivetrain, and 29-inch wheels. Designed for XC racing and fast trail riding, it delivers pedaling efficiency and climbing prowess without compromise." \
  -F "type=bike" \
  -F "category_id=1" \
  -F "brand_id=Scott" \
  -F "price=165000" \
  -F "quantity=3" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"HMF Carbon Fiber","wheel_size":"29 inches","gear_system":"Shimano Deore 1x12","brake_type":"Shimano MT200 hydraulic disc","weight":"11.8 kg"}' \
  -F 'sizes=[{"id":1,"name":"Small","value":"S","available":true,"recommended":"5.3ft - 5.7ft"},{"id":2,"name":"Medium","value":"M","available":true,"recommended":"5.7ft - 6.0ft"},{"id":3,"name":"Large","value":"L","available":false,"recommended":"6.0ft - 6.3ft"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Lightweight HMF carbon frame"},{"id":2,"text":"RockShox Judy Silver TK 100mm fork"},{"id":3,"text":"Shimano Deore 12-speed drivetrain"},{"id":4,"text":"Race-oriented XC geometry"}]' \
  -F "colors[0][name]=Black/Yellow" \
  -F "colors[0][images][]=@$BASE_DIR/product_8/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_8/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_8/image3.jpg"

echo -e "\n\n"

# Product 9: Shimano XT M8100 Disc Brake Set
echo "=== Uploading Product 9: Shimano XT M8100 Hydraulic Disc Brakes ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Shimano XT M8100 Hydraulic Disc Brake Set" \
  -F "description=Professional-grade stopping power with the Shimano XT M8100 hydraulic disc brake set. Features improved brake modulation, powerful 4-piston calipers, and tool-free reach adjust. Includes 160mm Ice-Tech rotors with Freeza technology for better heat management. Perfect upgrade for trail, enduro, and all-mountain riding." \
  -F "type=accessory" \
  -F "category_id=10" \
  -F "brand_id=Shimano" \
  -F "price=32000" \
  -F "quantity=8" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"348g per wheel","rotor_size":"160mm","pad_type":"Resin"}' \
  -F 'sizes=[{"id":1,"name":"Front & Rear Set","value":"Set","available":true,"recommended":"Universal"}]' \
  -F 'keyFeatures=[{"id":1,"text":"4-piston calipers for maximum power"},{"id":2,"text":"Ice-Tech rotors with Freeza technology"},{"id":3,"text":"Tool-free reach and contact point adjust"},{"id":4,"text":"Servo Wave technology for improved modulation"}]' \
  -F "colors[0][name]=Black" \
  -F "colors[0][images][]=@$BASE_DIR/product_9/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_9/image3.jpg"

echo -e "\n\n"

# Product 10: Woom 4 Kids Bike 20"
echo "=== Uploading Product 10: Woom 4 Kids Bike ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Woom 4 Lightweight Kids Bike 20 inch" \
  -F "description=The Woom 4 is specifically designed for children aged 6-8 years. At just 7.9kg, it's one of the lightest 20-inch kids bikes available, making it easy for young riders to handle and control. Features include upright riding position, low standover height, kid-specific components, and 8-speed Shimano gearing. Available in vibrant colors kids love." \
  -F "type=bike" \
  -F "category_id=3" \
  -F "brand_id=Woom" \
  -F "price=45000" \
  -F "quantity=10" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"frame_material":"6061 Aluminum","wheel_size":"20 inches","gear_system":"Shimano 8-speed","brake_type":"V-brake front, coaster rear","weight":"7.9 kg"}' \
  -F 'sizes=[{"id":1,"name":"20 inch (6-8 years)","value":"20","available":true,"recommended":"45-51 inches height"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Ultra-lightweight 7.9kg frame"},{"id":2,"text":"Upright riding position for control"},{"id":3,"text":"SUREBRAKE braking power regulator"},{"id":4,"text":"Kid-specific narrow handlebars and grips"}]' \
  -F "colors[0][name]=Green" \
  -F "colors[0][images][]=@$BASE_DIR/product_10/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_10/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_10/image3.jpg"

echo -e "\n\n"

# Product 11: Continental Grand Prix 5000 Tire Set
echo "=== Uploading Product 11: Continental GP5000 Tire Set ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Continental Grand Prix 5000 Road Tire Set (700x25c)" \
  -F "description=The legendary Continental Grand Prix 5000 - the benchmark for road bike tires. Features Black Chili compound for exceptional grip, Vectran puncture protection breaker, and Active Comfort Technology. Perfect balance of low rolling resistance, durability, and grip in all conditions. Trusted by pro teams worldwide." \
  -F "type=accessory" \
  -F "category_id=9" \
  -F "brand_id=Continental" \
  -F "price=14500" \
  -F "quantity=25" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"215g per tire","size":"700x25c","tpi":"330"}' \
  -F 'sizes=[{"id":1,"name":"700x25c","value":"25","available":true,"recommended":"Road bikes"},{"id":2,"name":"700x28c","value":"28","available":true,"recommended":"Endurance/Gravel"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Black Chili compound for superior grip"},{"id":2,"text":"Vectran breaker puncture protection"},{"id":3,"text":"Active Comfort Technology for smoother ride"},{"id":4,"text":"Lazer Grip micro profile for wet weather"}]' \
  -F "colors[0][name]=Black/Black" \
  -F "colors[0][images][]=@$BASE_DIR/product_11/image1.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_11/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_11/image3.jpg"

echo -e "\n\n"

# Product 12: Park Tool Home Mechanic Repair Stand
echo "=== Uploading Product 12: Park Tool PCS-10.3 Repair Stand ==="
curl -X POST "$API_URL/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "name=Park Tool PCS-10.3 Home Mechanic Repair Stand" \
  -F "description=The Park Tool PCS-10.3 is the ultimate home bike repair stand. Features a heavy-duty steel construction, quick-release cam mechanism for secure clamping, 360-degree rotation, and micro-adjust clamp with 100mm of travel. Height adjusts from 40 to 57 inches. Folds for easy storage. Perfect for home mechanics and serious enthusiasts." \
  -F "type=accessory" \
  -F "category_id=8" \
  -F "brand_id=Park Tool" \
  -F "price=28500" \
  -F "quantity=6" \
  -F "condition=new" \
  -F "year=2024" \
  -F 'specifications={"weight":"8.6 kg","max_bike_weight":"36 kg","height_range":"40-57 inches"}' \
  -F 'sizes=[{"id":1,"name":"Standard","value":"One Size","available":true,"recommended":"Universal"}]' \
  -F 'keyFeatures=[{"id":1,"text":"Heavy-duty steel construction"},{"id":2,"text":"360-degree clamp rotation"},{"id":3,"text":"Quick-release cam mechanism"},{"id":4,"text":"Foldable tripod base for storage"}]' \
  -F "colors[0][name]=Blue/Silver" \
  -F "colors[0][images][]=@$BASE_DIR/product_12/image2.jpg" \
  -F "colors[0][images][]=@$BASE_DIR/product_12/image3.jpg"

echo "=== ALL PRODUCTS UPLOADED ==="

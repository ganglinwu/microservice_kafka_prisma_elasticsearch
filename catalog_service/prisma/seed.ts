import { PrismaClient } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

const techProducts = [
  { title: 'iPhone 15 Pro Max', description: 'Latest Apple smartphone with titanium design and advanced camera system', price: 1199.99, stock: 45, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500' },
  { title: 'MacBook Pro 16-inch M3', description: 'Professional laptop with M3 chip for developers and creators', price: 2499.99, stock: 20, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
  { title: 'iPad Air M2', description: 'Versatile tablet perfect for work and entertainment', price: 599.99, stock: 35, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
  { title: 'AirPods Pro 2nd Gen', description: 'Premium wireless earbuds with active noise cancellation', price: 249.99, stock: 80, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500' },
  { title: 'Apple Watch Series 9', description: 'Advanced smartwatch with health monitoring features', price: 399.99, stock: 60, image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500' },
  
  { title: 'Samsung Galaxy S24 Ultra', description: 'Flagship Android phone with S Pen and 200MP camera', price: 1299.99, stock: 30, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500' },
  { title: 'Samsung Galaxy Tab S9', description: 'Premium Android tablet for productivity and creativity', price: 799.99, stock: 25, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500' },
  { title: 'Samsung Galaxy Buds Pro', description: 'High-quality wireless earbuds with spatial audio', price: 199.99, stock: 70, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
  { title: 'Samsung Galaxy Watch 6', description: 'Feature-rich smartwatch with health tracking', price: 329.99, stock: 40, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { title: 'Samsung 49-inch Odyssey G9', description: 'Ultra-wide curved gaming monitor with 240Hz refresh rate', price: 1399.99, stock: 15, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },

  { title: 'Dell XPS 13 Plus', description: 'Premium ultrabook with 12th gen Intel processors', price: 1199.99, stock: 30, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' },
  { title: 'Dell Alienware m15 R7', description: 'High-performance gaming laptop with RTX graphics', price: 1899.99, stock: 18, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { title: 'Dell UltraSharp 32-inch 4K', description: 'Professional 4K monitor for content creation', price: 699.99, stock: 22, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
  { title: 'Dell Precision 5570', description: 'Mobile workstation for CAD and engineering work', price: 2299.99, stock: 12, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
  { title: 'Dell OptiPlex 7090', description: 'Compact desktop computer for business use', price: 899.99, stock: 28, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500' },

  { title: 'HP Spectre x360 14', description: '2-in-1 convertible laptop with OLED display', price: 1349.99, stock: 25, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500' },
  { title: 'HP Omen 45L Gaming Desktop', description: 'Powerful gaming PC with customizable RGB lighting', price: 1699.99, stock: 20, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500' },
  { title: 'HP LaserJet Pro MFP', description: 'All-in-one laser printer for office productivity', price: 329.99, stock: 45, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500' },
  { title: 'HP Elite Dragonfly G3', description: 'Ultra-lightweight business laptop with 5G connectivity', price: 1599.99, stock: 15, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500' },
  { title: 'HP Z27k G3 4K USB-C', description: '27-inch 4K monitor with USB-C connectivity', price: 549.99, stock: 32, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },

  { title: 'Lenovo ThinkPad X1 Carbon', description: 'Legendary business laptop with military-grade durability', price: 1399.99, stock: 35, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
  { title: 'Lenovo Legion 5 Pro', description: 'Gaming laptop with AMD Ryzen and RTX graphics', price: 1299.99, stock: 28, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { title: 'Lenovo Yoga 9i 14-inch', description: '2-in-1 premium laptop with leather cover', price: 1199.99, stock: 22, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500' },
  { title: 'Lenovo IdeaCentre AIO 5i', description: 'All-in-one desktop with 27-inch touchscreen', price: 899.99, stock: 18, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500' },
  { title: 'Lenovo ThinkCentre Tiny', description: 'Ultra-compact desktop for space-saving setups', price: 649.99, stock: 40, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500' },

  { title: 'Google Pixel 8 Pro', description: 'AI-powered smartphone with computational photography', price: 999.99, stock: 50, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500' },
  { title: 'Google Nest Hub Max', description: 'Smart display with Google Assistant and video calling', price: 229.99, stock: 55, image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=500' },
  { title: 'Google Pixel Buds Pro', description: 'Premium wireless earbuds with real-time translation', price: 199.99, stock: 65, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500' },
  { title: 'Google Nest Wifi Pro 6E', description: 'Mesh router system with Wi-Fi 6E technology', price: 399.99, stock: 30, image: 'https://images.unsplash.com/photo-1606904825846-647e3acc52d8?w=500' },
  { title: 'Google Chromecast with Google TV', description: '4K streaming device with voice remote', price: 49.99, stock: 100, image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=500' },

  { title: 'Microsoft Surface Pro 9', description: '2-in-1 tablet laptop with detachable keyboard', price: 999.99, stock: 42, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
  { title: 'Microsoft Surface Laptop 5', description: 'Elegant laptop with Alcantara keyboard deck', price: 1299.99, stock: 28, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
  { title: 'Microsoft Surface Studio 2+', description: 'All-in-one desktop with tilting touchscreen for creators', price: 4299.99, stock: 8, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500' },
  { title: 'Microsoft Xbox Series X', description: 'Next-generation gaming console with 4K gaming', price: 499.99, stock: 25, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500' },
  { title: 'Microsoft Surface Headphones 2', description: 'Wireless headphones with active noise cancellation', price: 249.99, stock: 38, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500' },

  { title: 'ASUS ROG Strix SCAR 17', description: 'High-performance gaming laptop for esports', price: 2199.99, stock: 15, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { title: 'ASUS ZenBook Pro 16X OLED', description: 'Creator laptop with 4K OLED touchscreen', price: 2499.99, stock: 12, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
  { title: 'ASUS ProArt Display PA278QV', description: '27-inch color-accurate monitor for professionals', price: 329.99, stock: 35, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
  { title: 'ASUS RT-AX6000 Router', description: 'Wi-Fi 6 gaming router with advanced QoS', price: 349.99, stock: 28, image: 'https://images.unsplash.com/photo-1606904825846-647e3acc52d8?w=500' },
  { title: 'ASUS TUF Gaming VG27AQ', description: '27-inch 165Hz gaming monitor with G-Sync', price: 329.99, stock: 45, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },

  { title: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling wireless headphones', price: 399.99, stock: 60, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500' },
  { title: 'Sony PlayStation 5', description: 'Next-gen gaming console with ray tracing', price: 499.99, stock: 20, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500' },
  { title: 'Sony Alpha a7R V', description: 'Full-frame mirrorless camera with 61MP sensor', price: 3899.99, stock: 10, image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500' },
  { title: 'Sony BRAVIA XR A95L OLED', description: '65-inch 4K OLED TV with Cognitive Processor XR', price: 2799.99, stock: 8, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500' },
  { title: 'Sony WF-1000XM4', description: 'Premium noise canceling truly wireless earbuds', price: 279.99, stock: 50, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500' },

  { title: 'Nintendo Switch OLED', description: 'Handheld gaming console with vibrant OLED screen', price: 349.99, stock: 75, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500' },
  { title: 'Razer Blade 15 Advanced', description: 'Ultra-thin gaming laptop with RTX 4080', price: 2699.99, stock: 12, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { title: 'Logitech MX Master 3S', description: 'Advanced wireless mouse for productivity', price: 99.99, stock: 85, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500' },
  { title: 'Corsair K95 RGB Platinum XT', description: 'Mechanical gaming keyboard with Cherry MX switches', price: 199.99, stock: 40, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500' },
  { title: 'SteelSeries Arctis Nova Pro', description: 'Premium gaming headset with active noise cancellation', price: 349.99, stock: 30, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500' },
  { title: 'Meta Quest 3', description: 'All-in-one VR headset with mixed reality capabilities', price: 499.99, stock: 25, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500' }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing products
  await prisma.product.deleteMany({});
  console.log('🗑️ Cleared existing products');

  // Create products with generated UUIDs
  const productsWithIds = techProducts.map(product => ({
    id: uuidv7(),
    ...product
  }));

  await prisma.product.createMany({
    data: productsWithIds
  });

  console.log(`✅ Created ${productsWithIds.length} tech products with images`);
  
  // Verify the data
  const count = await prisma.product.count();
  console.log(`📊 Total products in database: ${count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
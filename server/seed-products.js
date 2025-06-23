const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper function to generate product codes
function generateProductCode(category, index) {
  const categoryMap = {
    'Breads': 'B',
    'Pastries': 'P', 
    'Cakes': 'C',
    'Cookies': 'K',
    'Beverages': 'D', // D for Drinks
    'Sandwiches': 'S',
    'Seasonal': 'Z',
    'Other': 'O'
  };
  
  const prefix = categoryMap[category] || 'X';
  return `${prefix}${index.toString().padStart(2, '0')}`;
}

const products = [
  // Breads
  { name: 'Artisan Sourdough Bread', price: 6.50, category: 'Breads', stockQty: 12, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format' },
  { name: 'Fresh Baguette', price: 3.25, category: 'Breads', stockQty: 20, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format' },
  
  // Pastries
  { name: 'Chocolate Croissant', price: 4.25, category: 'Pastries', stockQty: 15, imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop&auto=format' },
  { name: 'Apple Turnover', price: 3.75, category: 'Pastries', stockQty: 10, imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop&auto=format' },
  
  // Cakes
  { name: 'Red Velvet Cake Slice', price: 5.50, category: 'Cakes', stockQty: 8, imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop&auto=format' },
  { name: 'Chocolate Cake Slice', price: 5.25, category: 'Cakes', stockQty: 6, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format' },
  
  // Cookies  
  { name: 'Double Chocolate Brownies', price: 3.50, category: 'Cookies', stockQty: 18, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format' },
  { name: 'Oatmeal Raisin Cookies', price: 2.75, category: 'Cookies', stockQty: 25, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format' },
  
  // Beverages
  { name: 'Cappuccino', price: 4.50, category: 'Beverages', stockQty: 30, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format' },
  { name: 'Latte', price: 4.75, category: 'Beverages', stockQty: 30, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&auto=format' },
  { name: 'Hot Chocolate', price: 3.50, category: 'Beverages', stockQty: 20, imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop&auto=format' },
  
  // Sandwiches
  { name: 'Club Sandwich', price: 8.50, category: 'Sandwiches', stockQty: 12, imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&h=300&fit=crop&auto=format' },
  { name: 'Grilled Panini', price: 7.25, category: 'Sandwiches', stockQty: 10, imageUrl: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop&auto=format' },
  
  // Seasonal
  { name: 'Cinnamon Roll', price: 3.50, category: 'Seasonal', stockQty: 14, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format' },
  { name: 'Gingerbread Cookie', price: 2.50, category: 'Seasonal', stockQty: 20, imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop&auto=format' }
];

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Clear in the correct order to avoid foreign key issues
    await prisma.orderItem.deleteMany({});
    console.log('   ✅ OrderItems cleared');
    
    await prisma.order.deleteMany({});
    console.log('   ✅ Orders cleared');
    
    await prisma.product.deleteMany({});
    console.log('   ✅ Products cleared');
    
    await prisma.user.deleteMany({});
    console.log('   ✅ Users cleared');
    
    console.log('✨ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  try {
    // Group products by category to assign sequential codes
    const groupedProducts = {};
    products.forEach(product => {
      if (!groupedProducts[product.category]) {
        groupedProducts[product.category] = [];
      }
      groupedProducts[product.category].push(product);
    });
    
    // Create products with generated codes
    for (const [category, categoryProducts] of Object.entries(groupedProducts)) {
      for (let i = 0; i < categoryProducts.length; i++) {
        const product = categoryProducts[i];
        const productCode = generateProductCode(category, i + 1);
        
        const createdProduct = await prisma.product.create({
          data: {
            productCode,
            name: product.name,
            price: product.price,
            category: product.category,
            stockQty: product.stockQty,
            imageUrl: product.imageUrl,
            isActive: true
          }
        });
        
        console.log(`   ✅ Created: ${productCode} - ${createdProduct.name}`);
      }
    }
    
    console.log(`🎉 Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

async function createDefaultUsers() {
  console.log('👤 Creating default users...');
  
  try {
    // Hash passwords for security
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    const cashierHashedPassword = await bcrypt.hash('cashier123', 10);
    
    // Create admin user with hashed password
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@popstreetbakes.com',
        password: adminHashedPassword,
        role: 'ADMIN',
        name: 'Admin User'
      }
    });
    
    console.log(`   ✅ Created admin user: ${adminUser.email}`);
    
    // Create cashier user with hashed password
    const cashierUser = await prisma.user.create({
      data: {
        email: 'cashier@popstreetbakes.com',
        password: cashierHashedPassword,
        role: 'CASHIER',
        name: 'Cashier User'
      }
    });
    
    console.log(`   ✅ Created cashier user: ${cashierUser.email}`);
  } catch (error) {
    console.error('❌ Error creating default users:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database seeding process...');
  console.log('============================================');
  
  try {
    await clearDatabase();
    await seedProducts();
    await createDefaultUsers();
    
    console.log('============================================');
    console.log('🎊 Database seeding completed successfully!');
    console.log(`📊 Total products: ${products.length}`);
    console.log('🔗 Product codes generated for easy identification');
    console.log('👤 Default admin and cashier users created');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
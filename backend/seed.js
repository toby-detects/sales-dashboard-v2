require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sales_dashboard';

const seedProducts = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 3200, stock: 42 },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 1800, stock: 17 },
  { name: 'Phone Case', category: 'Accessories', price: 350, stock: 90 }
];

const seedCategories = [
  { name: 'Electronics' },
  { name: 'Accessories' }
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Product.deleteMany({});
  await Sale.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared existing data');

  // Insert categories
  await Category.insertMany(seedCategories);
  console.log('Categories seeded');

  // Insert products
  const products = await Product.insertMany(seedProducts);
  console.log('Products seeded:', products.map(p => p.name));

  // Generate 6 months of historical sales data
  const now = new Date();
  const sales = [];

  for (const product of products) {
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      // Simulate increasing trend each month
      const baseSales = randomInt(20, 60) + (5 - monthOffset) * 10;

      for (let day = 1; day <= daysInMonth; day += randomInt(1, 3)) {
        const saleDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        if (saleDate > now) break;
        const quantity = randomInt(1, 8);
        sales.push({
          product_id: product._id,
          quantity,
          total_price: quantity * product.price,
          date: saleDate
        });
      }
    }
  }

  await Sale.insertMany(sales);
  console.log(`Seeded ${sales.length} sales records across 6 months`);

  console.log('\n✅ Database seeded successfully!');
  console.log('Run "npm run dev" in the backend folder to start the server.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

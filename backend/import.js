require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Category = require('./models/Category');

// ─── RETAIL STORE HISTORICAL DATASET ────────────────────
// Seasonal logic based on Philippine retail patterns:
//
// Jan  — Post-holiday slowdown, back-to-school prep
// Feb  — Valentine's, slight boost on gifts/personal care
// Mar  — Summer starts, heat products rise
// Apr  — Holy Week, summer peak (water, drinks, clothing)
// May  — Summer continues
// Jun  — School opening (school supplies PEAK), rainy season starts
// Jul  — Rainy season (jackets, hot drinks)
// Aug  — Mid-year, steady
// Sep  — "Ber months" — Christmas prep starts, consumer spending rises
// Oct  — Rising holiday mood
// Nov  — Pre-Christmas peak
// Dec  — Christmas PEAK — highest sales across all categories

const myProducts = [
  // Electronics
  { name: 'Wireless Earbuds',       category: 'Electronics',    price: 1299, stock: 35  },
  { name: 'Bluetooth Speaker',      category: 'Electronics',    price: 1899, stock: 20  },
  { name: 'USB-C Charging Cable',   category: 'Electronics',    price: 299,  stock: 120 },
  { name: 'Power Bank 10000mAh',    category: 'Electronics',    price: 999,  stock: 45  },
  { name: 'LED Desk Lamp',          category: 'Electronics',    price: 749,  stock: 30  },

  // Clothing
  { name: 'Plain White T-Shirt',    category: 'Clothing',       price: 350,  stock: 80  },
  { name: 'Denim Jeans',            category: 'Clothing',       price: 1200, stock: 40  },
  { name: 'Hoodie Sweater',         category: 'Clothing',       price: 899,  stock: 55  },
  { name: 'Running Shorts',         category: 'Clothing',       price: 499,  stock: 60  },
  { name: 'Baseball Cap',           category: 'Clothing',       price: 299,  stock: 75  },

  // Food & Beverage
  { name: 'Instant Coffee 200g',    category: 'Food & Beverage', price: 189, stock: 100 },
  { name: 'Bottled Water 1L',       category: 'Food & Beverage', price: 49,  stock: 200 },
  { name: 'Energy Drink 250ml',     category: 'Food & Beverage', price: 89,  stock: 150 },
  { name: 'Chocolate Bar',          category: 'Food & Beverage', price: 59,  stock: 180 },
  { name: 'Mixed Nuts 100g',        category: 'Food & Beverage', price: 149, stock: 90  },

  // School & Office
  { name: 'Ballpen Set 10pcs',      category: 'School & Office', price: 89,  stock: 150 },
  { name: 'Spiral Notebook',        category: 'School & Office', price: 79,  stock: 120 },
  { name: 'Correction Tape',        category: 'School & Office', price: 49,  stock: 100 },
  { name: 'Stapler',                category: 'School & Office', price: 299, stock: 40  },
  { name: 'Scotch Tape Roll',       category: 'School & Office', price: 39,  stock: 130 },

  // Personal Care
  { name: 'Shampoo 200ml',          category: 'Personal Care',  price: 159,  stock: 85  },
  { name: 'Hand Sanitizer 100ml',   category: 'Personal Care',  price: 99,   stock: 110 },
  { name: 'Facial Wash 100g',       category: 'Personal Care',  price: 199,  stock: 70  },
  { name: 'Toothpaste 150g',        category: 'Personal Care',  price: 129,  stock: 95  },
  { name: 'Lotion 200ml',           category: 'Personal Care',  price: 249,  stock: 65  },
];

// Monthly sales per product — Jan to Dec 2024
// Values represent UNITS SOLD per month
// Trends are based on Philippine seasonal behavior
const salesTemplate = [

  // ── ELECTRONICS ─────────────────────────────────────────
  // Earbuds: steady year-round, big spike in Dec (Christmas gifts)
  // Sep-Nov ramp up = "Ber months" gift buying
  {
    name: 'Wireless Earbuds',
    monthlySales: [6, 5, 6, 7, 7, 6, 6, 8, 12, 16, 22, 35]
    //             Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
  },

  // Bluetooth Speaker: gift item — very low mid-year, peaks Christmas
  {
    name: 'Bluetooth Speaker',
    monthlySales: [4, 4, 3, 3, 4, 3, 3, 5, 8, 12, 17, 28]
  },

  // USB-C Cable: everyday item — consistent, slight holiday bump
  {
    name: 'USB-C Charging Cable',
    monthlySales: [18, 16, 17, 18, 20, 19, 18, 20, 24, 27, 32, 42]
  },

  // Power Bank: summer travel (Apr-May) + Christmas gifts (Dec)
  {
    name: 'Power Bank 10000mAh',
    monthlySales: [6, 6, 8, 14, 15, 9, 7, 8, 10, 13, 18, 26]
  },

  // LED Desk Lamp: school opening June + Christmas (Dec)
  {
    name: 'LED Desk Lamp',
    monthlySales: [4, 3, 4, 4, 5, 10, 8, 7, 8, 9, 11, 16]
  },

  // ── CLOTHING ────────────────────────────────────────────
  // White T-Shirt: summer peak (Mar-May), dips rainy season
  {
    name: 'Plain White T-Shirt',
    monthlySales: [12, 13, 22, 28, 30, 18, 14, 15, 18, 20, 22, 25]
  },

  // Denim Jeans: steady, slight ber months rise
  {
    name: 'Denim Jeans',
    monthlySales: [8, 7, 9, 8, 8, 7, 6, 8, 11, 14, 18, 22]
  },

  // Hoodie Sweater: rainy/cold months (Jun-Jan are peak)
  // Very low in summer (Mar-May)
  {
    name: 'Hoodie Sweater',
    monthlySales: [22, 18, 8, 5, 4, 10, 18, 16, 15, 18, 26, 35]
  },

  // Running Shorts: summer peak (Mar-May), low rainy season
  {
    name: 'Running Shorts',
    monthlySales: [6, 8, 20, 28, 26, 12, 8, 9, 10, 11, 10, 9]
  },

  // Baseball Cap: summer (Mar-May), slight Christmas bump
  {
    name: 'Baseball Cap',
    monthlySales: [8, 9, 18, 22, 20, 12, 10, 11, 13, 15, 16, 18]
  },

  // ── FOOD & BEVERAGE ─────────────────────────────────────
  // Instant Coffee: rainy/cold season peak (Jun-Jan)
  // Low in summer because people prefer cold drinks
  {
    name: 'Instant Coffee 200g',
    monthlySales: [38, 34, 22, 18, 16, 28, 36, 34, 36, 38, 42, 48]
  },

  // Bottled Water: PEAK summer (Mar-May), low rainy season
  {
    name: 'Bottled Water 1L',
    monthlySales: [42, 40, 62, 80, 85, 55, 45, 48, 52, 55, 50, 46]
  },

  // Energy Drink: summer and school opening (Jun-Aug)
  {
    name: 'Energy Drink 250ml',
    monthlySales: [22, 20, 28, 35, 38, 40, 38, 42, 36, 32, 30, 28]
  },

  // Chocolate Bar: Valentine's (Feb), Christmas (Nov-Dec) peaks
  // Low mid-year (people avoid chocolate in summer heat)
  {
    name: 'Chocolate Bar',
    monthlySales: [30, 55, 28, 22, 20, 22, 20, 24, 32, 42, 60, 75]
  },

  // Mixed Nuts: Christmas snack item — peaks heavily Nov-Dec
  {
    name: 'Mixed Nuts 100g',
    monthlySales: [14, 12, 12, 13, 14, 13, 12, 14, 18, 24, 35, 48]
  },

  // ── SCHOOL & OFFICE ──────────────────────────────────────
  // Ballpen Set: HUGE peak June (school opening), Jan (new year)
  // Very low Apr-May (summer break — no school)
  {
    name: 'Ballpen Set 10pcs',
    monthlySales: [32, 20, 16, 8, 6, 55, 42, 35, 28, 24, 20, 18]
  },

  // Spiral Notebook: mirrors ballpen — school opening peak
  {
    name: 'Spiral Notebook',
    monthlySales: [28, 18, 14, 6, 5, 50, 38, 30, 24, 20, 18, 15]
  },

  // Correction Tape: school use — peaks June, Jan
  {
    name: 'Correction Tape',
    monthlySales: [22, 16, 12, 5, 4, 40, 30, 24, 20, 17, 15, 12]
  },

  // Stapler: office/school use — peaks June, steady rest of year
  {
    name: 'Stapler',
    monthlySales: [5, 4, 4, 2, 2, 10, 7, 6, 6, 5, 5, 6]
  },

  // Scotch Tape: Christmas wrapping PEAK (Dec), school use (Jun)
  {
    name: 'Scotch Tape Roll',
    monthlySales: [14, 12, 10, 8, 7, 20, 14, 12, 14, 18, 22, 45]
  },

  // ── PERSONAL CARE ────────────────────────────────────────
  // Shampoo: consistent year-round, slight summer rise
  {
    name: 'Shampoo 200ml',
    monthlySales: [20, 19, 22, 25, 26, 22, 20, 21, 22, 22, 24, 26]
  },

  // Hand Sanitizer: peaks Jan (flu season), Jun (school opening),
  // and Dec (holiday gatherings)
  {
    name: 'Hand Sanitizer 100ml',
    monthlySales: [35, 28, 22, 18, 16, 30, 24, 20, 22, 25, 28, 36]
  },

  // Facial Wash: summer skincare peak (Mar-May)
  {
    name: 'Facial Wash 100g',
    monthlySales: [15, 16, 22, 26, 24, 18, 16, 17, 18, 18, 20, 22]
  },

  // Toothpaste: very consistent, slight Christmas bump
  {
    name: 'Toothpaste 150g',
    monthlySales: [22, 20, 21, 20, 21, 21, 20, 21, 22, 23, 24, 28]
  },

  // Lotion: dry season peak (Jan-Mar), rainy low, Dec holiday gift
  {
    name: 'Lotion 200ml',
    monthlySales: [26, 24, 22, 16, 14, 13, 12, 14, 16, 18, 22, 30]
  },
];

// ─────────────────────────────────────────────────────────

async function importData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear old data
  await Product.deleteMany({});
  await Sale.deleteMany({});
  await Category.deleteMany({});
  console.log('🗑️  Cleared existing data\n');

  // Insert products and categories
  const insertedProducts = {};
  for (const p of myProducts) {
    const product = await Product.create(p);
    insertedProducts[p.name] = product;
    await Category.findOneAndUpdate(
      { name: p.category },
      { name: p.category },
      { upsert: true }
    );
  }
  console.log(`📦 Inserted ${myProducts.length} products across 5 categories\n`);

  // Insert sales — spread each month's units across random days
  let totalSales = 0;
  const year = 2025;

  for (const template of salesTemplate) {
    const product = insertedProducts[template.name];
    if (!product) continue;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const totalUnitsThisMonth = template.monthlySales[monthIndex];
      if (totalUnitsThisMonth <= 0) continue;

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      // Number of sale days = realistic (not every day, but distributed)
      const numSaleDays = Math.min(totalUnitsThisMonth, Math.ceil(daysInMonth * 0.6));
      const saleDays = new Set();
      while (saleDays.size < numSaleDays) {
        saleDays.add(Math.floor(Math.random() * daysInMonth) + 1);
      }

      const daysArray = [...saleDays].sort((a, b) => a - b);
      let unitsLeft = totalUnitsThisMonth;

      for (let i = 0; i < daysArray.length; i++) {
        const day = daysArray[i];
        const isLast = i === daysArray.length - 1;
        const remaining = daysArray.length - i;
        const qty = isLast
          ? unitsLeft
          : Math.max(1, Math.round(unitsLeft / remaining) + Math.floor(Math.random() * 2));

        const safeQty = Math.min(qty, unitsLeft);
        if (safeQty <= 0) continue;

        const saleDate = new Date(
          year,
          monthIndex,
          day,
          Math.floor(Math.random() * 10) + 8,  // 8am–6pm
          Math.floor(Math.random() * 60)
        );

        await Sale.create({
          product_id: product._id,
          quantity: safeQty,
          total_price: safeQty * product.price,
          date: saleDate
        });

        unitsLeft -= safeQty;
        totalSales++;
        if (unitsLeft <= 0) break;
      }
    }
  }

  console.log(`📊 Inserted ${totalSales} sales records (Jan–Dec 2024)\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Historical dataset import complete!');
  console.log('');
  console.log('   Seasonal highlights baked in:');
  console.log('   🌞 Summer (Mar–May)   → Water, Shorts, Caps, Suncare');
  console.log('   🏫 School (Jun)       → Notebooks, Pens, Lamps');
  console.log('   🌧️  Rainy (Jun–Aug)   → Hoodies, Coffee, Sanitizer');
  console.log('   🎄 Christmas (Nov–Dec)→ Speakers, Earbuds, Chocolates');
  console.log('   💝 Valentines (Feb)   → Chocolates, Personal Care');
  console.log('');
  console.log('   Run the server: npm run dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

importData().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});

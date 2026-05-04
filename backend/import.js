require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Category = require('./models/Category');

// ─── RETAIL STORE HISTORICAL DATASET ────────────────────
// Coverage: Jan 2025 – May 4, 2026
// Seasonal logic based on Philippine retail patterns

const myProducts = [
  { name: 'Wireless Earbuds',       category: 'Electronics',    price: 1299, stock: 35  },
  { name: 'Bluetooth Speaker',      category: 'Electronics',    price: 1899, stock: 20  },
  { name: 'USB-C Charging Cable',   category: 'Electronics',    price: 299,  stock: 120 },
  { name: 'Power Bank 10000mAh',    category: 'Electronics',    price: 999,  stock: 45  },
  { name: 'LED Desk Lamp',          category: 'Electronics',    price: 749,  stock: 30  },
  { name: 'Plain White T-Shirt',    category: 'Clothing',       price: 350,  stock: 80  },
  { name: 'Denim Jeans',            category: 'Clothing',       price: 1200, stock: 40  },
  { name: 'Hoodie Sweater',         category: 'Clothing',       price: 899,  stock: 55  },
  { name: 'Running Shorts',         category: 'Clothing',       price: 499,  stock: 60  },
  { name: 'Baseball Cap',           category: 'Clothing',       price: 299,  stock: 75  },
  { name: 'Instant Coffee 200g',    category: 'Food & Beverage', price: 189, stock: 100 },
  { name: 'Bottled Water 1L',       category: 'Food & Beverage', price: 49,  stock: 200 },
  { name: 'Energy Drink 250ml',     category: 'Food & Beverage', price: 89,  stock: 150 },
  { name: 'Chocolate Bar',          category: 'Food & Beverage', price: 59,  stock: 180 },
  { name: 'Mixed Nuts 100g',        category: 'Food & Beverage', price: 149, stock: 90  },
  { name: 'Ballpen Set 10pcs',      category: 'School & Office', price: 89,  stock: 150 },
  { name: 'Spiral Notebook',        category: 'School & Office', price: 79,  stock: 120 },
  { name: 'Correction Tape',        category: 'School & Office', price: 49,  stock: 100 },
  { name: 'Stapler',                category: 'School & Office', price: 299, stock: 40  },
  { name: 'Scotch Tape Roll',       category: 'School & Office', price: 39,  stock: 130 },
  { name: 'Shampoo 200ml',          category: 'Personal Care',  price: 159,  stock: 85  },
  { name: 'Hand Sanitizer 100ml',   category: 'Personal Care',  price: 99,   stock: 110 },
  { name: 'Facial Wash 100g',       category: 'Personal Care',  price: 199,  stock: 70  },
  { name: 'Toothpaste 150g',        category: 'Personal Care',  price: 129,  stock: 95  },
  { name: 'Lotion 200ml',           category: 'Personal Care',  price: 249,  stock: 65  },
];

// ─── SALES DATA STRUCTURE ───────────────────────────────
// Each product has two arrays:
//   sales2025: Jan–Dec 2025 (12 months)
//   sales2026: Jan–May 2026 (5 months, partial year)
//
// May 2026 is partial — only up to May 4
// so May units are prorated (~4/31 of expected monthly units)

const salesTemplate = [

  // ── ELECTRONICS ─────────────────────────────────────────
  {
    name: 'Wireless Earbuds',
    // 2025: Jan–Dec  (post-Christmas dip Jan, steady, ber months rise, Dec peak)
    sales2025: [6, 5, 6, 7, 7, 6, 6, 8, 12, 16, 22, 35],
    // 2026: Jan–May  (Jan post-Christmas slowdown, Feb steady, Mar summer starts, Apr summer, May~4days)
    sales2026: [7, 6, 7, 8, 1]
  },
  {
    name: 'Bluetooth Speaker',
    sales2025: [4, 4, 3, 3, 4, 3, 3, 5, 8, 12, 17, 28],
    sales2026: [5, 4, 3, 4, 1]
  },
  {
    name: 'USB-C Charging Cable',
    sales2025: [18, 16, 17, 18, 20, 19, 18, 20, 24, 27, 32, 42],
    sales2026: [20, 18, 18, 20, 3]
  },
  {
    name: 'Power Bank 10000mAh',
    sales2025: [6, 6, 8, 14, 15, 9, 7, 8, 10, 13, 18, 26],
    sales2026: [7, 7, 9, 15, 2]
  },
  {
    name: 'LED Desk Lamp',
    sales2025: [4, 3, 4, 4, 5, 10, 8, 7, 8, 9, 11, 16],
    sales2026: [4, 3, 4, 5, 1]
  },

  // ── CLOTHING ────────────────────────────────────────────
  {
    name: 'Plain White T-Shirt',
    sales2025: [12, 13, 22, 28, 30, 18, 14, 15, 18, 20, 22, 25],
    sales2026: [13, 14, 24, 30, 4]
  },
  {
    name: 'Denim Jeans',
    sales2025: [8, 7, 9, 8, 8, 7, 6, 8, 11, 14, 18, 22],
    sales2026: [9, 8, 10, 9, 1]
  },
  {
    name: 'Hoodie Sweater',
    // High Jan (cool), drops summer (Mar-May), rises rainy season
    sales2025: [22, 18, 8, 5, 4, 10, 18, 16, 15, 18, 26, 35],
    sales2026: [24, 20, 7, 4, 1]
  },
  {
    name: 'Running Shorts',
    // Summer peak Mar-May
    sales2025: [6, 8, 20, 28, 26, 12, 8, 9, 10, 11, 10, 9],
    sales2026: [7, 9, 22, 30, 4]
  },
  {
    name: 'Baseball Cap',
    sales2025: [8, 9, 18, 22, 20, 12, 10, 11, 13, 15, 16, 18],
    sales2026: [9, 10, 20, 24, 3]
  },

  // ── FOOD & BEVERAGE ─────────────────────────────────────
  {
    name: 'Instant Coffee 200g',
    // High Jan (cool/rainy hangover), drops summer, rises rainy season
    sales2025: [38, 34, 22, 18, 16, 28, 36, 34, 36, 38, 42, 48],
    sales2026: [40, 36, 20, 17, 2]
  },
  {
    name: 'Bottled Water 1L',
    // Summer peak Apr-May
    sales2025: [42, 40, 62, 80, 85, 55, 45, 48, 52, 55, 50, 46],
    sales2026: [44, 42, 65, 82, 11]
  },
  {
    name: 'Energy Drink 250ml',
    sales2025: [22, 20, 28, 35, 38, 40, 38, 42, 36, 32, 30, 28],
    sales2026: [23, 21, 30, 36, 5]
  },
  {
    name: 'Chocolate Bar',
    // Feb Valentine's spike, Dec Christmas spike
    sales2025: [30, 55, 28, 22, 20, 22, 20, 24, 32, 42, 60, 75],
    sales2026: [32, 58, 26, 21, 3]
  },
  {
    name: 'Mixed Nuts 100g',
    sales2025: [14, 12, 12, 13, 14, 13, 12, 14, 18, 24, 35, 48],
    sales2026: [15, 13, 12, 14, 2]
  },

  // ── SCHOOL & OFFICE ──────────────────────────────────────
  {
    name: 'Ballpen Set 10pcs',
    // Jan new year spike, Jun school opening PEAK, low Apr-May (summer break)
    sales2025: [32, 20, 16, 8, 6, 55, 42, 35, 28, 24, 20, 18],
    sales2026: [34, 22, 15, 7, 1]
  },
  {
    name: 'Spiral Notebook',
    sales2025: [28, 18, 14, 6, 5, 50, 38, 30, 24, 20, 18, 15],
    sales2026: [30, 19, 13, 6, 1]
  },
  {
    name: 'Correction Tape',
    sales2025: [22, 16, 12, 5, 4, 40, 30, 24, 20, 17, 15, 12],
    sales2026: [24, 17, 11, 5, 1]
  },
  {
    name: 'Stapler',
    sales2025: [5, 4, 4, 2, 2, 10, 7, 6, 6, 5, 5, 6],
    sales2026: [5, 4, 4, 2, 0]
  },
  {
    name: 'Scotch Tape Roll',
    // Dec Christmas wrapping peak, Jun school use
    sales2025: [14, 12, 10, 8, 7, 20, 14, 12, 14, 18, 22, 45],
    sales2026: [15, 13, 11, 9, 1]
  },

  // ── PERSONAL CARE ────────────────────────────────────────
  {
    name: 'Shampoo 200ml',
    sales2025: [20, 19, 22, 25, 26, 22, 20, 21, 22, 22, 24, 26],
    sales2026: [21, 20, 23, 26, 3]
  },
  {
    name: 'Hand Sanitizer 100ml',
    // Jan flu season peak, Jun school opening, Dec holiday
    sales2025: [35, 28, 22, 18, 16, 30, 24, 20, 22, 25, 28, 36],
    sales2026: [36, 29, 21, 17, 2]
  },
  {
    name: 'Facial Wash 100g',
    // Summer skincare peak Mar-May
    sales2025: [15, 16, 22, 26, 24, 18, 16, 17, 18, 18, 20, 22],
    sales2026: [16, 17, 24, 28, 4]
  },
  {
    name: 'Toothpaste 150g',
    sales2025: [22, 20, 21, 20, 21, 21, 20, 21, 22, 23, 24, 28],
    sales2026: [23, 21, 22, 21, 3]
  },
  {
    name: 'Lotion 200ml',
    // Dry season peak Jan-Mar, low rainy
    sales2025: [26, 24, 22, 16, 14, 13, 12, 14, 16, 18, 22, 30],
    sales2026: [28, 25, 23, 15, 2]
  },
];

// ─── HELPER: spread units across random days in a month ──
async function insertMonthlySales(product, year, monthIndex, totalUnits, cutoffDay = null) {
  if (totalUnits <= 0) return 0;

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const maxDay = cutoffDay || daysInMonth;

  const numSaleDays = Math.min(totalUnits, Math.ceil(maxDay * 0.6));
  const saleDays = new Set();
  let attempts = 0;
  while (saleDays.size < numSaleDays && attempts < 1000) {
    saleDays.add(Math.floor(Math.random() * maxDay) + 1);
    attempts++;
  }

  const daysArray = [...saleDays].sort((a, b) => a - b);
  let unitsLeft = totalUnits;
  let count = 0;

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
      year, monthIndex, day,
      Math.floor(Math.random() * 10) + 8,
      Math.floor(Math.random() * 60)
    );

    await Sale.create({
      product_id: product._id,
      quantity: safeQty,
      total_price: safeQty * product.price,
      date: saleDate
    });

    unitsLeft -= safeQty;
    count++;
    if (unitsLeft <= 0) break;
  }

  return count;
}

// ─── MAIN IMPORT ─────────────────────────────────────────
async function importData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

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

  let totalSales = 0;

  for (const template of salesTemplate) {
    const product = insertedProducts[template.name];
    if (!product) continue;

    // ── 2025: Full year Jan–Dec ──────────────────────────
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const units = template.sales2025[monthIndex];
      const count = await insertMonthlySales(product, 2025, monthIndex, units);
      totalSales += count;
    }

    // ── 2026: Jan–Apr full months + May partial (up to May 4) ──
    const fullMonths2026 = [0, 1, 2, 3]; // Jan, Feb, Mar, Apr
    for (const monthIndex of fullMonths2026) {
      const units = template.sales2026[monthIndex];
      const count = await insertMonthlySales(product, 2026, monthIndex, units);
      totalSales += count;
    }

    // May 2026 — partial, only up to May 4
    const mayUnits = template.sales2026[4];
    if (mayUnits > 0) {
      const count = await insertMonthlySales(product, 2026, 4, mayUnits, 4);
      totalSales += count;
    }
  }

  console.log(`📊 Inserted ${totalSales} sale records\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Extended historical dataset import complete!');
  console.log('');
  console.log('   Coverage: Jan 2025 → May 4, 2026');
  console.log('');
  console.log('   2025 Seasonal highlights:');
  console.log('   🌞 Summer  (Mar–May)  → Water, Shorts, Caps');
  console.log('   🏫 School  (Jun)      → Notebooks, Pens, Lamps');
  console.log('   🌧️  Rainy  (Jun–Aug)  → Hoodies, Coffee');
  console.log('   🎄 Christmas (Nov–Dec)→ Speakers, Earbuds, Chocolates');
  console.log('   💝 Valentines (Feb)   → Chocolates, Personal Care');
  console.log('');
  console.log('   2026 Coverage:');
  console.log('   Jan  — Post-Christmas slowdown');
  console.log('   Feb  — Valentines spike (Chocolates)');
  console.log('   Mar  — Summer starts');
  console.log('   Apr  — Summer peak');
  console.log('   May  — Partial (May 1–4 only)');
  console.log('');
  console.log('   Run the server: npm run dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

importData().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});

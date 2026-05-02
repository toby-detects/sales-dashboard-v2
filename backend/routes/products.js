const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Category = require('../models/Category');

// GET all products with revenue trend
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const productsWithTrend = await Promise.all(
      products.map(async (product) => {
        const thisMonthSales = await Sale.aggregate([
          { $match: { product_id: product._id, date: { $gte: thisMonthStart } } },
          { $group: { _id: null, revenue: { $sum: '$total_price' }, units: { $sum: '$quantity' } } }
        ]);
        const lastMonthSales = await Sale.aggregate([
          { $match: { product_id: product._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
          { $group: { _id: null, revenue: { $sum: '$total_price' }, units: { $sum: '$quantity' } } }
        ]);

        const currentRev = thisMonthSales[0]?.revenue || 0;
        const prevRev = lastMonthSales[0]?.revenue || 0;
        const trendPct = prevRev > 0 ? Math.round(((currentRev - prevRev) / prevRev) * 100) : 0;

        return {
          ...product.toObject(),
          trendPct,
          trendDir: trendPct >= 0 ? 'up' : 'down',
          currentMonthRevenue: currentRev,
          currentMonthUnits: thisMonthSales[0]?.units || 0
        };
      })
    );

    res.json(productsWithTrend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const product = new Product({ name, category, price, stock });
    await product.save();

    // Upsert category
    await Category.findOneAndUpdate({ name: category }, { name: category }, { upsert: true, new: true });

    const newProduct = { ...product.toObject(), trendPct: 0, trendDir: 'up', currentMonthRevenue: 0, currentMonthUnits: 0 };
    req.io.emit('product:new', newProduct);

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET single product analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { view = 'month' } = req.query;
    const now = new Date();
    let groupFormat, startDate, periods;

    if (view === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      groupFormat = { year: { $year: '$date' }, month: { $month: '$date' } };
      periods = 12;
    } else if (view === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      groupFormat = { year: { $year: '$date' }, month: { $month: '$date' } };
      periods = 6;
    } else {
      startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      groupFormat = { year: { $year: '$date' }, month: { $month: '$date' }, week: { $week: '$date' } };
      periods = 4;
    }

    const salesData = await Sale.aggregate([
      { $match: { product_id: product._id, date: { $gte: startDate } } },
      { $group: { _id: groupFormat, units: { $sum: '$quantity' }, revenue: { $sum: '$total_price' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);

    res.json({ product, salesData, view });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

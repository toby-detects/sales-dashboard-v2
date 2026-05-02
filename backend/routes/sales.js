const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// GET all sales summary (overall)
router.get('/overall', async (req, res) => {
  try {
    const { view = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (view === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    } else if (view === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else {
      startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    }

    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$total_price' }, units: { $sum: '$quantity' } } }
    ]);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonth = await Sale.aggregate([
      { $match: { date: { $gte: thisMonthStart } } },
      { $group: { _id: null, revenue: { $sum: '$total_price' } } }
    ]);
    const lastMonth = await Sale.aggregate([
      { $match: { date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, revenue: { $sum: '$total_price' } } }
    ]);

    const curRev = thisMonth[0]?.revenue || 0;
    const prevRev = lastMonth[0]?.revenue || 0;
    const avgGrowth = prevRev > 0 ? Math.round(((curRev - prevRev) / prevRev) * 100) : 0;

    // Per-product sales over time
    const products = await Product.find();
    const perProductSales = await Promise.all(
      products.map(async (p) => {
        const data = await Sale.aggregate([
          { $match: { product_id: p._id, date: { $gte: startDate } } },
          { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, units: { $sum: '$quantity' }, revenue: { $sum: '$total_price' } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        return { product: p, salesData: data };
      })
    );

    // Revenue by category
    const byCategory = await Sale.aggregate([
      {
        $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' }
      },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', revenue: { $sum: '$total_price' }, units: { $sum: '$quantity' } } },
      { $sort: { revenue: -1 } }
    ]);

    const productCount = await Product.countDocuments();

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUnits: totalRevenue[0]?.units || 0,
      avgGrowth,
      productCount,
      perProductSales,
      byCategory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST simulate a sale
router.post('/simulate', async (req, res) => {
  try {
    const { product_id } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock <= 0) return res.status(400).json({ error: 'Out of stock' });

    const quantity = Math.floor(Math.random() * 5) + 1;
    const actualQty = Math.min(quantity, product.stock);
    const total_price = actualQty * product.price;

    const sale = new Sale({ product_id, quantity: actualQty, total_price, date: new Date() });
    await sale.save();

    product.stock -= actualQty;
    await product.save();

    req.io.emit('sale:new', {
      sale: sale.toObject(),
      product: product.toObject(),
      quantity: actualQty,
      total_price
    });

    res.status(201).json({ sale, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

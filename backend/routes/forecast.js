const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

function generateForecast(avgUnits, avgRevenue, view) {
  const growth = 1.1;
  if (view === 'week') {
    return Array.from({ length: 7 }, (_, i) => ({
      label: `Day ${i + 1}`,
      units: Math.round((avgUnits / 30) * growth),
      revenue: Math.round((avgRevenue / 30) * growth)
    }));
  } else if (view === 'month') {
    return Array.from({ length: 4 }, (_, i) => ({
      label: `Week ${i + 1}`,
      units: Math.round((avgUnits / 4) * growth),
      revenue: Math.round((avgRevenue / 4) * growth)
    }));
  } else {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return {
        label: monthNames[i],
        units: Math.round(avgUnits * growth),
        revenue: Math.round(avgRevenue * growth)
      };
    });
  }
}

// GET forecast for a specific product
router.get('/product/:id', async (req, res) => {
  try {
    const { view = 'month' } = req.query;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentSales = await Sale.aggregate([
      { $match: { product_id: product._id, date: { $gte: threeMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, units: { $sum: '$quantity' }, revenue: { $sum: '$total_price' } } }
    ]);

    const avgUnits = recentSales.length > 0 ? recentSales.reduce((s, m) => s + m.units, 0) / recentSales.length : 50;
    const avgRevenue = recentSales.length > 0 ? recentSales.reduce((s, m) => s + m.revenue, 0) / recentSales.length : product.price * 50;

    const forecast = generateForecast(avgUnits, avgRevenue, view);
    res.json({ forecast, view });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET overall forecast
router.get('/overall', async (req, res) => {
  try {
    const { view = 'month' } = req.query;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentSales = await Sale.aggregate([
      { $match: { date: { $gte: threeMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, units: { $sum: '$quantity' }, revenue: { $sum: '$total_price' } } }
    ]);

    const avgUnits = recentSales.length > 0 ? recentSales.reduce((s, m) => s + m.units, 0) / recentSales.length : 200;
    const avgRevenue = recentSales.length > 0 ? recentSales.reduce((s, m) => s + m.revenue, 0) / recentSales.length : 50000;

    const forecast = generateForecast(avgUnits, avgRevenue, view);
    res.json({ forecast, view });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

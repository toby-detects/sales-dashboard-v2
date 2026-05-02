const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST confirm a transaction (cashier checkout)
router.post('/', async (req, res) => {
  try {
    const { items, cashier_name } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock for all items first
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product_name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Generate transaction number
    const count = await Transaction.countDocuments();
    const transaction_no = `TXN-${String(count + 1).padStart(4, '0')}`;

    // Calculate total
    const total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Save transaction
    const transaction = new Transaction({
      transaction_no,
      items,
      total_amount,
      cashier_name: cashier_name || 'Cashier',
      date: new Date()
    });
    await transaction.save();

    // Update stock and create sale records for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity }
      });

      await Sale.create({
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.subtotal,
        date: new Date()
      });
    }

    // Get updated products to emit
    const updatedProducts = await Promise.all(
      items.map(item => Product.findById(item.product_id))
    );

    // Emit real-time event
    req.io.emit('transaction:new', {
      transaction: transaction.toObject(),
      updatedProducts: updatedProducts.map(p => p.toObject())
    });

    res.status(201).json({ transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

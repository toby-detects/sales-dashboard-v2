const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const transactionSchema = new mongoose.Schema(
  {
    transaction_no: { type: String, required: true, unique: true },
    items: [transactionItemSchema],
    total_amount: { type: Number, required: true },
    cashier_name: { type: String, default: 'Cashier' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);

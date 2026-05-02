import React, { useState } from 'react'
import { createProduct } from '../api'

export default function UploadProductModal({ onClose, onProductAdded }) {
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await createProduct({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      })
      onProductAdded(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">Upload New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Headphones"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price (₱)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-primary" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-orange-primary text-white text-sm py-2 rounded-lg hover:bg-orange-dark disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

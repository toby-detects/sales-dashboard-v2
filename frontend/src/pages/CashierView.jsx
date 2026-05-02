import React, { useState, useEffect } from 'react'
import { getProducts, confirmTransaction } from '../api'
import Cart from '../components/Cart'
import Receipt from '../components/Receipt'

export default function CashierView() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [cashierName] = useState('Store Cashier')
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    getProducts().then(({ data }) => setProducts(data))
  }, [])

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    return matchSearch && matchCat
  })

  const addToCart = (product) => {
    if (product.stock <= 0) return
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product._id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(i => i.product_id === product._id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
          : i
        )
      }
      return [...prev, {
        product_id: product._id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        subtotal: product.price,
        stock: product.stock
      }]
    })
    setFlash(product._id)
    setTimeout(() => setFlash(null), 400)
  }

  const updateQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId)
      return
    }
    const cartItem = cart.find(i => i.product_id === productId)
    if (newQty > cartItem.stock) return
    setCart(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity: newQty, subtotal: newQty * i.unit_price }
        : i
    ))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product_id !== productId))
  }

  const handleConfirm = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const { data } = await confirmTransaction({
        items: cart,
        cashier_name: cashierName
      })
      setReceipt(data.transaction)
      setCart([])
      // Refresh product stock
      const { data: updated } = await getProducts()
      setProducts(updated)
    } catch (err) {
      alert(err.response?.data?.error || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const cartQty = (productId) => cart.find(i => i.product_id === productId)?.quantity || 0

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-base font-bold text-gray-800">🛒 Cashier POS</div>
          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{cashierName}</div>
        </div>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* LEFT — Product Grid */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">

          {/* Search + Category filters */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#FF6B35] bg-white"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35] font-medium'
                      : 'border-gray-200 text-gray-500 bg-white hover:border-[#FF6B35] hover:text-[#FF6B35]'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(product => {
                const inCart = cartQty(product._id)
                const outOfStock = product.stock <= 0
                const isFlashing = flash === product._id

                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={`relative text-left bg-white rounded-xl border p-3 transition-all ${
                      outOfStock
                        ? 'opacity-40 cursor-not-allowed border-gray-100'
                        : isFlashing
                        ? 'border-[#FF6B35] bg-orange-50 scale-95'
                        : inCart > 0
                        ? 'border-[#FF6B35] bg-[#FFF3EE] hover:shadow-md'
                        : 'border-gray-100 hover:border-[#FF6B35] hover:shadow-md'
                    }`}
                  >
                    {/* Cart badge */}
                    {inCart > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                        {inCart}
                      </div>
                    )}

                    {/* Category tag */}
                    <div className="text-[9px] text-[#4A90E2] bg-[#E6F1FB] px-1.5 py-0.5 rounded inline-block mb-1.5">
                      {product.category}
                    </div>

                    <div className="text-xs font-semibold text-gray-800 leading-tight mb-1">
                      {product.name}
                    </div>

                    <div className="text-sm font-bold text-[#FF6B35]">
                      ₱{product.price.toLocaleString()}
                    </div>

                    <div className={`text-[10px] mt-1 font-medium ${
                      product.stock <= 10 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {outOfStock ? '❌ Out of stock' : `📦 ${product.stock} left`}
                    </div>

                    {!outOfStock && (
                      <div className="mt-2 w-full bg-[#FF6B35] text-white text-[10px] py-1 rounded-lg text-center font-medium">
                        + Add
                      </div>
                    )}
                  </button>
                )
              })}

              {filtered.length === 0 && (
                <div className="col-span-5 text-center text-gray-300 text-sm py-10">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Cart */}
        <div className="w-72 xl:w-80 bg-white border-l border-gray-100 p-4 flex flex-col overflow-hidden shrink-0">
          <Cart
            items={cart}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onConfirm={handleConfirm}
            loading={loading}
          />
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <Receipt
          transaction={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import TrendBadge from './TrendBadge'
import UploadProductModal from './UploadProductModal'

export default function Sidebar({ products, activeTab, onTabChange, selectedProduct, onSelectProduct, onProductAdded }) {
  const [search, setSearch] = useState('')
  const [activeCategories, setActiveCategories] = useState([])
  const [showModal, setShowModal] = useState(false)

  const allCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))]
    return cats
  }, [products])

  const toggleCategory = (cat) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategories.length === 0 || activeCategories.includes(p.category)
      return matchSearch && matchCat
    })
  }, [products, search, activeCategories])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = []
      acc[p.category].push(p)
      return acc
    }, {})
  }, [filtered])

  const totalRevenue = products.reduce((s, p) => s + (p.currentMonthRevenue || 0), 0)
  const totalUnits = products.reduce((s, p) => s + (p.currentMonthUnits || 0), 0)

  return (
    <aside className="w-56 bg-[#FF6B35] flex flex-col h-screen overflow-hidden">
      <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-70" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white/20 border border-white/30 rounded-lg py-1.5 pl-7 pr-3 text-white text-xs placeholder-white/60 outline-none focus:border-white/60"
          />
        </div>

        {/* Category Toggles */}
        {allCategories.length > 0 && (
          <div>
            <div className="text-white/60 text-[10px] font-medium mb-1.5">Filter by category</div>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                    activeCategories.includes(cat)
                      ? 'bg-white text-[#FF6B35] border-transparent font-medium'
                      : 'border-white/40 text-white/80 bg-transparent hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-black/15 rounded-lg p-0.5 gap-0.5">
          {['products', 'overall'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-white text-[#FF6B35]' : 'text-white/70 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-3">
            {Object.keys(grouped).length === 0 && (
              <div className="text-white/60 text-xs text-center py-4">
                {products.length === 0 ? 'No products yet. Upload one!' : 'No results found.'}
              </div>
            )}
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="text-white/60 text-[9px] font-semibold tracking-widest uppercase mb-1.5">{cat}</div>
                <div className="flex flex-col gap-1.5">
                  {items.map(product => (
                    <button
                      key={product._id}
                      onClick={() => onSelectProduct(product)}
                      className={`w-full text-left rounded-lg px-2.5 py-2 border transition-all ${
                        selectedProduct?._id === product._id
                          ? 'bg-white/28 border-white/50'
                          : 'bg-white/12 border-white/15 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="min-w-0">
                          <div className="text-white text-xs font-medium truncate">{product.name}</div>
                          <div className="text-white/65 text-[10px] mt-0.5">₱{product.price.toLocaleString()} · {product.stock} stock</div>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                          product.trendDir === 'up' ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'
                        }`}>
                          {product.trendDir === 'up'
                            ? <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><polyline points="1,6 4,2 7,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><polyline points="1,2 4,6 7,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          }
                          {Math.abs(product.trendPct)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overall Tab */}
        {activeTab === 'overall' && (
          <div className="flex flex-col gap-2">
            <div className="bg-white/12 rounded-lg p-2.5">
              <div className="text-white/65 text-[10px]">Total Revenue</div>
              <div className="text-white text-base font-semibold mt-0.5">₱{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white/12 rounded-lg p-2.5">
              <div className="text-white/65 text-[10px]">Units Sold</div>
              <div className="text-white text-base font-semibold mt-0.5">{totalUnits.toLocaleString()}</div>
            </div>
            <div className="bg-white/12 rounded-lg p-2.5">
              <div className="text-white/65 text-[10px]">Active Products</div>
              <div className="text-white text-base font-semibold mt-0.5">{products.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="p-3 border-t border-white/20">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-white/15 border border-white/40 text-white text-xs py-2 rounded-lg hover:bg-white/25 transition-all"
        >
          + Upload Product
        </button>
      </div>

      {showModal && (
        <UploadProductModal
          onClose={() => setShowModal(false)}
          onProductAdded={onProductAdded}
        />
      )}
    </aside>
  )
}

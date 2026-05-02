import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import ProductAnalytics from '../components/ProductAnalytics'
import OverallAnalytics from '../components/OverallAnalytics'
import TransactionHistory from '../components/TransactionHistory'
import { getProducts } from '../api'
import { useSocket } from '../hooks/useSocket'

export default function AdminView() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showTransactions, setShowTransactions] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await getProducts()
      setProducts(data)
      if (selectedProduct) {
        const updated = data.find(p => p._id === selectedProduct._id)
        if (updated) setSelectedProduct(updated)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    }
  }, [selectedProduct?._id])

  useEffect(() => {
    fetchProducts()
  }, [])

  useSocket({
    onSaleNew: () => {
      setRefreshKey(k => k + 1)
      setTimeout(fetchProducts, 300)
    },
    onProductNew: (newProduct) => {
      setProducts(prev => [newProduct, ...prev])
    },
    onTransactionNew: ({ updatedProducts }) => {
      setProducts(prev => prev.map(p => {
        const updated = updatedProducts.find(u => u._id === p._id)
        return updated ? { ...p, stock: updated.stock } : p
      }))
      setRefreshKey(k => k + 1)
      setTimeout(fetchProducts, 300)
    }
  })

  const handleProductAdded = (product) => {
    setProducts(prev => [product, ...prev])
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setActiveTab('products')
    setShowTransactions(false)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'overall') setSelectedProduct(null)
    setShowTransactions(false)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        products={products}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedProduct={selectedProduct}
        onSelectProduct={handleSelectProduct}
        onProductAdded={handleProductAdded}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Transaction History Toggle */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400">
            {selectedProduct ? `Viewing: ${selectedProduct.name}` : activeTab === 'overall' ? 'Overall Sales' : 'Select a product'}
          </div>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              showTransactions
                ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                : 'border-gray-200 text-gray-500 hover:border-[#FF6B35] hover:text-[#FF6B35]'
            }`}>
            📋 Transaction History
          </button>
        </div>

        {showTransactions ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">📋 Transaction History</div>
            <TransactionHistory />
          </div>
        ) : activeTab === 'overall' ? (
          <OverallAnalytics key={refreshKey} />
        ) : (
          <ProductAnalytics
            key={`${selectedProduct?._id}-${refreshKey}`}
            product={selectedProduct}
            allProducts={products}
            onSimulateSale={fetchProducts}
          />
        )}
      </main>
    </div>
  )
}

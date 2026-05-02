import React from 'react'

export default function Cart({ items, onUpdateQty, onRemove, onConfirm, loading }) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">🛒 Cart</h2>
        <span className="bg-[#FF6B35] text-white text-xs rounded-full px-2 py-0.5 font-medium">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
            <div className="text-4xl">🛒</div>
            <div className="text-xs">No items yet</div>
            <div className="text-xs">Select products to add</div>
          </div>
        )}
        {items.map(item => (
          <div key={item.product_id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-medium text-gray-700 flex-1 pr-2">{item.product_name}</div>
              <button onClick={() => onRemove(item.product_id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none">✕</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                  className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold flex items-center justify-center transition-all">
                  −
                </button>
                <span className="text-sm font-semibold text-gray-700 w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-6 h-6 rounded-lg bg-[#FF6B35] hover:bg-[#CC4A18] text-white text-sm font-bold flex items-center justify-center transition-all disabled:opacity-40">
                  +
                </button>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">₱{item.unit_price.toLocaleString()} each</div>
                <div className="text-sm font-bold text-[#CC4A18]">₱{item.subtotal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total + Confirm */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-600">Total Amount</span>
          <span className="text-xl font-bold text-[#FF6B35]">₱{total.toLocaleString()}</span>
        </div>
        <button
          onClick={onConfirm}
          disabled={items.length === 0 || loading}
          className="w-full bg-[#FF6B35] hover:bg-[#CC4A18] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-md shadow-orange-200">
          {loading ? '⏳ Processing...' : '✅ Confirm Sale'}
        </button>
      </div>
    </div>
  )
}

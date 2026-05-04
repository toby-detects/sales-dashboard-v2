import React from 'react'

export default function TopNav({ activeView, onSwitch }) {
  return (
    <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div>
          <img src="/favicon.png" className="w-7 h-7 rounded-lg object-cover" alt="logo" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800 leading-tight">CRESCO</div>
          <div className="text-[10px] text-gray-400 leading-tight">Sales Dashboard</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => onSwitch('cashier')}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'cashier'
              ? 'bg-[#FF6B35] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          🛒 Cashier View
        </button>
        <button
          onClick={() => onSwitch('admin')}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'admin'
              ? 'bg-[#FF6B35] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          📊 Admin View
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Live</span>
      </div>
    </div>
  )
}

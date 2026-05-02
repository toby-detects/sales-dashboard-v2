import React, { useState, useEffect } from 'react'
import { getTransactions } from '../api'

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getTransactions()
      .then(({ data }) => setTransactions(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-xs text-gray-400 p-4">Loading transactions...</div>

  if (transactions.length === 0) return (
    <div className="text-xs text-gray-400 p-4 text-center">No transactions yet.</div>
  )

  return (
    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
      {transactions.map(txn => (
        <div key={txn._id}
          className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === txn._id ? null : txn._id)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#FF6B35]">{txn.transaction_no}</span>
              <span className="text-[10px] text-gray-400">
                {new Date(txn.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                {' · '}
                {new Date(txn.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">₱{txn.total_amount.toLocaleString()}</span>
              <span className="text-gray-300 text-xs">{expanded === txn._id ? '▲' : '▼'}</span>
            </div>
          </button>
          {expanded === txn._id && (
            <div className="px-3 pb-3 border-t border-gray-100">
              <div className="text-[10px] text-gray-400 mb-2 mt-1.5">
                Cashier: {txn.cashier_name} · {txn.items.length} item(s)
              </div>
              <div className="flex flex-col gap-1">
                {txn.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-600">{item.product_name} × {item.quantity}</span>
                    <span className="text-gray-700 font-medium">₱{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-dashed border-gray-200">
                <span className="text-gray-700">Total</span>
                <span className="text-[#FF6B35]">₱{txn.total_amount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

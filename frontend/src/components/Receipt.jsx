import React, { useRef } from 'react'

export default function Receipt({ transaction, onClose }) {
  const receiptRef = useRef()

  const handlePrint = () => {
    const content = receiptRef.current.innerHTML
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`
      <html><head><title>Receipt ${transaction.transaction_no}</title>
      <style>
        body { font-family: monospace; font-size: 13px; padding: 20px; }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { font-weight: bold; font-size: 15px; }
      </style></head>
      <body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  const date = new Date(transaction.date)
  const formattedDate = date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF6B35] px-6 py-4 text-center">
          <div className="text-white text-lg font-semibold">✅ Sale Confirmed!</div>
          <div className="text-white/80 text-xs mt-0.5">Transaction recorded successfully</div>
        </div>

        {/* Receipt content */}
        <div className="p-5" ref={receiptRef}>
          <div className="center text-center mb-3">
            <div className="font-bold text-base text-gray-800">🏪 MY RETAIL STORE</div>
            <div className="text-xs text-gray-400 mt-0.5">{formattedDate} · {formattedTime}</div>
            <div className="text-xs text-gray-400">Cashier: {transaction.cashier_name}</div>
            <div className="text-xs font-medium text-[#FF6B35] mt-1">{transaction.transaction_no}</div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Items */}
          <div className="flex flex-col gap-2">
            {transaction.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-medium text-gray-700">{item.product_name}</div>
                  <div className="text-[10px] text-gray-400">₱{item.unit_price.toLocaleString()} × {item.quantity}</div>
                </div>
                <div className="text-xs font-semibold text-gray-800">₱{item.subtotal.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold text-gray-800">TOTAL</div>
            <div className="text-lg font-bold text-[#FF6B35]">₱{transaction.total_amount.toLocaleString()}</div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          <div className="text-center text-[10px] text-gray-400">
            Thank you for shopping! 🙏
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={handlePrint}
            className="flex-1 border border-[#FF6B35] text-[#FF6B35] text-sm py-2 rounded-xl hover:bg-orange-50 font-medium transition-all">
            🖨️ Print
          </button>
          <button onClick={onClose}
            className="flex-1 bg-[#FF6B35] text-white text-sm py-2 rounded-xl hover:bg-[#CC4A18] font-medium transition-all">
            New Sale
          </button>
        </div>
      </div>
    </div>
  )
}

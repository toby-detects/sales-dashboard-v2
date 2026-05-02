import React from 'react'

export default function TrendBadge({ dir, pct, label }) {
  const isUp = dir === 'up'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isUp ? (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <polyline points="1,7 4.5,2 8,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <polyline points="1,2 4.5,7 8,2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label || (pct !== undefined ? `${isUp ? '+' : ''}${pct}%` : (isUp ? 'Increasing' : 'Decreasing'))}
    </span>
  )
}

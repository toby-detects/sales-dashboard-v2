import React from 'react'

export default function MetricCard({ label, value, sub }) {
  return (
    <div className="bg-orange-bg rounded-xl p-3">
      <div className="text-xs font-medium text-orange-darker">{label}</div>
      <div className="text-lg font-semibold text-orange-dark mt-0.5">{value}</div>
      {sub && <div className="text-xs text-orange-primary mt-0.5">{sub}</div>}
    </div>
  )
}

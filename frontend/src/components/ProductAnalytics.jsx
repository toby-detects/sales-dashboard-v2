import React, { useState, useEffect } from 'react'
import { getProductAnalytics, getProductForecast, simulateSale } from '../api'
import MetricCard from './MetricCard'
import SalesChart from './SalesChart'
import ForecastTable from './ForecastTable'
import TrendBadge from './TrendBadge'

const COLORS = ['#FF6B35', '#4A90E2', '#22c55e', '#f59e0b']

export default function ProductAnalytics({ product, allProducts, onSimulateSale }) {
  const [view, setView] = useState('month')
  const [analytics, setAnalytics] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    if (!product) return
    setLoading(true)
    Promise.all([
      getProductAnalytics(product._id, view),
      getProductForecast(product._id, view)
    ]).then(([analyticsRes, forecastRes]) => {
      setAnalytics(analyticsRes.data)
      setForecast(forecastRes.data.forecast || [])
    }).finally(() => setLoading(false))
  }, [product?._id, view])

  const handleSimulate = async () => {
    if (!product || simulating) return
    setSimulating(true)
    try {
      await simulateSale(product._id)
      onSimulateSale && onSimulateSale()
    } catch (err) {
      alert(err.response?.data?.error || 'Simulation failed')
    } finally {
      setSimulating(false)
    }
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a product from the sidebar to view analytics
      </div>
    )
  }

  const totalUnits = analytics?.salesData?.reduce((s, d) => s + d.units, 0) || 0
  const totalRevenue = analytics?.salesData?.reduce((s, d) => s + d.revenue, 0) || 0
  const trendPct = product.trendPct || 0
  const trendDir = product.trendDir || 'up'

  // Top products ranking
  const topProducts = [...allProducts].sort((a, b) => (b.currentMonthUnits || 0) - (a.currentMonthUnits || 0)).slice(0, 5)
  const maxUnits = topProducts[0]?.currentMonthUnits || 1

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{product.name}</span>
          <span className="text-xs bg-blue-light text-blue-text px-2 py-0.5 rounded">{product.category}</span>
          <TrendBadge dir={trendDir} label={trendDir === 'up' ? 'Increasing' : 'Decreasing'} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {['week', 'month', 'year'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`text-xs px-3 py-1 rounded border capitalize transition-all ${
                  view === v ? 'bg-blue-accent text-white border-blue-accent' : 'border-blue-accent text-blue-accent hover:bg-blue-light'
                }`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={handleSimulate} disabled={simulating || product.stock <= 0}
            className="text-xs px-3 py-1 rounded bg-orange-primary text-white hover:bg-orange-dark disabled:opacity-50 transition-all">
            {simulating ? 'Simulating...' : '⚡ Simulate Sale'}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Total Sales" value={totalUnits.toLocaleString()} />
        <MetricCard label="Revenue" value={`₱${totalRevenue.toLocaleString()}`} />
        <MetricCard label="Growth" value={`${trendDir === 'up' ? '+' : ''}${trendPct}%`} />
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Sales over time</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#FF6B35] rounded" /><span className="text-[10px] text-gray-400">Actual</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-0 border-t-2 border-dashed border-[#4A90E2]" /><span className="text-[10px] text-gray-400">Forecast</span></div>
          </div>
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-300 text-xs">Loading...</div>
        ) : (
          <SalesChart salesData={analytics?.salesData || []} forecast={forecast} view={view} />
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Products */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">Top products this month</div>
          <div className="flex flex-col gap-2">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-20 truncate">{p.name}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all" style={{
                    width: `${Math.round(((p.currentMonthUnits || 0) / maxUnits) * 100)}%`,
                    background: COLORS[i % COLORS.length]
                  }} />
                </div>
                <span className="text-[10px] text-gray-700 w-8 text-right">{(p.currentMonthUnits || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-bg rounded-lg p-2 mt-2">
            <div className="text-[10px] text-blue-text">
              {product.name} {trendDir === 'up' ? `sold ${Math.abs(trendPct)}% more` : `sold ${Math.abs(trendPct)}% less`} than last month.
            </div>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1 capitalize">{view}ly forecast</div>
          <ForecastTable forecast={forecast} />
        </div>
      </div>
    </div>
  )
}

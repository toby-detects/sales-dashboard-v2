import React, { useState, useEffect } from 'react'
import { getOverallSales, getOverallForecast } from '../api'
import MetricCard from './MetricCard'
import SalesChart from './SalesChart'
import ForecastTable from './ForecastTable'
import TrendBadge from './TrendBadge'

export default function OverallAnalytics() {
  const [view, setView] = useState('month')
  const [data, setData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getOverallSales(view),
      getOverallForecast(view)
    ]).then(([salesRes, forecastRes]) => {
      setData(salesRes.data)
      setForecast(forecastRes.data.forecast || [])
    }).finally(() => setLoading(false))
  }, [view])

  const trendDir = (data?.avgGrowth || 0) >= 0 ? 'up' : 'down'
  const maxCatRevenue = data?.byCategory?.[0]?.revenue || 1

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Overall Sales Performance</span>
          <TrendBadge dir={trendDir} label={trendDir === 'up' ? 'Increasing' : 'Decreasing'} />
        </div>
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
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        <MetricCard label="Total Revenue" value={`₱${(data?.totalRevenue || 0).toLocaleString()}`} />
        <MetricCard label="Units Sold" value={(data?.totalUnits || 0).toLocaleString()} />
        <MetricCard label="Avg. Growth" value={`${trendDir === 'up' ? '+' : ''}${data?.avgGrowth || 0}%`} />
        <MetricCard label="Products" value={data?.productCount || 0} />
      </div>

      {/* Combined Chart */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">All products — combined sales</span>
          <TrendBadge dir={trendDir} pct={data?.avgGrowth || 0} />
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-300 text-xs">Loading...</div>
        ) : (
          <SalesChart multiLine productLines={data?.perProductSales || []} view={view} />
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue by Category */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">Revenue by category</div>
          <div className="flex flex-col gap-2.5">
            {(data?.byCategory || []).map((cat, i) => {
              const pct = Math.round((cat.revenue / (data?.totalRevenue || 1)) * 100)
              const colors = ['#FF6B35', '#4A90E2', '#22c55e', '#f59e0b']
              return (
                <div key={cat._id} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-20 truncate">{cat._id}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${Math.round((cat.revenue / maxCatRevenue) * 100)}%`, background: colors[i % colors.length] }} />
                  </div>
                  <span className="text-[10px] text-gray-700 w-12 text-right">₱{(cat.revenue / 1000).toFixed(0)}K</span>
                  <span className="text-[10px] text-gray-400 w-6">{pct}%</span>
                </div>
              )
            })}
          </div>
          {data?.byCategory?.[0] && (
            <div className="bg-blue-bg rounded-lg p-2 mt-2">
              <div className="text-[10px] text-blue-text">
                {data.byCategory[0]._id} leads all categories with ₱{(data.byCategory[0].revenue / 1000).toFixed(0)}K in revenue.
              </div>
            </div>
          )}
        </div>

        {/* Overall Forecast Table */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1 capitalize">Overall {view}ly forecast</div>
          <ForecastTable forecast={forecast} />
        </div>
      </div>
    </div>
  )
}

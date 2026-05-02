import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Legend
} from 'recharts'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildLabel(item, view) {
  if (view === 'week') return `Day ${item._id.week || ''}`
  return MONTH_NAMES[(item._id.month || 1) - 1] + (item._id.year ? ` '${String(item._id.year).slice(2)}` : '')
}

export default function SalesChart({ salesData = [], forecast = [], view = 'month', multiLine = false, productLines = [] }) {
  const chartData = useMemo(() => {
    if (multiLine && productLines.length > 0) {
      // Build combined dataset for overall view
      const map = {}
      productLines.forEach(({ product, salesData: sd }) => {
        sd.forEach(item => {
          const label = buildLabel(item, view)
          if (!map[label]) map[label] = { label }
          map[label][product.name] = item.units
        })
      })
      return Object.values(map)
    }

    const actual = salesData.map(item => ({
      label: buildLabel(item, view),
      units: item.units,
      revenue: item.revenue,
      type: 'actual'
    }))

    const forecastItems = forecast.map(f => ({
      label: f.label,
      forecastUnits: f.units,
      forecastRevenue: f.revenue,
      type: 'forecast'
    }))

    // Merge last actual point into forecast start for visual continuity
    const merged = [...actual]
    if (actual.length > 0 && forecastItems.length > 0) {
      forecastItems[0] = { ...forecastItems[0], units: actual[actual.length - 1].units }
    }
    return [...merged, ...forecastItems]
  }, [salesData, forecast, view, multiLine, productLines])

  const forecastStartLabel = forecast.length > 0 && salesData.length > 0
    ? forecast[0].label : null

  const COLORS = ['#FF6B35', '#4A90E2', '#22c55e', '#f59e0b', '#a855f7']

  if (multiLine && productLines.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={36} label={{ value: 'Units', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af', dx: -2 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          {productLines.map(({ product }, i) => (
            <Line key={product._id} type="monotone" dataKey={product.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const trendPct = useMemo(() => {
    if (salesData.length < 2) return 0
    const first = salesData[0]?.units || 0
    const last = salesData[salesData.length - 1]?.units || 0
    return first > 0 ? Math.round(((last - first) / first) * 100) : 0
  }, [salesData])

  const trendDir = trendPct >= 0 ? 'up' : 'down'

  const CustomLabel = ({ viewBox }) => {
    if (!viewBox) return null
    return (
      <g>
        <rect x={viewBox.x - 30} y={viewBox.y - 20} width={64} height={16} rx={4} fill={trendDir === 'up' ? '#dcfce7' : '#fee2e2'} />
        <text x={viewBox.x + 2} y={viewBox.y - 8} textAnchor="middle" fontSize={9} fontWeight={500} fill={trendDir === 'up' ? '#15803d' : '#b91c1c'}>
          {trendDir === 'up' ? '+' : ''}{trendPct}% trend
        </text>
      </g>
    )
  }

  const midIndex = Math.floor(salesData.length / 2)
  const midLabel = salesData[midIndex] ? buildLabel(salesData[midIndex], view) : null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} label={{ value: 'Units sold', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af', dx: 4 }} />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
          formatter={(val, name) => [val?.toLocaleString(), name === 'units' ? 'Units Sold' : name === 'forecastUnits' ? 'Forecast Units' : name]}
        />
        {forecastStartLabel && (
          <ReferenceArea x1={forecastStartLabel} fill="#4A90E2" fillOpacity={0.04} label={{ value: 'forecast', position: 'insideTopRight', fontSize: 9, fill: '#4A90E2' }} />
        )}
        {forecastStartLabel && (
          <ReferenceLine x={forecastStartLabel} stroke="#4A90E2" strokeDasharray="4 3" strokeOpacity={0.5} />
        )}
        {midLabel && (
          <ReferenceLine x={midLabel} strokeOpacity={0} label={<CustomLabel />} />
        )}
        <Line type="monotone" dataKey="units" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3, fill: '#FF6B35' }} activeDot={{ r: 5 }} name="units" connectNulls />
        <Line type="monotone" dataKey="forecastUnits" stroke="#4A90E2" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#4A90E2' }} name="forecastUnits" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}

import React from 'react'

export default function ForecastTable({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return <div className="text-xs text-gray-400 mt-2">No forecast data</div>
  }
  return (
    <table className="w-full text-xs mt-1 border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Period</th>
          <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Est. Units</th>
          <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Est. Revenue</th>
        </tr>
      </thead>
      <tbody>
        {forecast.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="py-1.5 px-2 text-gray-700">{row.label}</td>
            <td className="py-1.5 px-2 text-gray-700">{row.units.toLocaleString()}</td>
            <td className="py-1.5 px-2 text-gray-700">₱{row.revenue.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

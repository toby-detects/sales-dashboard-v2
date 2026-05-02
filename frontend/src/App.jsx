import React, { useState } from 'react'
import TopNav from './components/TopNav'
import AdminView from './pages/AdminView'
import CashierView from './pages/CashierView'

export default function App() {
  const [activeView, setActiveView] = useState('admin')

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TopNav activeView={activeView} onSwitch={setActiveView} />
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeView === 'admin' ? (
          <AdminView />
        ) : (
          <CashierView />
        )}
      </div>
    </div>
  )
}

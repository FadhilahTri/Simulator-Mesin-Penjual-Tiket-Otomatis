/**
 * Layout.jsx — Main layout wrapper with sidebar and topbar.
 */
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Background effects */}
      <div className="bg-glow-indigo" />
      <div className="bg-glow-cyan" />
      <div className="bg-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

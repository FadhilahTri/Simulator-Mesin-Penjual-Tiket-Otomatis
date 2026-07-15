/**
 * Topbar.jsx — Top navigation bar for SmartTicket dashboard.
 */
import { Menu, Bell, Activity, Ticket } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/finite-automata': 'Finite Automata — DFA & NFA',
  '/regular-expression': 'Regular Expression',
  '/pda-cfg': 'PDA & Context-Free Grammar',
  '/cnf-converter': 'CNF Converter & Chomsky Hierarchy',
  '/history': 'Simulation History',
  '/about': 'About SmartTicket',
}

export default function Topbar({ onMenuToggle }) {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'SmartTicket'
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="topbar">
      {/* Left: Menu + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          id="menu-toggle-btn"
          onClick={onMenuToggle}
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer', padding: 6,
            borderRadius: 8,
            display: 'flex', alignItems: 'center',
            transition: 'color 0.2s, background 0.2s',
          }}
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {now}
          </div>
        </div>
      </div>

      {/* Right: Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* API Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          borderRadius: 20,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          fontSize: 12, fontWeight: 600,
          color: '#34d399',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 6px #34d399',
            animation: 'pulse-state 2s infinite',
          }} />
          API Online
        </div>

        {/* Ticket icon */}
        <div style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={16} color="var(--color-indigo-light)" />
        </div>
      </div>
    </header>
  )
}

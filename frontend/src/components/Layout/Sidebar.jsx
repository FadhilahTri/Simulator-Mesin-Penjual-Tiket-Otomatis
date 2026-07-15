/**
 * Sidebar.jsx — Navigation sidebar for SmartTicket dashboard.
 */
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Cpu, FileText, GitBranch, Layers,
  History, Info, Ticket, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/finite-automata', label: 'Finite Automata', icon: Cpu },
  { path: '/regular-expression', label: 'Regular Expression', icon: FileText },
  { path: '/pda-cfg', label: 'PDA & CFG', icon: GitBranch },
  { path: '/cnf-converter', label: 'CNF Converter', icon: Layers },
  { path: '/history', label: 'Simulation History', icon: History },
  { path: '/about', label: 'About', icon: Info },
]

const MODULE_BADGES = {
  '/finite-automata': 'DFA/NFA',
  '/regular-expression': 'Regex',
  '/pda-cfg': 'CFG/PDA',
  '/cnf-converter': 'CNF',
}

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-90 md:hidden"
          onClick={onClose}
          style={{ zIndex: 99 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        style={{ zIndex: 100 }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                flexShrink: 0
              }}>
                <Ticket size={18} color="white" />
              </div>
              <div>
                <div style={{
                  fontWeight: 800, fontSize: 16,
                  background: 'linear-gradient(135deg, #f1f5f9, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  SmartTicket
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                  AUTOMATA SIMULATOR
                </div>
              </div>
            </div>
            {/* Mobile close */}
            <button
              onClick={onClose}
              style={{
                display: 'none', // shown via CSS on mobile
                background: 'none', border: 'none',
                color: 'var(--color-text-muted)', cursor: 'pointer'
              }}
              className="mobile-close-btn"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="section-label" style={{ paddingLeft: 14, marginBottom: 12 }}>
            Navigation
          </div>

          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            const badge = MODULE_BADGES[path]

            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <Icon className="icon" size={18} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)',
                    color: isActive ? '#818cf8' : 'var(--color-text-muted)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    letterSpacing: '0.03em'
                  }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}

          {/* Section divider */}
          <div style={{
            height: 1,
            background: 'rgba(99,102,241,0.1)',
            margin: '16px 0'
          }} />

          {/* Theory Modules Label */}
          <div className="section-label" style={{ paddingLeft: 14, marginBottom: 8 }}>
            Theory Modules
          </div>

          {/* Module chips */}
          <div style={{ padding: '0 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: 'DFA', color: '#6366f1' },
              { label: 'NFA', color: '#a855f7' },
              { label: 'Regex', color: '#06b6d4' },
              { label: 'CFG', color: '#10b981' },
              { label: 'PDA', color: '#f59e0b' },
              { label: 'CNF', color: '#f43f5e' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                padding: '3px 8px',
                borderRadius: 6,
                background: `${color}18`,
                color: color,
                border: `1px solid ${color}30`,
              }}>
                {label}
              </span>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(99,102,241,0.1)',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Capstone Project
          </div>
          <div>Teori Bahasa & Otomata</div>
          <div style={{ marginTop: 4, color: '#475569' }}>v1.0.0 • 2026</div>
        </div>
      </aside>
    </>
  )
}

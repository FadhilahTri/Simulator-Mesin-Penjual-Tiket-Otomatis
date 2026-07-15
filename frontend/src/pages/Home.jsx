/**
 * Home.jsx — SmartTicket Dashboard / Landing Page.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Ticket, Cpu, FileText, GitBranch, Layers,
  ArrowRight, CheckCircle, Train, Clock,
  CreditCard, Printer, Coins, Star, Zap
} from 'lucide-react'
import { getHistoryStats, healthCheck } from '../services/api'

// Transaction flow steps
const FLOW_STEPS = [
  { icon: Train, label: 'Pilih Tujuan', state: 'q0→q1', color: '#6366f1', desc: 'User memilih stasiun tujuan' },
  { icon: Star, label: 'Pilih Kelas', state: 'q1→q2', color: '#a855f7', desc: 'Eksekutif / Bisnis / Ekonomi' },
  { icon: Ticket, label: 'Pilih Jumlah', state: 'q2→q3', color: '#06b6d4', desc: 'Jumlah penumpang' },
  { icon: Zap, label: 'Hitung Harga', state: 'q3→q4', color: '#f59e0b', desc: 'Kalkulasi total biaya' },
  { icon: CreditCard, label: 'Pembayaran', state: 'q4→q5', color: '#10b981', desc: 'Tunai / Kartu / QRIS' },
  { icon: CheckCircle, label: 'Validasi', state: 'q5→q6', color: '#34d399', desc: 'Verifikasi pembayaran' },
  { icon: Printer, label: 'Cetak Tiket', state: 'q6→q7', color: '#22d3ee', desc: 'Tiket dicetak otomatis' },
  { icon: Coins, label: 'Kembalian', state: 'q7→q8', color: '#fb923c', desc: 'Kembalian diberikan' },
  { icon: CheckCircle, label: 'Selesai', state: 'q8→q9', color: '#4ade80', desc: 'Transaksi selesai ✓' },
]

const THEORY_MODULES = [
  {
    path: '/finite-automata',
    title: 'Finite State Automata',
    subtitle: 'DFA & NFA',
    icon: Cpu,
    color: '#6366f1',
    desc: 'Simulasi DFA/NFA dengan animasi state, trace langkah demi langkah, konversi NFA→DFA.',
    badge: 'Module 1',
  },
  {
    path: '/regular-expression',
    title: 'Regular Expression',
    subtitle: 'Regex & NFA',
    icon: FileText,
    color: '#06b6d4',
    desc: 'Validasi format tiket, konversi Regex→NFA (Thompson), ekstraksi grammar reguler.',
    badge: 'Module 2',
  },
  {
    path: '/pda-cfg',
    title: 'PDA & CFG',
    subtitle: 'Context-Free Grammar',
    icon: GitBranch,
    color: '#10b981',
    desc: 'Simulasi PDA dengan stack, derivasi kiri/kanan, parse tree interaktif.',
    badge: 'Module 3',
  },
  {
    path: '/cnf-converter',
    title: 'CNF Converter',
    subtitle: 'Chomsky Normal Form',
    icon: Layers,
    color: '#f59e0b',
    desc: 'Transformasi 4 langkah ke CNF: hapus ε, unit, useless symbol, binarisasi.',
    badge: 'Module 4',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    // Check API health
    healthCheck()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))

    // Fetch stats
    getHistoryStats()
      .then(res => setStats(res.data))
      .catch(() => {})

    // Auto-advance flow steps
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % FLOW_STEPS.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>

      {/* ---- Hero Section ---- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card-static"
        style={{
          padding: '48px',
          marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,11,24,0.8) 50%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            flexShrink: 0,
          }}>
            <Ticket size={32} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900 }}>
              <span className="gradient-text">SmartTicket</span>
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 16 }}>
              Automatic Ticket Vending Machine Simulator — Teori Bahasa & Otomata
            </p>
          </div>
        </div>

        <p style={{
          color: 'var(--color-text-secondary)', fontSize: 15,
          lineHeight: 1.7, maxWidth: 680, margin: '0 0 32px',
        }}>
          Capstone Project yang mengimplementasikan <strong style={{ color: 'var(--color-indigo-light)' }}>DFA, NFA, Regular Expression, CFG, PDA, dan CNF</strong> secara nyata
          untuk mensimulasikan sistem mesin penjualan tiket kereta otomatis. Setiap tahapan transaksi
          direpresentasikan dengan konsep automata yang tepat.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/finite-automata')} id="start-simulation-btn">
            <Cpu size={16} />
            Mulai Simulasi
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={() => navigate('/about')} id="learn-more-btn">
            <Star size={16} />
            Pelajari Lebih Lanjut
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: apiStatus === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${apiStatus === 'online' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            fontSize: 13, fontWeight: 600,
            color: apiStatus === 'online' ? '#34d399' : '#fb7185',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: apiStatus === 'online' ? '#34d399' : '#fb7185',
              boxShadow: `0 0 6px ${apiStatus === 'online' ? '#34d399' : '#fb7185'}`,
            }} />
            Flask API {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking...'}
          </div>
        </div>
      </motion.div>

      {/* ---- Stats Row ---- */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: 'Total Simulasi', value: stats.total, color: '#6366f1' },
            { label: 'Accepted', value: stats.accepted, color: '#10b981' },
            { label: 'Rejected', value: stats.rejected, color: '#f43f5e' },
            { label: 'Success', value: stats.success, color: '#06b6d4' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: 'var(--font-mono)' }}>
                {value ?? 0}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ---- Transaction Flow ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-static"
        style={{ padding: 32, marginBottom: 32 }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
          Alur Transaksi SmartTicket
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '0 0 24px' }}>
          Setiap tahap dimodelkan sebagai perpindahan state dalam DFA (q0 → q9)
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {FLOW_STEPS.map((step, idx) => {
            const Icon = step.icon
            const isActive = idx === activeStep
            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isActive ? 1.03 : 1,
                  borderColor: isActive ? step.color : 'rgba(99,102,241,0.15)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: isActive ? `${step.color}15` : 'rgba(13,21,38,0.6)',
                  border: `1px solid ${isActive ? step.color + '60' : 'rgba(99,102,241,0.15)'}`,
                  boxShadow: isActive ? `0 0 20px ${step.color}25` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${step.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={step.color} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: step.color,
                    background: `${step.color}15`,
                    padding: '2px 6px', borderRadius: 4,
                  }}>
                    {step.state}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{step.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ---- Theory Modules ---- */}
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
        Modul Teori Otomata
      </h2>
      <div
        className="stagger-children"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {THEORY_MODULES.map((mod, idx) => {
          const Icon = mod.icon
          return (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="glass-card"
              onClick={() => navigate(mod.path)}
              style={{ padding: 24, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${mod.color}20`,
                  border: `1px solid ${mod.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} color={mod.color} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 20,
                  background: `${mod.color}15`,
                  color: mod.color,
                  border: `1px solid ${mod.color}30`,
                }}>
                  {mod.badge}
                </span>
              </div>

              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{mod.title}</div>
              <div style={{
                fontSize: 12, fontWeight: 600, color: mod.color,
                marginBottom: 10,
              }}>
                {mod.subtitle}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
                {mod.desc}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: mod.color, fontSize: 13, fontWeight: 600,
              }}>
                Buka Modul <ArrowRight size={14} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

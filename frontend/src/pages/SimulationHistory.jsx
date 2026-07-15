/**
 * SimulationHistory.jsx — Riwayat semua simulasi yang pernah dijalankan.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Trash2, RefreshCw, Search, Filter,
  Clock, Cpu, FileText, GitBranch, Layers,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  XCircle, Inbox
} from 'lucide-react'
import { getHistory, deleteHistory, clearHistory } from '../services/api'
import toast from 'react-hot-toast'

const MODULE_ICONS = {
  dfa: Cpu,
  nfa: Cpu,
  nfa_to_dfa: Cpu,
  regex: FileText,
  cfg: GitBranch,
  pda: GitBranch,
  cnf: Layers,
  automata: Cpu,
}

const MODULE_COLORS = {
  dfa: '#6366f1',
  nfa: '#818cf8',
  nfa_to_dfa: '#6366f1',
  regex: '#06b6d4',
  cfg: '#a855f7',
  pda: '#a855f7',
  cnf: '#f59e0b',
  automata: '#6366f1',
}

const MODULE_LABELS = {
  dfa: 'Finite Automata (DFA)',
  nfa: 'Finite Automata (NFA)',
  nfa_to_dfa: 'NFA → DFA',
  regex: 'Regular Expression',
  cfg: 'PDA & CFG',
  pda: 'PDA & CFG',
  cnf: 'CNF Converter',
  automata: 'Finite Automata',
}

// Normalize raw module name from backend
const normalizeModule = (raw = '') =>
  raw.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')


const STATUS_CONFIG = {
  accepted: { icon: CheckCircle, color: '#10b981', label: 'Diterima' },
  rejected: { icon: XCircle, color: '#f43f5e', label: 'Ditolak' },
  error: { icon: AlertCircle, color: '#f59e0b', label: 'Error' },
}

function HistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const mod = normalizeModule(item.module ?? item.modul ?? '')
  const Icon = MODULE_ICONS[mod] ?? History
  const color = MODULE_COLORS[mod] ?? '#6366f1'
  const statusCfg = STATUS_CONFIG[item.result ?? (item.status ?? '').toLowerCase()] ?? STATUS_CONFIG.error
  const StatusIcon = statusCfg.icon
  const inputText = item.input ?? '—'
  const timeStr = item.created_at ?? item.tanggal ?? ''


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="history-card"
      style={{ '--card-accent': color }}
    >
      <div className="history-card-header" onClick={() => setExpanded(v => !v)}>
        <div className="history-card-left">
          <span className="history-module-icon" style={{ background: `${color}22`, color }}>
            <Icon size={18} />
          </span>
          <div>
            <p className="history-module-label">{MODULE_LABELS[mod] ?? item.modul ?? item.module}</p>
            <p className="history-input-text">{inputText}</p>
          </div>
        </div>
        <div className="history-card-right">
          <span className="history-status-badge" style={{ background: `${statusCfg.color}22`, color: statusCfg.color }}>
            <StatusIcon size={13} />
            {statusCfg.label}
          </span>
          <span className="history-time">
            <Clock size={12} />
            {timeStr ? new Date(timeStr).toLocaleString('id-ID') : '—'}
          </span>
          <button
            className="history-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
          <span className="history-expand-icon">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && item.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="history-detail"
          >
            <pre>{JSON.stringify(item.detail, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SimulationHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 15

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: PER_PAGE }
      if (filterModule !== 'all') params.module = filterModule
      if (search.trim()) params.search = search.trim()
      const res = await getHistory(params)
      setItems(res.data.items ?? res.data)
      setTotal(res.data.total ?? (res.data.items ?? res.data).length)
    } catch {
      toast.error('Gagal memuat riwayat simulasi')
    } finally {
      setLoading(false)
    }
  }, [page, filterModule, search])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id)
      toast.success('Riwayat dihapus')
      fetchHistory()
    } catch {
      toast.error('Gagal menghapus riwayat')
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Hapus semua riwayat simulasi?')) return
    try {
      await clearHistory()
      toast.success('Semua riwayat dihapus')
      fetchHistory()
    } catch {
      toast.error('Gagal menghapus semua riwayat')
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="history-page">
      {/* ── Header ── */}
      <motion.div
        className="history-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="history-hero-icon"><History size={32} /></span>
        <div>
          <h1 className="history-hero-title">Riwayat Simulasi</h1>
          <p className="history-hero-sub">
            Semua simulasi yang pernah dijalankan tersimpan di sini
          </p>
        </div>
      </motion.div>

      {/* ── Toolbar ── */}
      <div className="history-toolbar">
        <div className="history-search-wrap">
          <Search size={16} className="history-search-icon" />
          <input
            className="history-search"
            placeholder="Cari input simulasi..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="history-filter-wrap">
          <Filter size={15} />
          <select
            className="history-filter"
            value={filterModule}
            onChange={e => { setFilterModule(e.target.value); setPage(1) }}
          >
            <option value="all">Semua Modul</option>
            {Object.entries(MODULE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <button className="history-refresh-btn" onClick={fetchHistory} title="Refresh">
          <RefreshCw size={15} />
        </button>

        <button className="history-clear-btn" onClick={handleClearAll}>
          <Trash2 size={15} /> Hapus Semua
        </button>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="history-loading">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={28} color="#6366f1" />
          </motion.div>
          <span>Memuat riwayat...</span>
        </div>
      ) : items.length === 0 ? (
        <motion.div className="history-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Inbox size={52} color="#334155" />
          <p>Belum ada riwayat simulasi</p>
          <span>Jalankan simulasi pada modul-modul di atas untuk melihat hasilnya di sini.</span>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="history-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Sebelumnya</button>
          <span>Halaman {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya →</button>
        </div>
      )}

      <style>{`
        .history-page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; }
        .history-hero { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 2rem; }
        .history-hero-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(99,102,241,.15); color: #6366f1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .history-hero-title { font-size: 1.8rem; font-weight: 700; color: #f1f5f9; margin: 0 0 .2rem; }
        .history-hero-sub { color: #94a3b8; margin: 0; font-size: .95rem; }

        .history-toolbar { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .history-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .history-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .history-search { width: 100%; padding: .6rem .75rem .6rem 2.4rem; background: rgba(15,23,42,.7); border: 1px solid rgba(99,102,241,.25); border-radius: 10px; color: #f1f5f9; font-size: .9rem; outline: none; transition: border .2s; box-sizing: border-box; }
        .history-search:focus { border-color: #6366f1; }
        .history-filter-wrap { display: flex; align-items: center; gap: .5rem; color: #64748b; }
        .history-filter { background: rgba(15,23,42,.7); border: 1px solid rgba(99,102,241,.25); border-radius: 10px; color: #f1f5f9; padding: .6rem .75rem; font-size: .9rem; outline: none; cursor: pointer; }
        .history-refresh-btn { padding: .6rem; background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.25); border-radius: 10px; color: #6366f1; cursor: pointer; display: flex; align-items: center; transition: background .2s; }
        .history-refresh-btn:hover { background: rgba(99,102,241,.2); }
        .history-clear-btn { display: flex; align-items: center; gap: .4rem; padding: .6rem 1rem; background: rgba(244,63,94,.1); border: 1px solid rgba(244,63,94,.3); border-radius: 10px; color: #f43f5e; cursor: pointer; font-size: .85rem; transition: background .2s; }
        .history-clear-btn:hover { background: rgba(244,63,94,.2); }

        .history-card { background: rgba(15,23,42,.8); border: 1px solid rgba(99,102,241,.15); border-left: 3px solid var(--card-accent); border-radius: 12px; margin-bottom: .75rem; overflow: hidden; cursor: pointer; transition: border-color .2s; }
        .history-card:hover { border-color: var(--card-accent); }
        .history-card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .9rem 1.1rem; flex-wrap: wrap; }
        .history-card-left { display: flex; align-items: center; gap: .8rem; }
        .history-module-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .history-module-label { font-size: .8rem; font-weight: 600; color: #94a3b8; margin: 0 0 .1rem; }
        .history-input-text { font-size: .95rem; color: #f1f5f9; margin: 0; font-family: monospace; }
        .history-card-right { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
        .history-status-badge { display: flex; align-items: center; gap: .3rem; padding: .25rem .6rem; border-radius: 20px; font-size: .78rem; font-weight: 600; }
        .history-time { display: flex; align-items: center; gap: .3rem; font-size: .78rem; color: #64748b; }
        .history-delete-btn { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; transition: color .2s; padding: .2rem; }
        .history-delete-btn:hover { color: #f43f5e; }
        .history-expand-icon { color: #64748b; }
        .history-detail { padding: 0 1.1rem 1rem; overflow: hidden; }
        .history-detail pre { background: rgba(0,0,0,.3); border-radius: 8px; padding: .75rem 1rem; font-size: .8rem; color: #94a3b8; overflow-x: auto; margin: 0; }

        .history-loading, .history-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem 1rem; color: #64748b; }
        .history-empty p { font-size: 1.1rem; font-weight: 600; color: #475569; margin: 0; }
        .history-empty span { font-size: .9rem; text-align: center; }

        .history-pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2rem; }
        .history-pagination button { padding: .5rem 1.2rem; background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.3); border-radius: 8px; color: #6366f1; cursor: pointer; font-size: .9rem; transition: background .2s; }
        .history-pagination button:disabled { opacity: .35; cursor: not-allowed; }
        .history-pagination button:not(:disabled):hover { background: rgba(99,102,241,.25); }
        .history-pagination span { color: #94a3b8; font-size: .9rem; }
      `}</style>
    </div>
  )
}

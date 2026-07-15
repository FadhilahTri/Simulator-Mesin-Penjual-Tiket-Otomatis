/**
 * RegularExpression.jsx — Regular Expression Validation & NFA Conversion Page.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FileText, Play, CheckCircle, XCircle,
  Download, RefreshCw, ArrowRight, AlertCircle
} from 'lucide-react'
import ReactFlow, { Background, Controls, MarkerType, Position } from 'reactflow'
import 'reactflow/dist/style.css'
import { validateRegex, validateTicket, regexToNFA, getRegexPatterns } from '../services/api'
import { exportToPDF } from '../utils/pdfExport'

const PREDEFINED_PATTERNS = [
  { key: 'kode_tiket', label: 'Kode Tiket', pattern: '^TKT-\\d{4}-\\d{6}$', example: 'TKT-2026-000123' },
  { key: 'kode_stasiun', label: 'Kode Stasiun', pattern: '^[A-Z]{2,4}$', example: 'BDG' },
  { key: 'tanggal', label: 'Tanggal', pattern: '^\\d{2}-\\d{2}-\\d{4}$', example: '14-07-2026' },
  { key: 'nomor_kursi', label: 'Nomor Kursi', pattern: '^[A-Z]\\d{1,2}$', example: 'A12' },
  { key: 'harga', label: 'Harga', pattern: '^\\d{1,3}(\\.\\d{3})*$', example: '150.000' },
]

const TABS = ['Validator Regex', 'Validasi Tiket', 'Regex → NFA']

export default function RegularExpression() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)

  // Tab 0: Single regex validate
  const [pattern, setPattern] = useState('^TKT-\\d{4}-\\d{6}$')
  const [testString, setTestString] = useState('TKT-2026-000123')
  const [regexResult, setRegexResult] = useState(null)

  // Tab 1: Ticket full validation
  const [ticketData, setTicketData] = useState({
    kode_tiket: 'TKT-2026-000123',
    kode_stasiun: 'BDG',
    tanggal: '14-07-2026',
    nomor_kursi: 'A12',
  })
  const [ticketResult, setTicketResult] = useState(null)

  // Tab 2: Regex to NFA
  const [nfaPattern, setNfaPattern] = useState('^TKT-\\d{4}-\\d{6}$')
  const [nfaResult, setNfaResult] = useState(null)
  const [grammarResult, setGrammarResult] = useState(null)

  // ---- Run single regex validation ----
  const runValidate = async () => {
    setLoading(true)
    try {
      const res = await validateRegex({ pattern, test_string: testString })
      setRegexResult(res.data)
      toast.success(res.data.matched ? '✓ String Matched!' : '✗ String tidak cocok!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validasi gagal')
    } finally {
      setLoading(false)
    }
  }

  // ---- Run ticket validation ----
  const runTicketValidate = async () => {
    setLoading(true)
    try {
      const res = await validateTicket({ ticket_data: ticketData })
      setTicketResult(res.data)
      toast.success(res.data.all_valid ? '✓ Semua field valid!' : '⚠ Ada field tidak valid')
    } catch (err) {
      toast.error('Validasi tiket gagal')
    } finally {
      setLoading(false)
    }
  }

  // ---- Regex to NFA ----
  const runRegexToNFA = async () => {
    setLoading(true)
    try {
      const res = await regexToNFA({ pattern: nfaPattern })
      setNfaResult(res.data.nfa)
      setGrammarResult(res.data.grammar)
      toast.success('Konversi Regex→NFA berhasil!')
    } catch (err) {
      toast.error('Konversi gagal')
    } finally {
      setLoading(false)
    }
  }

  // Build React Flow for NFA
  const buildNFAFlow = (nfa) => {
    if (!nfa) return { nodes: [], edges: [] }
    const nodes = nfa.nodes.map((n, i) => ({
      id: n.id,
      position: { x: i * 140 + 60, y: 80 },
      data: { label: n.id },
      style: {
        background: n.type === 'accept' ? 'rgba(16,185,129,0.25)' :
          n.type === 'start' ? 'rgba(99,102,241,0.25)' : 'rgba(13,21,38,0.8)',
        border: n.type === 'accept' ? '2px solid #10b981' : '2px solid rgba(99,102,241,0.5)',
        borderRadius: '50%',
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f1f5f9',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700, fontSize: 12,
      },
    }))

    const edges = nfa.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99,102,241,0.8)' },
      style: { stroke: 'rgba(99,102,241,0.6)' },
      labelStyle: { fill: '#94a3b8', fontSize: 11, fontFamily: 'var(--font-mono)' },
      labelBgStyle: { fill: 'rgba(6,11,24,0.8)' },
    }))

    return { nodes, edges }
  }

  const { nodes: nfaNodes, edges: nfaEdges } = buildNFAFlow(nfaResult)

  return (
    <div className="page-content">
      <div className="page-header" style={{ padding: '24px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Regular Expression</h1>
        </div>
        <p className="subtitle">Validasi format tiket dengan regex, konversi Regex→NFA, dan ekstrak grammar reguler</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        padding: '4px',
        background: 'rgba(6,182,212,0.08)',
        borderRadius: 12, width: 'fit-content',
        border: '1px solid rgba(6,182,212,0.15)',
      }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            id={`tab-regex-${idx}`}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: activeTab === idx ? 'rgba(6,182,212,0.25)' : 'transparent',
              color: activeTab === idx ? 'var(--color-cyan-light)' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- TAB 0: Single Regex Validator ---- */}
      {activeTab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick patterns */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Pola SmartTicket</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PREDEFINED_PATTERNS.map(p => (
                  <button
                    key={p.key}
                    id={`pattern-${p.key}`}
                    onClick={() => {
                      setPattern(p.pattern)
                      setTestString(p.example)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: pattern === p.pattern ? 'rgba(6,182,212,0.15)' : 'rgba(13,21,38,0.6)',
                      border: `1px solid ${pattern === p.pattern ? 'rgba(6,182,212,0.4)' : 'rgba(99,102,241,0.15)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
                        {p.label}
                      </div>
                      <div style={{
                        fontSize: 11, fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)', marginTop: 2,
                      }}>
                        {p.pattern}
                      </div>
                    </div>
                    <code style={{
                      fontSize: 11, padding: '2px 8px',
                      borderRadius: 6,
                      background: 'rgba(6,182,212,0.1)',
                      color: 'var(--color-cyan)',
                      border: '1px solid rgba(6,182,212,0.2)',
                    }}>
                      {p.example}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom regex input */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Pattern Regex</div>
              <input
                id="regex-pattern-input"
                className="input-field"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="^TKT-\d{4}-\d{6}$"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />

              <div className="section-label" style={{ marginBottom: 8, marginTop: 12 }}>String Uji</div>
              <input
                id="regex-test-input"
                className="input-field"
                value={testString}
                onChange={e => setTestString(e.target.value)}
                placeholder="TKT-2026-000123"
              />

              <button
                id="btn-validate-regex"
                className="btn-primary"
                onClick={runValidate}
                disabled={loading}
                style={{ marginTop: 12 }}
              >
                <Play size={14} />
                {loading ? 'Validating...' : 'Validasi'}
              </button>
            </div>
          </div>

          {/* Right: Result */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {regexResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card-static" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Hasil Validasi</div>
                    <span className={regexResult.matched ? 'badge-accepted' : 'badge-rejected'}>
                      {regexResult.matched ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {regexResult.matched ? 'ACCEPTED' : 'REJECTED'}
                    </span>
                  </div>

                  {/* Visual match display */}
                  <div style={{
                    padding: '16px',
                    borderRadius: 10,
                    background: regexResult.matched ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                    border: `1px solid ${regexResult.matched ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      {regexResult.matched ? '✅' : '❌'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                      color: regexResult.matched ? '#34d399' : '#fb7185',
                    }}>
                      "{testString}"
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
                      {regexResult.matched
                        ? `Cocok dengan pola ${pattern}`
                        : `TIDAK cocok dengan pola ${pattern}`}
                    </div>
                  </div>

                  {/* Pattern breakdown */}
                  <div style={{ padding: 16, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <div className="section-label" style={{ marginBottom: 8 }}>Pattern</div>
                    <div className="code-block" style={{ fontSize: 14 }}>{pattern}</div>
                  </div>

                  <button
                    id="btn-export-regex-pdf"
                    className="btn-secondary"
                    onClick={() => exportToPDF({ matched: regexResult.matched, input_string: testString }, 'Regex')}
                    style={{ marginTop: 16, fontSize: 12 }}
                  >
                    <Download size={12} /> Export PDF
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card-static" style={{
                padding: 40,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)', minHeight: 300,
              }}>
                <FileText size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <div style={{ fontSize: 14 }}>Pilih pola dan masukkan string untuk memulai validasi</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- TAB 1: Ticket Validation ---- */}
      {activeTab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="glass-card-static" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Data Tiket</div>
            {Object.entries(ticketData).map(([field, value]) => {
              const pat = PREDEFINED_PATTERNS.find(p => p.key === field)
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="section-label">{pat?.label || field}</div>
                    <code style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {pat?.pattern}
                    </code>
                  </div>
                  <input
                    id={`ticket-field-${field}`}
                    className="input-field"
                    value={value}
                    onChange={e => setTicketData(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={pat?.example}
                  />
                </div>
              )
            })}

            <button id="btn-validate-ticket" className="btn-primary" onClick={runTicketValidate} disabled={loading}>
              <CheckCircle size={14} />
              {loading ? 'Memvalidasi...' : 'Validasi Semua Field'}
            </button>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ticketResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card-static" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Status Validasi</div>
                    <span className={ticketResult.all_valid ? 'badge-accepted' : 'badge-rejected'}>
                      {ticketResult.all_valid ? '✓ Semua Valid' : '✗ Ada Error'}
                    </span>
                  </div>
                </div>

                {Object.entries(ticketResult.results || {}).map(([field, res]) => {
                  const pat = PREDEFINED_PATTERNS.find(p => p.key === field)
                  return (
                    <div key={field} className="glass-card-static" style={{
                      padding: '14px 18px',
                      borderColor: res.matched ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{pat?.label || field}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {ticketData[field]}
                          </div>
                        </div>
                        <span className={res.matched ? 'badge-accepted' : 'badge-rejected'}>
                          {res.matched ? '✓ Valid' : '✗ Invalid'}
                        </span>
                      </div>
                      {res.error && (
                        <div style={{ fontSize: 11, color: '#fb7185', marginTop: 8 }}>
                          <AlertCircle size={10} style={{ display: 'inline', marginRight: 4 }} />
                          {res.error}
                        </div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            ) : (
              <div className="glass-card-static" style={{
                padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)', minHeight: 200,
              }}>
                Hasil validasi akan muncul di sini
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- TAB 2: Regex to NFA ---- */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Konversi Regex → NFA (Thompson's Construction)</div>
            <div className="section-label" style={{ marginBottom: 8 }}>Pattern Regex</div>
            <input
              id="nfa-convert-pattern"
              className="input-field"
              value={nfaPattern}
              onChange={e => setNfaPattern(e.target.value)}
              placeholder="^TKT-\d{4}-\d{6}$"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button
              id="btn-regex-to-nfa"
              className="btn-primary"
              onClick={runRegexToNFA}
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              <ArrowRight size={14} />
              {loading ? 'Mengkonversi...' : 'Konversi ke NFA'}
            </button>
          </div>

          {nfaResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* NFA Diagram */}
              <div className="glass-card-static" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>NFA Diagram</div>
                <div style={{ height: 280, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(6,11,24,0.6)' }}>
                  <ReactFlow
                    nodes={nfaNodes}
                    edges={nfaEdges}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    proOptions={{ hideAttribution: true }}
                  >
                    <Background color="rgba(99,102,241,0.04)" gap={32} />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </div>
              </div>

              {/* Regular Grammar */}
              {grammarResult && (
                <div className="glass-card-static" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12 }}>Grammar Reguler Ekuivalen</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div className="section-label" style={{ marginBottom: 6 }}>Non-Terminals</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {grammarResult.non_terminals?.map(nt => (
                          <span key={nt} style={{
                            padding: '3px 10px', borderRadius: 6,
                            background: 'rgba(99,102,241,0.15)',
                            color: 'var(--color-indigo-light)',
                            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                          }}>{nt}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="section-label" style={{ marginBottom: 6 }}>Start Symbol</div>
                      <span style={{
                        padding: '4px 12px', borderRadius: 8,
                        background: 'rgba(6,182,212,0.15)',
                        color: 'var(--color-cyan)',
                        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      }}>
                        {grammarResult.start_symbol}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div className="section-label" style={{ marginBottom: 8 }}>Produksi</div>
                    <div className="code-block">
                      {Object.entries(grammarResult.productions || {}).map(([nt, prods]) =>
                        `${nt} → ${prods.join(' | ')}`
                      ).join('\n')}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

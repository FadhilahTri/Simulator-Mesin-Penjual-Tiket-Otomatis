/**
 * FiniteAutomata.jsx — DFA & NFA Simulation Page.
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Play, SkipForward, RotateCcw, Download,
  ChevronRight, Cpu, Zap, Table2, List,
  RefreshCw, BookOpen, CheckCircle, XCircle
} from 'lucide-react'
import StateGraph from '../components/automata/StateGraph'
import StepTrace from '../components/automata/StepTrace'
import TransitionTable from '../components/automata/TransitionTable'
import { simulateDFA, simulateNFA, nfaToDFA, getDefaultDFA } from '../services/api'
import { SMARTTICKET_DFA_EXAMPLE, SMARTTICKET_NFA_EXAMPLE, STATE_DESCRIPTIONS } from '../utils/constants'
import { exportToPDF, exportToPNG } from '../utils/pdfExport'

const TABS = ['DFA Simulator', 'NFA Simulator', 'NFA → DFA Converter']

export default function FiniteAutomata() {
  const [activeTab, setActiveTab] = useState(0)
  const [mode, setMode] = useState('dfa') // 'dfa' | 'nfa'
  const [loading, setLoading] = useState(false)

  // DFA state
  const [dfaConfig, setDfaConfig] = useState(SMARTTICKET_DFA_EXAMPLE)
  const [dfaInput, setDfaInput] = useState('pilih_tujuan pilih_kelas pilih_jumlah hitung bayar valid cetak kembalian selesai')
  const [dfaResult, setDfaResult] = useState(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const animRef = useRef(null)

  // NFA state
  const [nfaConfig, setNfaConfig] = useState(SMARTTICKET_NFA_EXAMPLE)
  const [nfaInput, setNfaInput] = useState('a b b')
  const [nfaResult, setNfaResult] = useState(null)

  // NFA→DFA state
  const [nfa2dfaResult, setNfa2dfaResult] = useState(null)

  // Active state for diagram highlight
  const activeState = dfaResult?.trace?.[currentStep]?.current_state || null

  // ---- DFA Simulate ----
  const runDFA = async () => {
    setLoading(true)
    setDfaResult(null)
    setCurrentStep(-1)
    try {
      const res = await simulateDFA({
        ...dfaConfig,
        input_string: dfaInput,
      })
      setDfaResult(res.data)
      toast.success(res.data.accepted ? '✓ String Accepted!' : '✗ String Rejected!')
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ---- Step-by-step Animation ----
  const startAnimation = () => {
    if (!dfaResult?.trace) return
    setCurrentStep(0)
    setIsAnimating(true)
    let step = 0
    animRef.current = setInterval(() => {
      step++
      if (step >= dfaResult.trace.length) {
        clearInterval(animRef.current)
        setIsAnimating(false)
        setCurrentStep(dfaResult.trace.length - 1)
      } else {
        setCurrentStep(step)
      }
    }, 800)
  }

  const stopAnimation = () => {
    clearInterval(animRef.current)
    setIsAnimating(false)
  }

  const resetSimulation = () => {
    stopAnimation()
    setCurrentStep(-1)
    setDfaResult(null)
  }

  // ---- NFA Simulate ----
  const runNFA = async () => {
    setLoading(true)
    try {
      const res = await simulateNFA({
        ...nfaConfig,
        input_string: nfaInput,
      })
      setNfaResult(res.data)
      toast.success(res.data.accepted ? '✓ String Accepted!' : '✗ String Rejected!')
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ---- NFA→DFA Convert ----
  const runNFA2DFA = async () => {
    setLoading(true)
    try {
      const res = await nfaToDFA(nfaConfig)
      setNfa2dfaResult(res.data)
      toast.success('Konversi NFA→DFA berhasil!')
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ---- Load Default DFA ----
  const loadDefault = async () => {
    try {
      const res = await getDefaultDFA()
      setDfaConfig(res.data)
      setDfaInput('pilih_tujuan pilih_kelas pilih_jumlah hitung bayar valid cetak kembalian selesai')
      toast.success('SmartTicket DFA dimuat!')
    } catch {
      toast.error('Gagal memuat DFA default')
    }
  }

  const resultStatus = dfaResult
    ? (dfaResult.accepted ? 'accepted' : 'rejected')
    : null

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ padding: '24px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Finite State Automata</h1>
        </div>
        <p className="subtitle">Simulasi DFA dan NFA langkah demi langkah dengan visualisasi state interaktif</p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        padding: '4px',
        background: 'rgba(99,102,241,0.08)',
        borderRadius: 12,
        border: '1px solid rgba(99,102,241,0.15)',
        width: 'fit-content',
      }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            id={`tab-fsa-${idx}`}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 20px',
              borderRadius: 9,
              border: 'none',
              background: activeTab === idx ? 'rgba(99,102,241,0.3)' : 'transparent',
              color: activeTab === idx ? 'var(--color-indigo-light)' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ======================== TAB 0: DFA ======================== */}
      {activeTab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Input Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* DFA Config */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Konfigurasi DFA</div>
                <button className="btn-secondary" onClick={loadDefault} style={{ fontSize: 12, padding: '6px 12px' }}>
                  <RefreshCw size={12} /> Load SmartTicket
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div className="section-label">States (koma-pisah)</div>
                  <input
                    id="dfa-states-input"
                    className="input-field"
                    value={dfaConfig.states.join(', ')}
                    onChange={e => setDfaConfig(prev => ({
                      ...prev, states: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>
                <div>
                  <div className="section-label">Start State</div>
                  <input
                    id="dfa-start-input"
                    className="input-field"
                    value={dfaConfig.start_state}
                    onChange={e => setDfaConfig(prev => ({ ...prev, start_state: e.target.value.trim() }))}
                  />
                </div>
                <div>
                  <div className="section-label">Final States (koma-pisah)</div>
                  <input
                    id="dfa-finals-input"
                    className="input-field"
                    value={dfaConfig.final_states.join(', ')}
                    onChange={e => setDfaConfig(prev => ({
                      ...prev, final_states: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Input String */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Input String (spasi-pisah)</div>
              <textarea
                id="dfa-input-string"
                className="textarea-field"
                rows={3}
                value={dfaInput}
                onChange={e => setDfaInput(e.target.value)}
                placeholder="contoh: pilih_tujuan pilih_kelas pilih_jumlah hitung bayar valid cetak kembalian selesai"
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  id="btn-run-dfa"
                  className="btn-primary"
                  onClick={runDFA}
                  disabled={loading}
                >
                  {loading ? <span className="loading-dots"><span/><span/><span/></span> : <Play size={14} />}
                  {loading ? 'Memproses...' : 'Jalankan DFA'}
                </button>

                {dfaResult && !isAnimating && (
                  <button id="btn-animate-dfa" className="btn-secondary" onClick={startAnimation}>
                    <SkipForward size={14} /> Animasi Step
                  </button>
                )}
                {isAnimating && (
                  <button id="btn-stop-anim" className="btn-danger" onClick={stopAnimation}>
                    Berhenti
                  </button>
                )}
                <button id="btn-reset-dfa" className="btn-secondary" onClick={resetSimulation}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            {/* Result Badge */}
            {dfaResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-static"
                style={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>Hasil Simulasi</div>
                  <span className={dfaResult.accepted ? 'badge-accepted' : 'badge-rejected'}>
                    {dfaResult.accepted ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {dfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Final State: <code style={{ color: 'var(--color-indigo-light)' }}>{dfaResult.final_state}</code>
                </div>
                {dfaResult.final_state && STATE_DESCRIPTIONS[dfaResult.final_state] && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {STATE_DESCRIPTIONS[dfaResult.final_state]}
                  </div>
                )}
                {dfaResult.error && (
                  <div style={{ fontSize: 12, color: '#fb7185', marginTop: 8 }}>
                    Error: {dfaResult.error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    id="btn-export-dfa-pdf"
                    className="btn-secondary"
                    onClick={() => exportToPDF({ ...dfaResult, input_string: dfaInput }, 'DFA')}
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    <Download size={12} /> Export PDF
                  </button>
                  <button
                    id="btn-export-dfa-png"
                    className="btn-secondary"
                    onClick={() => exportToPNG('state-graph-dfa')}
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    <Download size={12} /> Export PNG
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step Trace */}
            {dfaResult?.trace && (
              <div className="glass-card-static" style={{ padding: 20, maxHeight: 320, overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                  <List size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Trace Perpindahan State
                </div>
                <StepTrace trace={dfaResult.trace} currentStep={currentStep} />
              </div>
            )}
          </div>

          {/* Right: Graph + Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* State Diagram */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                Diagram State Interaktif
              </div>
              <StateGraph
                id="state-graph-dfa"
                states={dfaConfig.states}
                alphabet={dfaConfig.alphabet}
                transitions={dfaConfig.transitions}
                start_state={dfaConfig.start_state}
                final_states={dfaConfig.final_states}
                activeState={activeState}
                result={resultStatus}
                height={400}
              />
            </div>

            {/* Transition Table */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                <Table2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                Tabel Transisi
              </div>
              <TransitionTable
                states={dfaConfig.states}
                alphabet={dfaConfig.alphabet}
                transitions={dfaConfig.transitions}
                final_states={dfaConfig.final_states}
                start_state={dfaConfig.start_state}
                activeState={activeState}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================== TAB 1: NFA ======================== */}
      {activeTab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card-static" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>NFA Configuration</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                NFA Example: q0 --a--&gt; {'{q0,q1}'}, q1 --b--&gt; q2, q2 --b--&gt; q3 (final)
              </div>

              <div className="section-label" style={{ marginBottom: 8 }}>Input String</div>
              <input
                id="nfa-input-string"
                className="input-field"
                value={nfaInput}
                onChange={e => setNfaInput(e.target.value)}
                placeholder="a b b"
              />

              <button
                id="btn-run-nfa"
                className="btn-primary"
                onClick={runNFA}
                disabled={loading}
                style={{ marginTop: 12 }}
              >
                <Play size={14} />
                {loading ? 'Memproses...' : 'Jalankan NFA'}
              </button>
            </div>

            {nfaResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-static"
                style={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>Hasil NFA</div>
                  <span className={nfaResult.accepted ? 'badge-accepted' : 'badge-rejected'}>
                    {nfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Final states reached: {'{' + (nfaResult.final_states_reached || []).join(', ') + '}'}
                </div>
              </motion.div>
            )}

            {nfaResult?.trace && (
              <div className="glass-card-static" style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>NFA Trace (ε-closure)</div>
                <StepTrace trace={nfaResult.trace} isNFA currentStep={-1} />
              </div>
            )}
          </div>

          <div className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>NFA State Diagram</div>
            <StateGraph
              id="state-graph-nfa"
              states={nfaConfig.states}
              alphabet={nfaConfig.alphabet}
              transitions={nfaConfig.transitions}
              start_state={nfaConfig.start_state}
              final_states={nfaConfig.final_states}
              isNFA
              height={400}
            />
            <div style={{ marginTop: 16 }}>
              <TransitionTable
                states={nfaConfig.states}
                alphabet={nfaConfig.alphabet.filter(a => a !== 'ε')}
                transitions={nfaConfig.transitions}
                final_states={nfaConfig.final_states}
                start_state={nfaConfig.start_state}
                isNFA
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================== TAB 2: NFA→DFA ======================== */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Konversi NFA → DFA (Subset Construction)</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Menggunakan NFA example di Tab 1. Klik tombol untuk memulai konversi.
            </div>
            <button id="btn-nfa-to-dfa" className="btn-primary" onClick={runNFA2DFA} disabled={loading}>
              <Zap size={14} />
              {loading ? 'Mengkonversi...' : 'Konversi NFA → DFA'}
            </button>
          </div>

          {nfa2dfaResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* DFA Result info */}
              <div className="glass-card-static" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Hasil DFA</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'DFA States', value: nfa2dfaResult.dfa_states?.join(', ') },
                    { label: 'Start State', value: nfa2dfaResult.dfa_start },
                    { label: 'Final States', value: nfa2dfaResult.dfa_finals?.join(', ') },
                    { label: 'Total States', value: nfa2dfaResult.dfa_states?.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      <div className="section-label">{label}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 13,
                        color: 'var(--color-indigo-light)', marginTop: 4,
                        wordBreak: 'break-word',
                      }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subset Construction Steps */}
              <div className="glass-card-static" style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Langkah Subset Construction</div>
                {nfa2dfaResult.steps?.map((step, idx) => (
                  <div key={idx} className="step-trace-item" style={{ marginBottom: 6 }}>
                    <div className="step-number">{idx + 1}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      <span style={{ color: 'var(--color-indigo-light)' }}>{step.from}</span>
                      {' '}--<span style={{ color: 'var(--color-cyan)' }}>{step.symbol}</span>→{' '}
                      <span style={{ color: '#34d399' }}>{step.to}</span>
                      {step.closure_result?.length > 0 && (
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {' '}(ε-closure: {'{' + step.closure_result.join(',') + '}'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resulting DFA Diagram */}
              <div className="glass-card-static" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>DFA Hasil Konversi</div>
                <StateGraph
                  id="state-graph-converted-dfa"
                  states={nfa2dfaResult.dfa_states || []}
                  alphabet={nfaConfig.alphabet.filter(a => a !== 'ε')}
                  transitions={nfa2dfaResult.dfa_transitions || {}}
                  start_state={nfa2dfaResult.dfa_start}
                  final_states={nfa2dfaResult.dfa_finals || []}
                  height={380}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

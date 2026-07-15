/**
 * CnfConverter.jsx — CNF Converter & Chomsky Hierarchy Page.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Layers, Play, Download, ChevronDown, ChevronRight, Cpu } from 'lucide-react'
import HierarchyDiagram from '../components/cnf/HierarchyDiagram'
import { convertCNF, classifyGrammar } from '../services/api'
import { SMARTTICKET_CNF_EXAMPLE } from '../utils/constants'
import { exportToPDF } from '../utils/pdfExport'

const STEP_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
const STEP_LABELS = [
  'Original Grammar',
  'Step 1: Hapus ε-Productions',
  'Step 2: Hapus Unit Productions',
  'Step 3: Hapus Useless Symbols',
  'Step 4: CNF Final',
]

const TABS = ['CNF Converter', 'Chomsky Hierarchy']

export default function CnfConverter() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [grammarText, setGrammarText] = useState(SMARTTICKET_CNF_EXAMPLE)
  const [cnfResult, setCnfResult] = useState(null)
  const [openSteps, setOpenSteps] = useState([])
  const [classification, setClassification] = useState(null)

  const runCNF = async () => {
    setLoading(true)
    setCnfResult(null)
    setOpenSteps([])
    try {
      const res = await convertCNF({ grammar_text: grammarText })
      setCnfResult(res.data)
      toast.success('Konversi CNF berhasil!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Konversi CNF gagal')
    } finally {
      setLoading(false)
    }
  }

  const runClassify = async () => {
    setLoading(true)
    try {
      const res = await classifyGrammar({ grammar_text: grammarText })
      setClassification(res.data)
      toast.success(`Grammar diklasifikasikan sebagai Type ${res.data.type_num}!`)
    } catch (err) {
      toast.error('Klasifikasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const toggleStep = (idx) => {
    setOpenSteps(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  // Group steps by phase
  const groupedSteps = cnfResult?.steps?.reduce((acc, step) => {
    const phase = step.phase || 'Other'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(step)
    return acc
  }, {}) || {}

  return (
    <div className="page-content">
      <div className="page-header" style={{ padding: '24px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24 }}>CNF Converter</h1>
        </div>
        <p className="subtitle">Transformasi 4 langkah ke Chomsky Normal Form dan klasifikasi Hierarki Chomsky</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        padding: '4px',
        background: 'rgba(245,158,11,0.08)',
        borderRadius: 12, width: 'fit-content',
        border: '1px solid rgba(245,158,11,0.15)',
      }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            id={`tab-cnf-${idx}`}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: activeTab === idx ? 'rgba(245,158,11,0.25)' : 'transparent',
              color: activeTab === idx ? '#fbbf24' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grammar Input — Shared */}
      <div className="glass-card-static" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Context-Free Grammar Input</div>
          <button
            className="btn-secondary"
            onClick={() => {
              setGrammarText(SMARTTICKET_CNF_EXAMPLE)
              toast.success('Contoh grammar dimuat!')
            }}
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            Load Contoh
          </button>
        </div>
        <textarea
          id="cnf-grammar-input"
          className="textarea-field"
          rows={6}
          value={grammarText}
          onChange={e => setGrammarText(e.target.value)}
          placeholder={`S → A B | C D\nA → a | ε\nB → b C`}
        />
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
          Format: <code style={{ color: 'var(--color-indigo-light)' }}>A → B C | d | ε</code>
          {' '}— Gunakan ε untuk epsilon, | untuk alternatif
        </div>
      </div>

      {/* ======================== TAB 0: CNF ======================== */}
      {activeTab === 0 && (
        <div>
          <button id="btn-convert-cnf" className="btn-primary" onClick={runCNF} disabled={loading} style={{ marginBottom: 24 }}>
            <Play size={14} />
            {loading ? 'Mengkonversi...' : 'Konversi ke CNF'}
          </button>

          {cnfResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Before / After Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16, marginBottom: 24,
              }}>
                {[
                  { label: 'Original', value: cnfResult.original, color: '#6366f1', step: 'Before' },
                  { label: 'Setelah ε-Removal', value: cnfResult.after_epsilon, color: '#06b6d4', step: 'Step 1' },
                  { label: 'Setelah Unit Removal', value: cnfResult.after_unit, color: '#10b981', step: 'Step 2' },
                  { label: 'Setelah Useless Removal', value: cnfResult.after_useless, color: '#f59e0b', step: 'Step 3' },
                  { label: 'CNF Final', value: cnfResult.final_cnf, color: '#f43f5e', step: 'Step 4 ✓' },
                ].map(({ label, value, color, step }, idx) => (
                  <div key={label} style={{
                    padding: 16, borderRadius: 12,
                    background: `${color}08`,
                    border: `1px solid ${color}30`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        background: `${color}20`, color,
                        border: `1px solid ${color}40`, fontWeight: 700,
                      }}>{step}</span>
                    </div>
                    <div className="code-block" style={{ fontSize: 11, minHeight: 60, color }}>
                      {value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step Details — Accordion */}
              <div className="glass-card-static" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Detail Setiap Langkah Transformasi</div>

                {Object.entries(groupedSteps).map(([phase, steps], phaseIdx) => {
                  const isOpen = openSteps.includes(phaseIdx)
                  const color = STEP_COLORS[phaseIdx % STEP_COLORS.length]
                  return (
                    <div key={phase} style={{ marginBottom: 8 }}>
                      <button
                        id={`cnf-step-${phaseIdx}`}
                        onClick={() => toggleStep(phaseIdx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 10,
                          background: isOpen ? `${color}12` : 'rgba(13,21,38,0.6)',
                          border: `1px solid ${isOpen ? color + '40' : 'rgba(99,102,241,0.1)'}`,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: `${color}20`, border: `1px solid ${color}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color,
                          }}>
                            {phaseIdx + 1}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: isOpen ? color : 'var(--color-text-primary)' }}>
                            {phase}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            ({steps.length} sub-step)
                          </span>
                        </div>
                        {isOpen ? <ChevronDown size={16} color={color} /> : <ChevronRight size={16} color="var(--color-text-muted)" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {steps.map((step, si) => (
                                <div key={si} style={{
                                  padding: '10px 14px', borderRadius: 8,
                                  background: 'rgba(0,0,0,0.2)',
                                  border: '1px solid rgba(99,102,241,0.08)',
                                }}>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                                    {step.description}
                                  </div>
                                  {step.detail && (
                                    <div style={{
                                      fontSize: 12, color: 'var(--color-text-muted)',
                                      fontFamily: typeof step.detail === 'string' ? 'var(--font-mono)' : 'var(--font-sans)',
                                    }}>
                                      {typeof step.detail === 'string'
                                        ? step.detail
                                        : JSON.stringify(step.detail, null, 2)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* Export */}
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button
                  id="btn-export-cnf-pdf"
                  className="btn-secondary"
                  onClick={() => exportToPDF({ steps: cnfResult.steps?.map(s => `${s.phase}: ${s.description}`) }, 'CNF')}
                  style={{ fontSize: 12 }}
                >
                  <Download size={12} /> Export PDF
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ======================== TAB 1: CHOMSKY HIERARCHY ======================== */}
      {activeTab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="glass-card-static" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Klasifikasi Grammar</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
              Masukkan grammar di atas, lalu klik tombol untuk mengklasifikasikan menurut Hierarki Chomsky (Type 0–3).
            </p>

            <button id="btn-classify" className="btn-primary" onClick={runClassify} disabled={loading} style={{ marginBottom: 20 }}>
              <Cpu size={14} />
              {loading ? 'Mengklasifikasi...' : 'Klasifikasikan Grammar'}
            </button>

            {classification && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{
                  padding: 20, borderRadius: 12,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      fontSize: 36, fontWeight: 900,
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      Type {classification.type_num}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{classification.type_name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {classification.description}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {classification.properties?.map((prop, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <span style={{ color: '#34d399' }}>✓</span>
                        {prop}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card-static" style={{ padding: 24 }}>
            <HierarchyDiagram highlighted={classification?.type_num} />
          </div>
        </div>
      )}
    </div>
  )
}

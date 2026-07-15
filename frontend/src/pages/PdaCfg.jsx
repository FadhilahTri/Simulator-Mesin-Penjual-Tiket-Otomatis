/**
 * PdaCfg.jsx — PDA & Context-Free Grammar Simulation Page.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { GitBranch, Play, Download, RefreshCw, ChevronRight } from 'lucide-react'
import StackVisualization from '../components/cfg/StackVisualization'
import ParseTree from '../components/cfg/ParseTree'
import { simulateCFG, deriveCFG, parseTree as parseTreeAPI, getDefaultCFG } from '../services/api'
import { SMARTTICKET_CFG_TEXT } from '../utils/constants'
import { exportToPDF } from '../utils/pdfExport'

const TABS = ['PDA Simulator', 'Derivasi', 'Parse Tree']

export default function PdaCfg() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [grammarText, setGrammarText] = useState(SMARTTICKET_CFG_TEXT)
  const [inputString, setInputString] = useState('pilih_tujuan BDG pilih_kelas ekonomi pilih_jumlah 2 bayar tunai valid')
  const [pdaResult, setPdaResult] = useState(null)
  const [currentStackStep, setCurrentStackStep] = useState(0)
  const [derivResult, setDerivResult] = useState(null)
  const [derivType, setDerivType] = useState('leftmost')
  const [treeResult, setTreeResult] = useState(null)

  const runPDA = async () => {
    setLoading(true)
    setPdaResult(null)
    setCurrentStackStep(0)
    try {
      const res = await simulateCFG({ grammar_text: grammarText, input_string: inputString })
      setPdaResult(res.data)
      toast.success(res.data.accepted ? '✓ String Accepted!' : '✗ String Rejected!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'PDA simulation failed')
    } finally {
      setLoading(false)
    }
  }

  const runDerivation = async () => {
    setLoading(true)
    setDerivResult(null)
    try {
      const res = await deriveCFG({ grammar_text: grammarText, input_string: inputString, type: derivType })
      setDerivResult(res.data)
      toast.success(res.data.found ? 'Derivasi ditemukan!' : 'Derivasi tidak ditemukan')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Derivasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const runParseTree = async () => {
    setLoading(true)
    setTreeResult(null)
    try {
      const res = await parseTreeAPI({ grammar_text: grammarText, input_string: inputString })
      setTreeResult(res.data)
      toast.success(res.data.accepted ? 'Parse tree berhasil dibuat!' : 'Parsing gagal')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Parse tree gagal')
    } finally {
      setLoading(false)
    }
  }

  const loadDefault = async () => {
    setGrammarText(SMARTTICKET_CFG_TEXT)
    setInputString('pilih_tujuan BDG pilih_kelas ekonomi pilih_jumlah 2 bayar tunai valid')
    toast.success('SmartTicket CFG dimuat!')
  }

  const currentStack = pdaResult?.stack_trace?.[currentStackStep]?.stack || []
  const currentAction = pdaResult?.stack_trace?.[currentStackStep]?.action || ''

  return (
    <div className="page-content">
      <div className="page-header" style={{ padding: '24px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24 }}>PDA & Context-Free Grammar</h1>
        </div>
        <p className="subtitle">Simulasi PDA dengan visualisasi stack, derivasi kiri/kanan, dan parse tree interaktif</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        padding: '4px',
        background: 'rgba(16,185,129,0.08)',
        borderRadius: 12, width: 'fit-content',
        border: '1px solid rgba(16,185,129,0.15)',
      }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            id={`tab-cfg-${idx}`}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: activeTab === idx ? 'rgba(16,185,129,0.25)' : 'transparent',
              color: activeTab === idx ? '#34d399' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grammar + Input — Shared panel */}
      <div className="glass-card-static" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Grammar & Input</div>
          <button className="btn-secondary" onClick={loadDefault} style={{ fontSize: 12, padding: '6px 12px' }}>
            <RefreshCw size={12} /> SmartTicket CFG
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Context-Free Grammar</div>
            <textarea
              id="cfg-grammar-input"
              className="textarea-field"
              rows={10}
              value={grammarText}
              onChange={e => setGrammarText(e.target.value)}
              placeholder={`S → A B | C\nA → a`}
            />
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Input String (spasi-pisah)</div>
            <textarea
              id="cfg-input-string"
              className="textarea-field"
              rows={4}
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              placeholder="pilih_tujuan BDG pilih_kelas ekonomi..."
            />

            <div style={{ marginTop: 12 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Quick Info</div>
              <div style={{
                padding: 12, borderRadius: 10,
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.1)',
                fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6,
              }}>
                Format grammar: <code style={{ color: 'var(--color-indigo-light)' }}>A → B C | d</code><br />
                Gunakan <code style={{ color: 'var(--color-cyan)' }}>ε</code> untuk produksi epsilon.<br />
                Non-terminal: huruf kapital. Terminal: huruf kecil.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================== TAB 0: PDA ======================== */}
      {activeTab === 0 && (
        <div>
          <button id="btn-run-pda" className="btn-primary" onClick={runPDA} disabled={loading} style={{ marginBottom: 20 }}>
            <Play size={14} />
            {loading ? 'Menjalankan PDA...' : 'Jalankan PDA'}
          </button>

          {pdaResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Result badge */}
              <div className="glass-card-static" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>
                    Hasil PDA — {pdaResult.stack_trace?.length || 0} langkah
                  </div>
                  <span className={pdaResult.accepted ? 'badge-accepted' : 'badge-rejected'}>
                    {pdaResult.accepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
                {/* Stack Visualization */}
                <div className="glass-card-static" style={{ padding: 20 }}>
                  <StackVisualization
                    stack={currentStack}
                    label="Stack State"
                  />
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    {currentAction}
                  </div>
                </div>

                {/* Stack trace steps */}
                <div className="glass-card-static" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12 }}>Stack Trace</div>
                  <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pdaResult.stack_trace?.map((step, idx) => (
                      <div
                        key={idx}
                        className="step-trace-item"
                        onClick={() => setCurrentStackStep(idx)}
                        style={{
                          cursor: 'pointer',
                          background: currentStackStep === idx ? 'rgba(16,185,129,0.1)' : undefined,
                          borderColor: currentStackStep === idx ? 'rgba(16,185,129,0.3)' : undefined,
                        }}
                      >
                        <div className="step-number">{step.step}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                            {step.action}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            Stack: [{step.stack?.join(', ')}]
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            Input: [{step.input_remaining?.join(' ')}]
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    id="btn-export-pda-pdf"
                    className="btn-secondary"
                    onClick={() => exportToPDF({ ...pdaResult, input_string: inputString }, 'PDA')}
                    style={{ marginTop: 12, fontSize: 12, padding: '6px 12px' }}
                  >
                    <Download size={12} /> Export PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ======================== TAB 1: DERIVATION ======================== */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, padding: 4, background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
              {['leftmost', 'rightmost'].map(type => (
                <button
                  key={type}
                  id={`deriv-type-${type}`}
                  onClick={() => setDerivType(type)}
                  style={{
                    padding: '6px 14px', borderRadius: 7, border: 'none',
                    background: derivType === type ? 'rgba(99,102,241,0.3)' : 'transparent',
                    color: derivType === type ? 'var(--color-indigo-light)' : 'var(--color-text-muted)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  {type === 'leftmost' ? '⬅ Leftmost' : 'Rightmost ➡'}
                </button>
              ))}
            </div>

            <button id="btn-derive" className="btn-primary" onClick={runDerivation} disabled={loading}>
              <Play size={14} />
              {loading ? 'Menurunkan...' : `Jalankan ${derivType === 'leftmost' ? 'Leftmost' : 'Rightmost'} Derivasi`}
            </button>
          </div>

          {derivResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-card-static" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>
                    {derivType === 'leftmost' ? 'Leftmost' : 'Rightmost'} Derivation
                  </div>
                  <span className={derivResult.found ? 'badge-accepted' : 'badge-rejected'}>
                    {derivResult.found ? 'Found' : 'Not Found'}
                  </span>
                </div>

                {derivResult.error && (
                  <div style={{ color: '#fb7185', fontSize: 13, marginBottom: 12 }}>{derivResult.error}</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {derivResult.steps?.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: idx === 0 ? 'rgba(99,102,241,0.1)' :
                          idx === derivResult.steps.length - 1 ? 'rgba(16,185,129,0.1)' :
                            'rgba(13,21,38,0.6)',
                        border: '1px solid rgba(99,102,241,0.1)',
                      }}
                    >
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
                        minWidth: 20, textAlign: 'right',
                      }}>
                        {idx === 0 ? 'S' : `⇒${idx}`}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-primary)', flex: 1 }}>
                        {step}
                      </div>
                      {idx === derivResult.steps.length - 1 && derivResult.found && (
                        <span style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}>✓ Final</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <button
                  id="btn-export-deriv-pdf"
                  className="btn-secondary"
                  onClick={() => exportToPDF(derivResult, `CFG-${derivType}`)}
                  style={{ marginTop: 16, fontSize: 12, padding: '6px 12px' }}
                >
                  <Download size={12} /> Export PDF
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ======================== TAB 2: PARSE TREE ======================== */}
      {activeTab === 2 && (
        <div>
          <button id="btn-parse-tree" className="btn-primary" onClick={runParseTree} disabled={loading} style={{ marginBottom: 20 }}>
            <Play size={14} />
            {loading ? 'Membangun Parse Tree...' : 'Build Parse Tree'}
          </button>

          {treeResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-card-static" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>Parse Tree</div>
                  <span className={treeResult.accepted ? 'badge-accepted' : 'badge-rejected'}>
                    {treeResult.accepted ? '✓ Parsed' : '✗ Parse Error'}
                  </span>
                </div>
                {treeResult.error && (
                  <div style={{ color: '#fb7185', fontSize: 13, marginBottom: 12 }}>{treeResult.error}</div>
                )}
                <ParseTree tree={treeResult.tree} height={460} />
              </div>
            </motion.div>
          )}

          {!treeResult && (
            <div className="glass-card-static" style={{
              padding: 60,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: 'var(--color-text-muted)',
            }}>
              <GitBranch size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <div>Klik "Build Parse Tree" untuk memvisualisasikan parse tree</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

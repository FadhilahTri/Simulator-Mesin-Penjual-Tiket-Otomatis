/**
 * HierarchyDiagram.jsx — Chomsky Hierarchy visualization (Type 0–3).
 */
import { motion } from 'framer-motion'
import { Cpu, GitBranch, Layers, Zap } from 'lucide-react'

const LEVELS = [
  {
    type: 0,
    name: 'Type 0 — Unrestricted',
    subtitle: 'Dikenali oleh Mesin Turing',
    desc: 'Tidak ada batasan. Paling ekspresif.',
    icon: Zap,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.3)',
  },
  {
    type: 1,
    name: 'Type 1 — Context-Sensitive',
    subtitle: 'Dikenali oleh Linear Bounded Automata',
    desc: 'αAβ → αγβ, |γ| ≥ 1',
    icon: Layers,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    type: 2,
    name: 'Type 2 — Context-Free',
    subtitle: 'Dikenali oleh Pushdown Automata',
    desc: 'A → α (LHS single non-terminal)',
    icon: GitBranch,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.3)',
  },
  {
    type: 3,
    name: 'Type 3 — Regular',
    subtitle: 'Dikenali oleh Finite Automata',
    desc: 'A → a | A → aB (right-linear)',
    icon: Cpu,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
  },
]

export default function HierarchyDiagram({ highlighted = null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--color-text-secondary)',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        Hierarki Chomsky — Semakin dalam, semakin restriktif
      </div>

      {/* Nested rings visual */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        {LEVELS.map((level, i) => {
          const isHighlighted = highlighted === level.type
          const Icon = level.icon
          return (
            <motion.div
              key={level.type}
              className={`hierarchy-level type-${level.type} ${isHighlighted ? 'highlighted' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                marginLeft: i * 16,
                background: isHighlighted ? `${level.color}20` : level.bg,
                borderColor: isHighlighted ? level.color : level.border,
                boxShadow: isHighlighted ? `0 0 20px ${level.color}40` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${level.color}20`,
                  border: `1px solid ${level.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={level.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: isHighlighted ? level.color : 'var(--color-text-primary)',
                  }}>
                    {level.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {level.subtitle}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)', marginTop: 2,
                  }}>
                    {level.desc}
                  </div>
                </div>
                {isHighlighted && (
                  <span style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: `${level.color}25`,
                    border: `1px solid ${level.color}50`,
                    color: level.color,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    ← Klasifikasi Anda
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

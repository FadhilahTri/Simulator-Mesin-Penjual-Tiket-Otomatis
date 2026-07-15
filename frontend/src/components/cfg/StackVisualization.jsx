/**
 * StackVisualization.jsx — Animated stack display for PDA simulation.
 */
import { motion, AnimatePresence } from 'framer-motion'

export default function StackVisualization({ stack = [], label = 'Stack' }) {
  const reversed = [...stack].reverse() // top of stack at index 0

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="section-label" style={{ marginBottom: 12 }}>{label}</div>

      {/* Stack display */}
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minHeight: 180,
        padding: '12px 8px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12,
        minWidth: 140,
      }}>
        {/* Top indicator */}
        {reversed.length > 0 && (
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--color-cyan)',
            letterSpacing: '0.1em', marginBottom: 4,
          }}>
            ▲ TOP
          </div>
        )}

        <AnimatePresence>
          {reversed.map((item, idx) => (
            <motion.div
              key={`${item}-${idx}`}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className={idx === 0 ? 'stack-item stack-item--top' : 'stack-item stack-item--normal'}
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>

        {reversed.length === 0 && (
          <div style={{
            color: 'var(--color-text-muted)',
            fontSize: 12,
            marginTop: 40,
          }}>
            Empty
          </div>
        )}

        {/* Bottom indicator */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)',
          letterSpacing: '0.1em', marginTop: 4,
          borderTop: '1px solid rgba(99,102,241,0.2)',
          paddingTop: 6, width: '100%', textAlign: 'center',
        }}>
          ▼ BOTTOM ($)
        </div>
      </div>

      <div style={{
        marginTop: 8, fontSize: 11,
        color: 'var(--color-text-muted)',
      }}>
        Depth: {stack.length}
      </div>
    </div>
  )
}

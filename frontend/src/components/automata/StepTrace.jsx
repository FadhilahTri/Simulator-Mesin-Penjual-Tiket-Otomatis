/**
 * StepTrace.jsx — Step-by-step trace display for automata simulations.
 */
import { CheckCircle2, XCircle, ArrowRight, Circle } from 'lucide-react'

export default function StepTrace({ trace = [], isNFA = false, currentStep = -1 }) {
  if (!trace.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {trace.map((step, idx) => {
        const isActive = idx === currentStep || currentStep === -1
        const isLast = idx === trace.length - 1

        return (
          <div
            key={idx}
            className={`step-trace-item ${isActive && currentStep !== -1 ? 'active' : ''}`}
            style={{
              opacity: currentStep !== -1 && idx > currentStep ? 0.3 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            <div className="step-number">{step.step}</div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--color-text-primary)',
                marginBottom: 4,
              }}>
                {step.description}
              </div>

              {/* State transition display */}
              {!isNFA && step.symbol && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: 'var(--color-text-muted)',
                }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(99,102,241,0.15)',
                    color: 'var(--color-indigo-light)',
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                  }}>{step.current_state}</span>
                  <ArrowRight size={12} color="var(--color-text-muted)" />
                  <span style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(6,182,212,0.12)',
                    color: 'var(--color-cyan)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    "{step.symbol}"
                  </span>
                  <ArrowRight size={12} color="var(--color-text-muted)" />
                  <span style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: step.next_state === '∅' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                    color: step.next_state === '∅' ? '#fb7185' : '#34d399',
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                  }}>{step.next_state}</span>
                </div>
              )}

              {/* NFA: show set of current states */}
              {isNFA && step.current_states && (
                <div style={{
                  display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>States:</span>
                  {step.current_states.map(s => (
                    <span key={s} style={{
                      padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--color-indigo-light)',
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Status icon on last step */}
            {isLast && (
              <div>
                {step.description?.includes('ACCEPT') ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : step.description?.includes('REJECT') ? (
                  <XCircle size={18} color="#f43f5e" />
                ) : (
                  <Circle size={18} color="rgba(99,102,241,0.5)" />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

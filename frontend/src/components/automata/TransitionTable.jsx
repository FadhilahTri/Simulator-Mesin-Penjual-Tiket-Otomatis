/**
 * TransitionTable.jsx — Transition function table for DFA/NFA.
 */

export default function TransitionTable({ states = [], alphabet = [], transitions = {}, final_states = [], start_state = '', activeState = null, isNFA = false }) {
  if (!states.length || !alphabet.length) return null

  const cleanAlphabet = alphabet.filter(a => a !== 'ε' && a !== 'eps')

  return (
    <div className="table-container" style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: 'max-content' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center', minWidth: 80 }}>State</th>
            {cleanAlphabet.map(sym => (
              <th key={sym} style={{ textAlign: 'center', minWidth: 80, fontFamily: 'var(--font-mono)' }}>
                {sym}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {states.map(state => {
            const isStart = state === start_state
            const isFinal = final_states.includes(state)
            const isActive = state === activeState

            return (
              <tr key={state} style={{
                background: isActive
                  ? 'rgba(99,102,241,0.12)'
                  : 'transparent',
                transition: 'background 0.3s ease',
              }}>
                <td style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                  }}>
                    {isStart && <span style={{ color: 'var(--color-cyan)', fontSize: 12 }}>→</span>}
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.08)',
                      border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}`,
                      color: isActive ? 'var(--color-indigo-light)' : 'var(--color-text-secondary)',
                    }}>
                      {isFinal ? `(${state})` : state}
                    </span>
                    {isFinal && <span style={{ color: 'var(--color-emerald)', fontSize: 10 }}>✓</span>}
                  </div>
                </td>

                {cleanAlphabet.map(sym => {
                  const trans = transitions[state]
                  let value = trans?.[sym]

                  if (isNFA) {
                    value = Array.isArray(value) ? value : (value ? [value] : [])
                    const display = value.length ? `{${value.join(', ')}}` : '∅'
                    return (
                      <td key={sym} style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: value.length ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      }}>
                        {display}
                      </td>
                    )
                  }

                  return (
                    <td key={sym} style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    }}>
                      {value || '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

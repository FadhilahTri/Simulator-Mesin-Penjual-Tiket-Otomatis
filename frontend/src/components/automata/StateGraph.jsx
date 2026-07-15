/**
 * StateGraph.jsx — Interactive React Flow state diagram for DFA/NFA.
 */
import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  MarkerType, Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

// ---- Custom Node: State Circle ----
function StateNode({ data }) {
  const { label, isStart, isFinal, isActive, isAccepted, isRejected } = data

  let nodeClass = 'state-node state-node--idle'
  if (isActive) nodeClass = 'state-node state-node--active'
  if (isAccepted) nodeClass = 'state-node state-node--accepted'
  if (isRejected) nodeClass = 'state-node state-node--rejected'

  return (
    <div style={{ position: 'relative' }}>
      {/* Start arrow indicator */}
      {isStart && (
        <div style={{
          position: 'absolute', left: -28, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-indigo-light)',
          fontSize: 18, fontWeight: 700,
        }}>→</div>
      )}

      {/* Outer ring for final state */}
      {isFinal && (
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: '2px solid var(--color-emerald)',
          opacity: 0.6,
        }} />
      )}

      <div className={nodeClass} style={{ width: 60, height: 60 }}>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

const nodeTypes = { stateNode: StateNode }

/**
 * Build React Flow nodes from state definitions.
 */
function buildNodes(states, transitions, start_state, final_states, activeState, result) {
  const count = states.length
  const radius = Math.min(280, Math.max(160, count * 45))
  const cx = radius + 80
  const cy = radius + 40

  return states.map((state, i) => {
    const angle = ((2 * Math.PI) / count) * i - Math.PI / 2
    const x = cx + radius * Math.cos(angle) - 30
    const y = cy + radius * Math.sin(angle) - 30

    return {
      id: state,
      type: 'stateNode',
      position: { x, y },
      data: {
        label: state,
        isStart: state === start_state,
        isFinal: final_states.includes(state),
        isActive: state === activeState,
        isAccepted: result === 'accepted' && final_states.includes(state) && state === activeState,
        isRejected: result === 'rejected' && state === activeState,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  })
}

/**
 * Build React Flow edges from transition table.
 */
function buildEdges(transitions, isnfa = false) {
  const edges = []
  const edgeMap = {}

  Object.entries(transitions).forEach(([from, trans]) => {
    Object.entries(trans).forEach(([symbol, target]) => {
      if (!target) return
      const targets = Array.isArray(target) ? target : [target]
      targets.forEach(to => {
        if (!to || to === '∅') return
        const key = `${from}--${to}`
        if (edgeMap[key]) {
          edgeMap[key].label += `, ${symbol}`
        } else {
          edgeMap[key] = {
            id: `e-${from}-${symbol}-${to}`,
            source: from,
            target: to,
            label: symbol,
            type: from === to ? 'selfConnecting' : 'default',
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99,102,241,0.8)' },
            style: { stroke: 'rgba(99,102,241,0.6)', strokeWidth: 2 },
            labelStyle: {
              fill: '#94a3b8', fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            },
            labelBgStyle: {
              fill: 'rgba(6, 11, 24, 0.8)',
              fillOpacity: 0.9,
            },
          }
          edges.push(edgeMap[key])
        }
      })
    })
  })

  return edges
}

export default function StateGraph({
  states = [],
  alphabet = [],
  transitions = {},
  start_state = '',
  final_states = [],
  activeState = null,
  result = null, // 'accepted' | 'rejected' | null
  isNFA = false,
  height = 480,
  id = 'state-graph',
}) {
  const initialNodes = useMemo(
    () => buildNodes(states, transitions, start_state, final_states, activeState, result),
    [states, transitions, start_state, final_states, activeState, result]
  )
  const initialEdges = useMemo(
    () => buildEdges(transitions, isNFA),
    [transitions, isNFA]
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div id={id} style={{
      height,
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'rgba(6,11,24,0.6)',
    }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(99,102,241,0.05)" gap={32} />
        <Controls showInteractive={false} />
        <MiniMap
          style={{
            background: 'rgba(6,11,24,0.9)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8,
          }}
          nodeColor={(n) => {
            if (n.data?.isAccepted) return '#10b981'
            if (n.data?.isRejected) return '#f43f5e'
            if (n.data?.isActive) return '#6366f1'
            if (n.data?.isFinal) return '#10b981'
            return '#334155'
          }}
        />
      </ReactFlow>
    </div>
  )
}

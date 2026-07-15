/**
 * ParseTree.jsx — Recursive parse tree renderer using React Flow.
 */
import ReactFlow, { Background, Controls, Position, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import { useMemo } from 'react'

function TreeNode({ data }) {
  const isTerminal = !data.hasChildren
  return (
    <div style={{
      padding: '6px 14px',
      borderRadius: 8,
      background: isTerminal
        ? 'rgba(16,185,129,0.2)'
        : 'rgba(99,102,241,0.2)',
      border: `1px solid ${isTerminal ? 'rgba(16,185,129,0.5)' : 'rgba(99,102,241,0.5)'}`,
      color: isTerminal ? '#34d399' : 'var(--color-indigo-light)',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 13,
      whiteSpace: 'nowrap',
    }}>
      {data.label}
    </div>
  )
}

const nodeTypes = { treeNode: TreeNode }

/**
 * Flatten recursive tree to React Flow nodes + edges with BFS layout.
 */
function flattenTree(tree, x = 400, y = 30, level = 0, nodes = [], edges = [], xMap = {}) {
  if (!tree) return { nodes, edges }

  const levelGap = 80
  const nodeId = tree.id

  nodes.push({
    id: nodeId,
    type: 'treeNode',
    position: { x, y: y + level * levelGap },
    data: {
      label: tree.label,
      hasChildren: tree.children && tree.children.length > 0,
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  })

  if (tree.children && tree.children.length > 0) {
    const childCount = tree.children.length
    const spread = Math.max(100, childCount * 80)
    tree.children.forEach((child, i) => {
      const childX = x - spread / 2 + (i / (childCount - 1 || 1)) * spread
      edges.push({
        id: `e-${nodeId}-${child.id}`,
        source: nodeId,
        target: child.id,
        type: 'straight',
        style: { stroke: 'rgba(99,102,241,0.5)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99,102,241,0.7)', width: 12, height: 12 },
      })
      flattenTree(child, childX, y, level + 1, nodes, edges, xMap)
    })
  }

  return { nodes, edges }
}

export default function ParseTree({ tree = null, height = 420 }) {
  const { nodes, edges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] }
    return flattenTree(tree)
  }, [tree])

  if (!tree) {
    return (
      <div style={{
        height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 12,
        color: 'var(--color-text-muted)',
        fontSize: 14,
      }}>
        Parse tree akan muncul di sini
      </div>
    )
  }

  return (
    <div style={{
      height,
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'rgba(6,11,24,0.6)',
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(99,102,241,0.04)" gap={32} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

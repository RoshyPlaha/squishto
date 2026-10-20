import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import NodeMesh from './NodeMesh.jsx'
import EdgeLine from './EdgeLine.jsx'

// Renders the estate and glides nodes between layouts.
export default function GraphView({ estate, targets, highlight, selectedNodeId, hoveredNodeId, onHover, onSelect, labelLayer }) {
  const live = useMemo(
    () => new Map(estate.nodes.map((n) => [n.id, new THREE.Vector3(...targets.get(n.id))])),
    // Live vectors are created once; later layout changes animate them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estate],
  )
  const goal = useRef(targets)
  const moving = useRef(true)
  useEffect(() => {
    goal.current = targets
    moving.current = true
  }, [targets])

  useFrame((_, dt) => {
    if (!moving.current) return
    const k = 1 - Math.exp(-dt * 3)
    let still = true
    for (const [id, v] of live) {
      const [x, y, z] = goal.current.get(id)
      v.x += (x - v.x) * k
      v.y += (y - v.y) * k
      v.z += (z - v.z) * k
      if (Math.abs(x - v.x) + Math.abs(y - v.y) + Math.abs(z - v.z) > 0.002) still = false
    }
    if (still) moving.current = false
  })

  const nodeMode = (id) => (!highlight ? 'normal' : highlight.nodeIds.has(id) ? 'path' : 'dim')
  const edgeMode = (id) => (!highlight ? 'normal' : highlight.edgeIds.has(id) ? 'path' : 'dim')

  return (
    <group>
      {estate.edges.map((e) => (
        <EdgeLine
          key={e.id}
          from={live.get(e.from)}
          to={live.get(e.to)}
          mode={edgeMode(e.id)}
          toneColor={highlight?.color}
          moving={moving}
        />
      ))}
      {estate.nodes.map((n) => (
        <NodeMesh
          key={n.id}
          node={n}
          live={live.get(n.id)}
          mode={nodeMode(n.id)}
          toneColor={highlight?.color}
          selected={selectedNodeId === n.id}
          hovered={hoveredNodeId === n.id}
          onHover={onHover}
          onSelect={onSelect}
          labelLayer={labelLayer}
        />
      ))}
    </group>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

const SEGMENTS = 32
const IDLE_COLOR = new THREE.Color('#a9b4ff')
const MOTE_IDLE = '#b9a4ff'

// Keeps a gentle arc between two moving points.
function updateCurve(curve, a, b) {
  curve.v0.copy(a)
  curve.v2.copy(b)
  curve.v1.copy(a).add(b).multiplyScalar(0.5)
  curve.v1.z += 0.5 + a.distanceTo(b) * 0.08
  curve.v1.y += 0.3
}

export default function EdgeLine({ from, to, mode, toneColor, moving }) {
  const curve = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3())
    updateCurve(c, from, to)
    return c
  }, [from, to])
  const initialPoints = useMemo(() => curve.getPoints(SEGMENTS), [curve])
  const line = useRef()
  const motes = useRef([])
  const tone = useMemo(() => new THREE.Color(toneColor ?? '#ffffff'), [toneColor])
  const moteCount = mode === 'path' ? 4 : mode === 'dim' ? 0 : 1
  const offset = useMemo(() => Math.random(), [])

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 6)
    if (moving.current) {
      updateCurve(curve, from, to)
      line.current.geometry.setPositions(curve.getPoints(SEGMENTS).flatMap((p) => [p.x, p.y, p.z]))
    }
    const m = line.current.material
    m.opacity += ((mode === 'path' ? 0.95 : mode === 'dim' ? 0.07 : 0.5) - m.opacity) * k
    m.linewidth += ((mode === 'path' ? 3.2 : 1.4) - m.linewidth) * k
    m.color.lerp(mode === 'path' ? tone : IDLE_COLOR, k)

    const t = state.clock.elapsedTime
    const speed = mode === 'path' ? 0.35 : 0.12
    motes.current.forEach((mote, i) => {
      if (!mote) return
      const u = (t * speed + offset + i / moteCount) % 1
      mote.position.copy(curve.getPoint(u))
      const s = 0.06 + Math.sin(u * Math.PI) * (mode === 'path' ? 0.09 : 0.04)
      mote.scale.setScalar(s / 0.1)
    })
  })

  return (
    <group>
      <Line ref={line} points={initialPoints} color={IDLE_COLOR} lineWidth={1.4} transparent opacity={0.5} depthWrite={false} raycast={() => null} />
      {Array.from({ length: moteCount }, (_, i) => (
        <mesh key={i} ref={(el) => (motes.current[i] = el)} raycast={() => null}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color={mode === 'path' ? toneColor : MOTE_IDLE} transparent opacity={mode === 'path' ? 0.95 : 0.6} />
        </mesh>
      ))}
    </group>
  )
}

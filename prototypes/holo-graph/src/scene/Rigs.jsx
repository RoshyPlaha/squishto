import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Tilts the graph with your head so it feels like it sits behind the screen.
export function ParallaxRig({ head, enabled, children }) {
  const ref = useRef()
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 5)
    const h = enabled && head.current.active ? head.current : { x: 0, y: 0, z: 0 }
    ref.current.rotation.y += (-h.x * 0.45 - ref.current.rotation.y) * k
    ref.current.rotation.x += (h.y * 0.3 - ref.current.rotation.x) * k
    ref.current.position.x += (-h.x * 1.2 - ref.current.position.x) * k
    ref.current.position.y += (-h.y * 0.8 - ref.current.position.y) * k
    ref.current.position.z += (h.z * 3 - ref.current.position.z) * k
  })
  return <group ref={ref}>{children}</group>
}

// Applies rotation and zoom from hand gestures.
export function HandRig({ gestures, resetToken, children }) {
  const ref = useRef()
  useEffect(() => {
    gestures.current.rot = { x: 0, y: 0 }
    gestures.current.scale = 1
  }, [resetToken, gestures])
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 8)
    const g = gestures.current
    ref.current.rotation.x += (g.rot.x - ref.current.rotation.x) * k
    ref.current.rotation.y += (g.rot.y - ref.current.rotation.y) * k
    const s = ref.current.scale.x + (g.scale - ref.current.scale.x) * k
    ref.current.scale.setScalar(s)
  })
  return <group ref={ref}>{children}</group>
}

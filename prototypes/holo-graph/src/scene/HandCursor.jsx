import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

const DWELL_MS = 650
const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()

// A glowing "fairy light" that follows your index finger and selects by dwelling.
export default function HandCursor({ gestures, enabled, onHover, onSelect }) {
  const orb = useRef()
  const ring = useRef()
  const dwell = useRef({ id: null, since: 0, fired: false })
  const scene = useThree((s) => s.scene)

  useFrame((state) => {
    const c = gestures.current.cursor
    const visible = enabled && c.visible
    orb.current.visible = visible
    ring.current.visible = visible
    if (!visible) {
      if (dwell.current.id) onHover(null)
      dwell.current = { id: null, since: 0, fired: false }
      return
    }

    ndc.set(c.x * 2 - 1, -(c.y * 2 - 1))
    raycaster.setFromCamera(ndc, state.camera)
    const targets = []
    scene.traverse((o) => o.userData.nodeId && targets.push(o))
    const hit = raycaster.intersectObjects(targets, false)[0]
    const point = hit ? hit.point : raycaster.ray.at(12, new THREE.Vector3())
    orb.current.position.lerp(point, 0.5)
    ring.current.position.copy(orb.current.position)
    ring.current.lookAt(state.camera.position)

    const id = hit?.object.userData.nodeId ?? null
    const now = performance.now()
    if (id !== dwell.current.id) {
      dwell.current = { id, since: now, fired: false }
      onHover(id)
    }
    const progress = id && !dwell.current.fired ? Math.min((now - dwell.current.since) / DWELL_MS, 1) : 0
    if (id && progress >= 1 && !dwell.current.fired) {
      dwell.current.fired = true
      onSelect(id)
    }
    ring.current.scale.setScalar(0.2 + progress * 0.8)
    ring.current.material.opacity = progress > 0 ? 0.9 : 0
    orb.current.material.color.set(c.pinching ? '#ff9db5' : '#fff6c9')
  })

  return (
    <>
      <Trail width={1.2} length={5} color="#ffc8e8" attenuation={(w) => w * w}>
        <mesh ref={orb} visible={false} raycast={() => null}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshBasicMaterial color="#fff6c9" toneMapped={false} />
        </mesh>
      </Trail>
      <mesh ref={ring} visible={false} raycast={() => null}>
        <ringGeometry args={[0.55, 0.68, 48]} />
        <meshBasicMaterial color="#ff9db5" transparent opacity={0} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
    </>
  )
}

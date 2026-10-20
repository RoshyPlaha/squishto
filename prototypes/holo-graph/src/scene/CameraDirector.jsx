import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Aim a little left of the graph's centre so the issue panel doesn't cover it.
export const HOME = { target: new THREE.Vector3(-1.4, 0, 0), position: new THREE.Vector3(-1.4, 1.5, 25) }

// Glides the orbit camera to frame a set of points; any manual drag cancels it.
export default function CameraDirector({ focus }) {
  const controls = useThree((s) => s.controls)
  const flight = useRef(null)

  useEffect(() => {
    if (!focus) {
      flight.current = { target: HOME.target.clone(), position: HOME.position.clone() }
      return
    }
    const center = new THREE.Vector3()
    focus.points.forEach((p) => center.add(new THREE.Vector3(...p)))
    center.divideScalar(focus.points.length)
    const radius = Math.max(...focus.points.map((p) => center.distanceTo(new THREE.Vector3(...p))), 2)
    const target = center.clone().add(new THREE.Vector3(-(radius * 0.35 + 1), 0, 0))
    const position = target.clone().add(new THREE.Vector3(radius * 0.25, radius * 0.2, radius * 2.2 + 5))
    flight.current = { target, position }
  }, [focus])

  useEffect(() => {
    if (!controls) return
    const cancel = () => (flight.current = null)
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((state, dt) => {
    const f = flight.current
    if (!f || !controls) return
    const k = 1 - Math.exp(-dt * 2.5)
    controls.target.lerp(f.target, k)
    state.camera.position.lerp(f.position, k)
    controls.update()
    if (state.camera.position.distanceTo(f.position) < 0.02) flight.current = null
  })
  return null
}

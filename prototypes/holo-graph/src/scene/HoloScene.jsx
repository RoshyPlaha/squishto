import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Sparkles } from '@react-three/drei'
import GraphView from './GraphView.jsx'
import CameraDirector, { HOME } from './CameraDirector.jsx'
import HandCursor from './HandCursor.jsx'
import { HandRig, ParallaxRig } from './Rigs.jsx'

export default function HoloScene({ graphProps, focus, autoSpin, head, parallax, gestures, gesturesOn, resetToken, onBackgroundClick }) {
  // A stable home for the HTML labels; otherwise drei re-mounts them whenever the event target changes.
  const labels = useRef(null)
  return (
    <>
      <div ref={labels} className="labels-layer" />
      <Canvas
        className="holo-canvas"
        camera={{ position: HOME.position.toArray(), fov: 45, near: 0.1, far: 200 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        onPointerMissed={onBackgroundClick}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 8]} intensity={1.3} />
        <Environment resolution={128}>
          <Lightformer form="ring" intensity={2.2} color="#ffd6f2" position={[0, 6, -8]} scale={10} />
          <Lightformer intensity={2} color="#cfe8ff" position={[-8, 2, 4]} scale={[6, 12, 1]} />
          <Lightformer intensity={2} color="#e9dcff" position={[8, -2, 4]} scale={[6, 12, 1]} />
          <Lightformer intensity={1.2} color="#fff4d6" position={[0, -8, 2]} rotation-x={Math.PI / 2} scale={12} />
        </Environment>

        <Sparkles count={140} scale={[34, 20, 16]} size={4} speed={0.25} opacity={0.7} color="#c4a7ff" />
        <Sparkles count={90} scale={[34, 20, 16]} size={3} speed={0.35} opacity={0.6} color="#ff9ecf" />
        <Sparkles count={60} scale={[34, 20, 16]} size={5} speed={0.2} opacity={0.5} color="#8fd3ff" />

        <ParallaxRig head={head} enabled={parallax}>
          <HandRig gestures={gestures} resetToken={resetToken}>
            <GraphView {...graphProps} labelLayer={labels} />
          </HandRig>
        </ParallaxRig>

        <HandCursor gestures={gestures} enabled={gesturesOn} onHover={graphProps.onHover} onSelect={graphProps.onSelect} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} autoRotate={autoSpin} autoRotateSpeed={0.35} minDistance={4} maxDistance={45} />
        <CameraDirector focus={focus} />
      </Canvas>
    </>
  )
}

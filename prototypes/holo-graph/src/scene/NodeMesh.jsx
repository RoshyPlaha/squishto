import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { TYPE_STYLE } from '../theme.js'
import { getHaloTexture } from './haloTexture.js'

const noRaycast = () => null

function Shape({ shape, size, children, ...props }) {
  if (shape === 'box') {
    return (
      <RoundedBox args={[size * 1.7, size * 1.15, size * 1.15]} radius={0.14} smoothness={4} {...props}>
        {children}
      </RoundedBox>
    )
  }
  const geometry = {
    globe: <sphereGeometry args={[size, 48, 48]} />,
    gem: <icosahedronGeometry args={[size, 0]} />,
    cone: <coneGeometry args={[size, size * 1.7, 32]} />,
    dodeca: <dodecahedronGeometry args={[size]} />,
    torus: <torusGeometry args={[size * 0.75, size * 0.3, 24, 64]} />,
    bucket: <cylinderGeometry args={[size, size * 0.72, size * 1.4, 40]} />,
    octa: <octahedronGeometry args={[size]} />,
    tetra: <tetrahedronGeometry args={[size * 1.25]} />,
  }[shape]
  return (
    <mesh {...props}>
      {geometry}
      {children}
    </mesh>
  )
}

export default function NodeMesh({ node, live, mode, toneColor, selected, hovered, onHover, onSelect, labelLayer }) {
  const style = TYPE_STYLE[node.type]
  const group = useRef()
  const body = useRef()
  const material = useRef()
  const halo = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const baseColor = useMemo(() => new THREE.Color(style.color), [style.color])
  const glowColor = useMemo(() => new THREE.Color(toneColor ?? style.color), [toneColor, style.color])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const k = 1 - Math.exp(-dt * 6)
    group.current.position.copy(live)

    const pulse = mode === 'path' ? 1 + 0.1 * Math.sin(t * 2.4 + phase) : 1
    const s = (selected ? 1.3 : hovered ? 1.18 : 1) * pulse
    body.current.scale.lerp(new THREE.Vector3(s, s, s), k)
    if (style.shape === 'torus' || style.shape === 'globe') body.current.rotation.y += dt * 0.4

    material.current.opacity += ((mode === 'dim' ? 0.16 : 0.92) - material.current.opacity) * k
    material.current.emissive.lerp(mode === 'path' ? glowColor : baseColor, k)
    material.current.emissiveIntensity += ((mode === 'path' ? 0.55 : 0.18) - material.current.emissiveIntensity) * k

    const haloOpacity = mode === 'dim' ? 0.04 : mode === 'path' ? 0.85 : selected || hovered ? 0.6 : 0.38
    halo.current.material.opacity += (haloOpacity - halo.current.material.opacity) * k
    halo.current.material.color.lerp(mode === 'path' ? glowColor : baseColor, k)
    const hs = style.size * 4.4 * pulse * (mode === 'path' ? 1.25 : 1)
    halo.current.scale.set(hs, hs, 1)
  })

  const pointer = {
    onPointerOver: (e) => {
      e.stopPropagation()
      onHover(node.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      onHover(null)
      document.body.style.cursor = ''
    },
    onClick: (e) => {
      e.stopPropagation()
      onSelect(node.id)
    },
  }

  return (
    <group ref={group}>
      <Float speed={1.3} rotationIntensity={0.35} floatIntensity={0.45} floatingRange={[-0.08, 0.08]}>
        <sprite ref={halo} raycast={noRaycast} renderOrder={-1}>
          <spriteMaterial map={getHaloTexture()} transparent depthWrite={false} opacity={0.38} color={style.color} />
        </sprite>
        <group ref={body}>
          <Shape shape={style.shape} size={style.size} userData={{ nodeId: node.id }} {...pointer}>
            <meshPhysicalMaterial
              ref={material}
              color={style.color}
              emissive={style.color}
              emissiveIntensity={0.18}
              roughness={0.18}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.08}
              iridescence={1}
              iridescenceIOR={1.35}
              sheen={0.6}
              sheenColor="#ffffff"
              transparent
              opacity={0.92}
            />
          </Shape>
          {style.shape === 'globe' && (
            <mesh raycast={noRaycast} scale={1.04}>
              <icosahedronGeometry args={[style.size, 3]} />
              <meshBasicMaterial color="#ffffff" wireframe transparent opacity={mode === 'dim' ? 0.1 : 0.55} />
            </mesh>
          )}
        </group>
        {mode === 'path' && (
          <Sparkles count={14} scale={style.size * 3.4} size={5} speed={0.6} color={toneColor} noise={0.4} />
        )}
        <Html
          portal={labelLayer}
          center={!style.labelRight}
          position={style.labelRight ? [style.size + 0.2, 0, 0] : [0, -(style.size + 0.55), 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
        >
          <div className={`node-label ${mode} ${selected ? 'selected' : ''} ${style.labelRight ? 'right' : ''}`}>
            <span className="node-emoji">{style.emoji}</span>
            {node.name}
          </div>
        </Html>
      </Float>
    </group>
  )
}

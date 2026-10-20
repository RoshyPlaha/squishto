import { useEffect, useRef } from 'react'

const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
]

// A small mirrored "magic mirror" showing what the hand tracker sees.
export default function CameraPreview({ videoRef, gestures, showVideo }) {
  const canvas = useRef()
  useEffect(() => {
    let raf
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const c = canvas.current
      const v = videoRef.current
      if (!c || !v) return
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.save()
      ctx.translate(c.width, 0)
      ctx.scale(-1, 1)
      if (showVideo && v.readyState >= 2) ctx.drawImage(v, 0, 0, c.width, c.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(255,157,181,0.9)'
      ctx.fillStyle = '#fff6c9'
      for (const lm of gestures.current.landmarks ?? []) {
        for (const [a, b] of BONES) {
          ctx.beginPath()
          ctx.moveTo(lm[a].x * c.width, lm[a].y * c.height)
          ctx.lineTo(lm[b].x * c.width, lm[b].y * c.height)
          ctx.stroke()
        }
        for (const p of lm) {
          ctx.beginPath()
          ctx.arc(p.x * c.width, p.y * c.height, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [videoRef, gestures, showVideo])

  return (
    <div className="glass preview">
      <canvas ref={canvas} width={240} height={135} />
    </div>
  )
}

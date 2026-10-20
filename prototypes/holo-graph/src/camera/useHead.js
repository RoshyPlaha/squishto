import { useEffect, useState } from 'react'
import { createFaceLandmarker, runOnVideo } from './vision.js'

const LEFT_EYE = 33
const RIGHT_EYE = 263

// Writes a smoothed head position (-1..1, mirrored like a selfie) into headRef.
export function useHead(videoRef, enabled, headRef) {
  const [status, setStatus] = useState('off')

  useEffect(() => {
    headRef.current.active = false
    if (!enabled) {
      setStatus('off')
      return
    }
    let stop = () => {}
    let landmarker
    let cancelled = false
    let baseEyeDist = null
    setStatus('loading')

    createFaceLandmarker()
      .then((l) => {
        if (cancelled) return l.close()
        landmarker = l
        setStatus('ready')
        stop = runOnVideo(videoRef.current, (now) => {
          const face = landmarker.detectForVideo(videoRef.current, now).faceLandmarks?.[0]
          const h = headRef.current
          if (!face) {
            h.active = false
            return
          }
          const l = face[LEFT_EYE]
          const r = face[RIGHT_EYE]
          const x = (1 - (l.x + r.x) / 2 - 0.5) * 2
          const y = (0.5 - (l.y + r.y) / 2) * 2
          const eyeDist = Math.hypot(l.x - r.x, l.y - r.y)
          baseEyeDist ??= eyeDist
          const z = Math.max(-1, Math.min(1, (eyeDist - baseEyeDist) / baseEyeDist))
          h.x += (x - h.x) * 0.3
          h.y += (y - h.y) * 0.3
          h.z += (z - h.z) * 0.2
          h.active = true
        })
      })
      .catch(() => !cancelled && setStatus('error'))

    return () => {
      cancelled = true
      stop()
      landmarker?.close()
      headRef.current.active = false
    }
  }, [enabled, videoRef, headRef])

  return status
}

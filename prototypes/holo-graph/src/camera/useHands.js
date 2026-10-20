import { useEffect, useRef, useState } from 'react'
import { createHandLandmarker, runOnVideo } from './vision.js'
import { describeHand, dist } from './gestures.js'

const SWIPE_DISTANCE = 0.22
const SWIPE_WINDOW_MS = 380
const PALM_HOLD_MS = 1500

// Turns hand landmarks into cursor / rotate / zoom state plus swipe and palm-hold events.
export function useHands(videoRef, enabled, gestures, { onSwipe, onPalmHold }) {
  const [status, setStatus] = useState('off')
  const handlers = useRef({ onSwipe, onPalmHold })
  handlers.current = { onSwipe, onPalmHold }

  useEffect(() => {
    const g = gestures.current
    g.cursor.visible = false
    if (!enabled) {
      setStatus('off')
      return
    }
    let stop = () => {}
    let landmarker
    let cancelled = false
    const s = { pinched: [], lastPinch: null, lastSpread: null, palmTrail: [], palmSince: null, palmFired: false, cooldown: 0 }
    setStatus('loading')

    const process = (result, now) => {
      const hands = (result.landmarks ?? []).map((lm, i) => describeHand(lm, s.pinched[i]))
      s.pinched = hands.map((h) => h.pinched)
      g.landmarks = result.landmarks ?? []

      if (hands.length === 0) {
        g.cursor.visible = false
        s.lastPinch = s.lastSpread = null
        s.palmTrail = []
        s.palmSince = null
        return
      }

      const main = hands[0]
      const point = main.pinched ? main.pinchPoint : main.index
      const c = g.cursor
      c.x = c.visible ? c.x + (point.x - c.x) * 0.45 : point.x
      c.y = c.visible ? c.y + (point.y - c.y) * 0.45 : point.y
      c.visible = true
      c.pinching = main.pinched

      const pinchedHands = hands.filter((h) => h.pinched)
      if (pinchedHands.length === 2) {
        // Two-hand pinch: pull apart to zoom in, together to zoom out.
        const spread = dist(pinchedHands[0].pinchPoint, pinchedHands[1].pinchPoint)
        if (s.lastSpread) g.scale = Math.max(0.4, Math.min(2.6, g.scale * (spread / s.lastSpread)))
        s.lastSpread = spread
        s.lastPinch = null
      } else if (pinchedHands.length === 1) {
        // One-hand pinch and drag: spin the graph.
        const p = pinchedHands[0].pinchPoint
        if (s.lastPinch) {
          g.rot.y += (p.x - s.lastPinch.x) * 5
          g.rot.x = Math.max(-1.1, Math.min(1.1, g.rot.x + (p.y - s.lastPinch.y) * 4))
        }
        s.lastPinch = p
        s.lastSpread = null
      } else {
        s.lastPinch = s.lastSpread = null
      }

      const palm = hands.find((h) => h.openPalm)
      if (!palm) {
        s.palmTrail = []
        s.palmSince = null
        s.palmFired = false
        return
      }
      s.palmTrail = [...s.palmTrail.filter((p) => now - p.t < SWIPE_WINDOW_MS), { ...palm.palm, t: now }]
      const dx = palm.palm.x - s.palmTrail[0].x
      if (Math.abs(dx) > SWIPE_DISTANCE && now > s.cooldown) {
        handlers.current.onSwipe?.(Math.sign(dx))
        s.cooldown = now + 900
        s.palmTrail = []
        s.palmSince = null
        return
      }
      const steady = s.palmTrail.every((p) => Math.abs(p.x - palm.palm.x) < 0.04)
      s.palmSince = steady ? (s.palmSince ?? now) : null
      if (s.palmSince && now - s.palmSince > PALM_HOLD_MS && !s.palmFired) {
        s.palmFired = true
        handlers.current.onPalmHold?.()
      }
    }

    createHandLandmarker()
      .then((l) => {
        if (cancelled) return l.close()
        landmarker = l
        setStatus('ready')
        stop = runOnVideo(videoRef.current, (now) => process(landmarker.detectForVideo(videoRef.current, now), now))
      })
      .catch(() => !cancelled && setStatus('error'))

    return () => {
      cancelled = true
      stop()
      landmarker?.close()
      g.cursor.visible = false
      g.landmarks = []
    }
  }, [enabled, videoRef, gestures])

  return status
}

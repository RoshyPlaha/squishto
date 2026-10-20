// Pure gesture maths over MediaPipe hand landmarks (21 points, normalised 0..1).

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const FINGERS = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
]

export function describeHand(lm, wasPinched) {
  const size = dist(lm[0], lm[9]) || 1e-3
  const pinchRatio = dist(lm[4], lm[8]) / size
  // Hysteresis: easier to stay pinched than to start a pinch.
  const pinched = wasPinched ? pinchRatio < 0.5 : pinchRatio < 0.32
  const extended = FINGERS.map(([tip, pip]) => dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * 1.12)
  const openPalm = !pinched && extended.every(Boolean)
  const mirror = (p) => ({ x: 1 - p.x, y: p.y })
  return {
    pinched,
    openPalm,
    index: mirror(lm[8]),
    pinchPoint: mirror({ x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 }),
    palm: mirror(lm[9]),
  }
}

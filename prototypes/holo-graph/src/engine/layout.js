// Two layouts: "layers" (left-to-right like an attack path) and
// "constellation" (a soft 3D force-directed cloud).

const COLUMN = {
  internet: 0,
  endpoint: 1,
  ec2: 2,
  lambda: 2,
  iam_role: 3,
  iam_user: 3,
  s3: 4,
}
// Findings and technologies orbit the compute they belong to.
const SATELLITE = new Set(['technology', 'vulnerability', 'secret'])

const X_GAP = 4.8
// Extra room after the compute column so finding labels don't run into identities.
const COLUMN_X = [-2, -1, 0, 1.35, 2.35].map((c) => c * X_GAP)
const Y_GAP = 2.3

export function layeredLayout(estate) {
  const pos = new Map()
  const parentOf = new Map()
  for (const e of estate.edges) {
    const to = estate.nodes.find((n) => n.id === e.to)
    if (SATELLITE.has(to.type) && !parentOf.has(to.id)) parentOf.set(to.id, e.from)
  }
  const preds = (id) => estate.edges.filter((e) => e.to === id).map((e) => e.from)

  const columns = [[], [], [], [], []]
  for (const n of estate.nodes) if (n.type in COLUMN) columns[COLUMN[n.type]].push(n)

  columns.forEach((col, ci) => {
    // Order each column by where its predecessors sit to reduce crossings.
    const key = (n) => {
      const ys = preds(n.id)
        .map((p) => pos.get(p) ?? pos.get(parentOf.get(p)))
        .filter(Boolean)
        .map((p) => p[1])
      return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0
    }
    if (ci > 0) col.sort((a, b) => key(b) - key(a))
    col.forEach((n, i) => {
      const gap = ci === 2 ? Y_GAP * 1.7 : Y_GAP
      const y = ((col.length - 1) / 2 - i) * gap
      const z = ci === 0 ? 0 : (i % 2 ? -0.9 : 0.9)
      pos.set(n.id, [COLUMN_X[ci], y, z])
    })

    // Place satellites around compute nodes, spread through depth.
    if (ci === 2) {
      for (const host of col) {
        const sats = estate.nodes.filter((n) => parentOf.get(n.id) === host.id)
        const [hx, hy, hz] = pos.get(host.id)
        sats.forEach((s, i) => {
          const y = hy + 0.5 + ((sats.length - 1) / 2 - i) * 1.2
          pos.set(s.id, [hx + 2.4, y, hz + (i % 2 ? -1.6 : 1.6)])
        })
      }
    }
  })
  // Satellites of satellites (none today) or stragglers fall back to the origin.
  for (const n of estate.nodes) if (!pos.has(n.id)) pos.set(n.id, [0, 0, 0])
  return pos
}

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

export function constellationLayout(estate, iterations = 400) {
  const rand = seeded(7)
  const start = layeredLayout(estate)
  const ids = estate.nodes.map((n) => n.id)
  const p = ids.map((id) => {
    const [x, y, z] = start.get(id)
    return [x * 0.6, y * 0.6, z + (rand() - 0.5) * 6]
  })
  const index = new Map(ids.map((id, i) => [id, i]))
  const springs = estate.edges.map((e) => [index.get(e.from), index.get(e.to)])

  for (let it = 0; it < iterations; it++) {
    const cool = 1 - it / iterations
    const f = p.map(() => [0, 0, 0])
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const d = [p[i][0] - p[j][0], p[i][1] - p[j][1], p[i][2] - p[j][2]]
        const dist2 = Math.max(d[0] ** 2 + d[1] ** 2 + d[2] ** 2, 0.01)
        const k = 3 / dist2
        for (let a = 0; a < 3; a++) {
          f[i][a] += d[a] * k
          f[j][a] -= d[a] * k
        }
      }
    }
    for (const [i, j] of springs) {
      const d = [p[j][0] - p[i][0], p[j][1] - p[i][1], p[j][2] - p[i][2]]
      const dist = Math.hypot(...d) || 0.01
      const k = (dist - 3) * 0.08
      for (let a = 0; a < 3; a++) {
        f[i][a] += (d[a] / dist) * k * dist
        f[j][a] -= (d[a] / dist) * k * dist
      }
    }
    for (let i = 0; i < p.length; i++) {
      for (let a = 0; a < 3; a++) {
        f[i][a] -= p[i][a] * 0.06
        p[i][a] += Math.max(-0.5, Math.min(0.5, f[i][a] * 0.1)) * cool
      }
    }
  }
  // Recentre and fit inside a sphere of radius ~8 so the camera framing works.
  const c = [0, 1, 2].map((a) => p.reduce((sum, q) => sum + q[a], 0) / p.length)
  const centred = p.map((q) => q.map((v, a) => v - c[a]))
  const r = Math.max(...centred.map((q) => Math.hypot(...q)))
  return new Map(ids.map((id, i) => [id, centred[i].map((v) => (v * 8) / r)]))
}

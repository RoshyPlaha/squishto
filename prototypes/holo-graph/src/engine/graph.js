// A tiny in-memory "graph database" over the estate JSON.

export const COMPUTE_TYPES = new Set(['ec2', 'lambda'])
export const IDENTITY_TYPES = new Set(['iam_role', 'iam_user'])

export function buildGraph(estate) {
  const nodes = new Map(estate.nodes.map((n) => [n.id, n]))
  const edges = new Map(estate.edges.map((e) => [e.id, e]))
  const out = new Map()
  const inn = new Map()
  for (const n of estate.nodes) {
    out.set(n.id, [])
    inn.set(n.id, [])
  }
  for (const e of estate.edges) {
    out.get(e.from).push(e)
    inn.get(e.to).push(e)
  }

  const outgoing = (id, rel) => out.get(id).filter((e) => !rel || e.rel === rel)
  const incoming = (id, rel) => inn.get(id).filter((e) => !rel || e.rel === rel)

  return { nodes, edges, outgoing, incoming }
}

const SEVERITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 }
export const severityRank = (s) => SEVERITY_RANK[s] ?? 0

export const isSensitive = (node) => (node.props?.dataClassification ?? []).length > 0

export function isPrivileged(identity) {
  const policies = identity.props?.policies ?? []
  return policies.some((p) => p === 'AdministratorAccess' || p === 's3:*' || p === '*')
}

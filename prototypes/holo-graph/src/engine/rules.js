// Toxic-combination rules: each walks the graph and returns issues that
// carry the exact nodes and edges forming the attack path.

import { buildGraph, COMPUTE_TYPES, isPrivileged, isSensitive, severityRank } from './graph.js'

// internet -> endpoint -> compute, returning the endpoints and edges used.
function internetExposure(g, computeId) {
  const nodeIds = []
  const edgeIds = []
  for (const routed of g.incoming(computeId, 'routes_to')) {
    const exposedBy = g.incoming(routed.from, 'exposes').filter((e) => e.from === 'internet')
    if (exposedBy.length === 0) continue
    nodeIds.push(routed.from)
    edgeIds.push(routed.id, ...exposedBy.map((e) => e.id))
  }
  if (nodeIds.length === 0) return null
  return { nodeIds: ['internet', ...nodeIds], edgeIds }
}

// identity -> sensitive data stores it can reach.
function sensitiveReach(g, identityId) {
  return g
    .outgoing(identityId, 'can_access')
    .filter((e) => isSensitive(g.nodes.get(e.to)))
}

function exposedVulnerablePrivileged(g) {
  const issues = []
  for (const node of g.nodes.values()) {
    if (!COMPUTE_TYPES.has(node.type)) continue
    const exposure = internetExposure(g, node.id)
    if (!exposure) continue

    const vulnEdges = g
      .outgoing(node.id, 'has_finding')
      .filter((e) => {
        const f = g.nodes.get(e.to)
        return f.type === 'vulnerability' && severityRank(f.props.severity) >= severityRank('high')
      })
    if (vulnEdges.length === 0) continue

    for (const assumes of g.outgoing(node.id, 'assumes')) {
      const role = g.nodes.get(assumes.to)
      if (!isPrivileged(role)) continue
      const dataEdges = sensitiveReach(g, role.id)
      if (dataEdges.length === 0) continue

      const techEdges = g.outgoing(node.id, 'runs')
      const tech = techEdges.map((e) => g.nodes.get(e.to).name)
      const data = dataEdges.map((e) => g.nodes.get(e.to))
      const cves = vulnEdges.map((e) => g.nodes.get(e.to).name)

      issues.push({
        id: `exposed-vuln-priv:${node.id}:${role.id}`,
        rule: 'Exposed + vulnerable + privileged',
        severity: 'critical',
        title: `Internet-facing ${tech.length ? tech[0].split(' (')[0] + ' ' : ''}workload with critical vulnerabilities can reach sensitive data`,
        description:
          `${node.name} is reachable from the internet, has ${cves.join(' and ')}, ` +
          `and assumes ${role.name} (${role.props.policies.join(', ')}). ` +
          `Someone who exploits it could read ${data.map((d) => `${d.name} (${d.props.dataClassification.join(', ')})`).join(' and ')}.`,
        remediation: [
          `Patch ${cves.join(', ')}`,
          `Put ${node.name} behind authentication or remove its public IP`,
          `Scope ${role.name} down to least privilege`,
        ],
        nodeIds: [
          ...exposure.nodeIds,
          node.id,
          ...techEdges.map((e) => e.to),
          ...vulnEdges.map((e) => e.to),
          role.id,
          ...dataEdges.map((e) => e.to),
        ],
        edgeIds: [
          ...exposure.edgeIds,
          ...techEdges.map((e) => e.id),
          ...vulnEdges.map((e) => e.id),
          assumes.id,
          ...dataEdges.map((e) => e.id),
        ],
      })
    }
  }
  return issues
}

function leakedSecretReachesData(g) {
  const issues = []
  for (const node of g.nodes.values()) {
    if (node.type !== 'secret') continue
    for (const found of g.incoming(node.id, 'has_finding')) {
      const host = g.nodes.get(found.from)
      for (const grants of g.outgoing(node.id, 'grants')) {
        const identity = g.nodes.get(grants.to)
        const dataEdges = sensitiveReach(g, identity.id)
        if (dataEdges.length === 0) continue

        const exposure = internetExposure(g, host.id)
        const data = dataEdges.map((e) => g.nodes.get(e.to))
        issues.push({
          id: `secret-to-data:${node.id}:${identity.id}`,
          rule: 'Exposed secret reaches data',
          severity: exposure ? 'critical' : 'high',
          title: `Plain-text cloud key on ${exposure ? 'an internet-facing' : 'a'} host unlocks sensitive data`,
          description:
            `${node.name} on ${host.name} belongs to ${identity.name}` +
            `${identity.props.mfa === false ? ' (no MFA)' : ''}, which can read ` +
            `${data.map((d) => `${d.name} (${d.props.dataClassification.join(', ')})`).join(' and ')}.`,
          remediation: [
            `Rotate and delete the key for ${identity.name}`,
            `Use an instance role instead of long-lived keys`,
          ],
          nodeIds: [
            ...(exposure?.nodeIds ?? []),
            host.id,
            node.id,
            identity.id,
            ...dataEdges.map((e) => e.to),
          ],
          edgeIds: [
            ...(exposure?.edgeIds ?? []),
            found.id,
            grants.id,
            ...dataEdges.map((e) => e.id),
          ],
        })
      }
    }
  }
  return issues
}

function publicSensitiveBucket(g) {
  const issues = []
  for (const node of g.nodes.values()) {
    if (node.type !== 's3' || !node.props.public || !isSensitive(node)) continue
    const exposed = g.incoming(node.id, 'exposes').filter((e) => e.from === 'internet')
    issues.push({
      id: `public-bucket:${node.id}`,
      rule: 'Public bucket with sensitive data',
      severity: 'high',
      title: 'Publicly readable bucket holds sensitive data',
      description: `${node.name} allows public reads and contains ${node.props.dataClassification.join(', ')} data${node.props.encrypted ? '' : ', unencrypted'}.`,
      remediation: [`Turn on S3 Block Public Access for ${node.name}`, 'Enable default encryption'],
      nodeIds: ['internet', node.id],
      edgeIds: exposed.map((e) => e.id),
    })
  }
  return issues
}

export const RULES = [exposedVulnerablePrivileged, leakedSecretReachesData, publicSensitiveBucket]

export function findIssues(estate) {
  const g = buildGraph(estate)
  return RULES.flatMap((rule) => rule(g))
    .map((issue) => ({ ...issue, nodeIds: [...new Set(issue.nodeIds)], edgeIds: [...new Set(issue.edgeIds)] }))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
}

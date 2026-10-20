import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { findIssues } from './rules.js'

const estate = JSON.parse(readFileSync(new URL('../data/estate.json', import.meta.url)))

test('finds the exposed MCP host -> admin role -> sensitive data path', () => {
  const issue = findIssues(estate).find((i) => i.rule === 'Exposed + vulnerable + privileged')
  assert.ok(issue)
  assert.equal(issue.severity, 'critical')
  for (const id of ['internet', 'ep-8000', 'ep-sse', 'ep-22', 'ec2-mcp', 'cve-53366', 'cve-53365', 'role-admin', 's3-pii', 's3-src']) {
    assert.ok(issue.nodeIds.includes(id), `missing ${id}`)
  }
  assert.ok(!issue.nodeIds.includes('s3-logs'))
})

test('finds the leaked key path and the public bucket', () => {
  const rules = findIssues(estate).map((i) => i.rule)
  assert.deepEqual(rules.sort(), [
    'Exposed + vulnerable + privileged',
    'Exposed secret reaches data',
    'Public bucket with sensitive data',
  ])
})

test('every issue references real nodes and edges', () => {
  const nodeIds = new Set(estate.nodes.map((n) => n.id))
  const edgeIds = new Set(estate.edges.map((e) => e.id))
  for (const issue of findIssues(estate)) {
    issue.nodeIds.forEach((id) => assert.ok(nodeIds.has(id), id))
    issue.edgeIds.forEach((id) => assert.ok(edgeIds.has(id), id))
  }
})

test('the benign batch worker raises nothing', () => {
  for (const issue of findIssues(estate)) assert.ok(!issue.nodeIds.includes('ec2-batch'))
})

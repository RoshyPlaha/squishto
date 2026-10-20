import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import estate from './data/estate.json'
import { buildGraph } from './engine/graph.js'
import { findIssues } from './engine/rules.js'
import { constellationLayout, layeredLayout } from './engine/layout.js'
import { PATH_COLOR } from './theme.js'
import HoloScene from './scene/HoloScene.jsx'
import IssuePanel from './ui/IssuePanel.jsx'
import NodeInspector from './ui/NodeInspector.jsx'
import ModeToggles from './ui/ModeToggles.jsx'
import CameraPreview from './ui/CameraPreview.jsx'
import GestureHelp from './ui/GestureHelp.jsx'
import { useCamera } from './camera/useCamera.js'
import { useHands } from './camera/useHands.js'
import { useHead } from './camera/useHead.js'

const FOCUS_COLOR = '#9f8cff'
const LAYOUTS = { layers: layeredLayout(estate), constellation: constellationLayout(estate) }

export default function App() {
  const graph = useMemo(() => buildGraph(estate), [])
  const issues = useMemo(() => findIssues(estate), [])

  const [issueId, setIssueId] = useState(null)
  const [nodeId, setNodeId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const [layout, setLayout] = useState('layers')
  const [modes, setModes] = useState({ backdrop: false, parallax: false, gestures: false, autoSpin: true })
  const [resetToken, setResetToken] = useState(0)
  const toggleMode = (m) => setModes((s) => ({ ...s, [m]: !s[m] }))

  const videoRef = useRef(null)
  const head = useRef({ x: 0, y: 0, z: 0, active: false })
  const gestures = useRef({ cursor: { x: 0.5, y: 0.5, visible: false, pinching: false }, rot: { x: 0, y: 0 }, scale: 1, landmarks: [] })

  const issue = issues.find((i) => i.id === issueId)
  const selectIssue = useCallback((id) => {
    setIssueId(id)
    setResetToken((t) => t + 1)
  }, [])
  const reset = useCallback(() => {
    setIssueId(null)
    setNodeId(null)
    setResetToken((t) => t + 1)
  }, [])
  const stepIssue = useCallback(
    (dir) => {
      setIssueId((current) => {
        const i = issues.findIndex((x) => x.id === current)
        const next = i === -1 ? (dir > 0 ? 0 : issues.length - 1) : (i + dir + issues.length) % issues.length
        return issues[next].id
      })
      setResetToken((t) => t + 1)
    },
    [issues],
  )

  const cameraStatus = useCamera(videoRef, modes.backdrop || modes.parallax || modes.gestures)
  const handStatus = useHands(videoRef, modes.gestures && cameraStatus === 'live', gestures, { onSwipe: stepIssue, onPalmHold: reset })
  const headStatus = useHead(videoRef, modes.parallax && cameraStatus === 'live', head)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') reset()
      if (e.key === 'ArrowRight') stepIssue(1)
      if (e.key === 'ArrowLeft') stepIssue(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reset, stepIssue])

  // An issue lights its whole path; a selected node softly lights its neighbours.
  const highlight = useMemo(() => {
    if (issue) return { nodeIds: new Set(issue.nodeIds), edgeIds: new Set(issue.edgeIds), color: PATH_COLOR }
    if (!nodeId) return null
    const edges = [...graph.outgoing(nodeId), ...graph.incoming(nodeId)]
    return {
      nodeIds: new Set([nodeId, ...edges.flatMap((e) => [e.from, e.to])]),
      edgeIds: new Set(edges.map((e) => e.id)),
      color: FOCUS_COLOR,
    }
  }, [issue, nodeId, graph])

  const targets = LAYOUTS[layout]
  const focus = useMemo(() => (issue ? { points: issue.nodeIds.map((id) => targets.get(id)) } : null), [issue, targets])

  const graphProps = {
    estate,
    targets,
    highlight,
    selectedNodeId: nodeId,
    hoveredNodeId: hoverId,
    onHover: setHoverId,
    onSelect: setNodeId,
  }

  return (
    <div className={`app ${modes.backdrop && cameraStatus === 'live' ? 'with-backdrop' : ''}`}>
      <video ref={videoRef} className="backdrop-video" playsInline muted />
      <div className="backdrop-wash" />

      <HoloScene
        graphProps={graphProps}
        focus={focus}
        autoSpin={modes.autoSpin && !issue}
        head={head}
        parallax={modes.parallax}
        gestures={gestures}
        gesturesOn={modes.gestures}
        resetToken={resetToken}
        onBackgroundClick={() => setNodeId(null)}
      />

      <header className="glass brand">
        <span className="logo">✦</span>
        <div>
          <h1>Holo Graph</h1>
          <p className="muted">
            {estate.account.name} · {estate.account.region} · {estate.nodes.length} resources
          </p>
        </div>
      </header>

      <IssuePanel issues={issues} nodes={graph.nodes} selectedId={issueId} onSelect={selectIssue} onSelectNode={setNodeId} />
      <NodeInspector
        node={graph.nodes.get(nodeId)}
        graph={graph}
        issues={issues}
        onClose={() => setNodeId(null)}
        onSelectNode={setNodeId}
        onSelectIssue={selectIssue}
      />

      {(modes.gestures || modes.parallax) && cameraStatus === 'live' && (
        <CameraPreview videoRef={videoRef} gestures={gestures} showVideo={!modes.backdrop} />
      )}
      {modes.gestures && <GestureHelp />}

      <ModeToggles
        modes={modes}
        setMode={toggleMode}
        layout={layout}
        setLayout={setLayout}
        statuses={[cameraStatus, handStatus, headStatus]}
      />
    </div>
  )
}

const STATUS_TEXT = {
  starting: 'Starting camera…',
  denied: 'Camera blocked: allow it in your browser',
  unsupported: 'Camera needs HTTPS or localhost',
  loading: 'Waking up the tracker…',
  error: 'Tracker failed to load (check your network)',
}

function Toggle({ on, onClick, children, title }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} title={title}>
      {children}
    </button>
  )
}

export default function ModeToggles({ modes, setMode, layout, setLayout, statuses }) {
  const message = statuses.map((s) => STATUS_TEXT[s]).find(Boolean)
  return (
    <div className="dock">
      {message && <div className="glass status">{message}</div>}
      <nav className="glass toggles">
        <Toggle on={modes.backdrop} onClick={() => setMode('backdrop')} title="Show your camera behind the graph">
          🪞 Room view
        </Toggle>
        <Toggle on={modes.parallax} onClick={() => setMode('parallax')} title="Move your head to peek around the graph">
          🙂 Head parallax
        </Toggle>
        <Toggle on={modes.gestures} onClick={() => setMode('gestures')} title="Control the graph with your hands">
          ✋ Hand magic
        </Toggle>
        <span className="divider" />
        <Toggle on={layout === 'layers'} onClick={() => setLayout('layers')}>
          ➡️ Path
        </Toggle>
        <Toggle on={layout === 'constellation'} onClick={() => setLayout('constellation')}>
          🌌 Constellation
        </Toggle>
        <span className="divider" />
        <Toggle on={modes.autoSpin} onClick={() => setMode('autoSpin')}>
          💫 Drift
        </Toggle>
      </nav>
    </div>
  )
}

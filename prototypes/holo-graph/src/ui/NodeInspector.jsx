import { TYPE_STYLE } from '../theme.js'

const show = (v) => (Array.isArray(v) ? v.join(', ') || '—' : v === null ? '—' : String(v))

export default function NodeInspector({ node, graph, issues, onClose, onSelectNode, onSelectIssue }) {
  if (!node) return null
  const style = TYPE_STYLE[node.type]
  const links = [
    ...graph.outgoing(node.id).map((e) => ({ id: e.to, rel: e.rel, dir: '→' })),
    ...graph.incoming(node.id).map((e) => ({ id: e.from, rel: e.rel, dir: '←' })),
  ]
  const involved = issues.filter((i) => i.nodeIds.includes(node.id))

  return (
    <aside className="glass panel inspector">
      <header className="panel-head">
        <div className="badge" style={{ background: style.color }}>
          {style.emoji}
        </div>
        <div>
          <h2>{node.name}</h2>
          <span className="muted">{style.label}</span>
        </div>
        <button className="close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>
      <dl className="props">
        {Object.entries(node.props ?? {}).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{show(v)}</dd>
          </div>
        ))}
      </dl>
      {links.length > 0 && (
        <>
          <h3>Connections</h3>
          <ul className="links">
            {links.map((l) => (
              <li key={l.dir + l.id + l.rel}>
                <button onClick={() => onSelectNode(l.id)}>
                  <span className="muted">
                    {l.dir} {l.rel.replace('_', ' ')}
                  </span>{' '}
                  {graph.nodes.get(l.id).name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {involved.length > 0 && (
        <>
          <h3>Part of</h3>
          <ul className="links">
            {involved.map((i) => (
              <li key={i.id}>
                <button onClick={() => onSelectIssue(i.id)}>✨ {i.title}</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}

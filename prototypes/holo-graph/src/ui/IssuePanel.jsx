import { SEVERITY_STYLE, TYPE_STYLE } from '../theme.js'

export function SeverityChip({ severity }) {
  const s = SEVERITY_STYLE[severity]
  return (
    <span className="chip" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

export default function IssuePanel({ issues, nodes, selectedId, onSelect, onSelectNode }) {
  return (
    <aside className="glass panel issues">
      <header className="panel-head">
        <h2>Issues</h2>
        <span className="muted">{issues.length} found by the rule engine</span>
      </header>
      <ul className="issue-list">
        {issues.map((issue) => {
          const open = issue.id === selectedId
          return (
            <li key={issue.id} className={`issue ${open ? 'open' : ''}`}>
              <button className="issue-head" onClick={() => onSelect(open ? null : issue.id)} aria-expanded={open}>
                <SeverityChip severity={issue.severity} />
                <span className="issue-title">{issue.title}</span>
              </button>
              {open && (
                <div className="issue-body">
                  <p className="rule">✨ {issue.rule}</p>
                  <p>{issue.description}</p>
                  <h3>Path</h3>
                  <ol className="path">
                    {issue.nodeIds.map((id) => {
                      const n = nodes.get(id)
                      return (
                        <li key={id}>
                          <button onClick={() => onSelectNode(id)}>
                            <span>{TYPE_STYLE[n.type].emoji}</span> {n.name}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                  <h3>Suggested fixes</h3>
                  <ul className="fixes">
                    {issue.remediation.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

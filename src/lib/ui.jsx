import { Link } from 'react-router-dom';
import { STATUS } from './config.js';

export function Alert({ type = 'error', children }) {
  return children ? <div className={'alert ' + type}>{children}</div> : null;
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function StatusBadge({ status }) {
  return <span className={'badge ' + status}>{STATUS[status] || status}</span>;
}

// state = result of useAsync; children(data) renders the loaded data.
export function Async({ state, children }) {
  if (state.loading && !state.data) return <p className="muted">Loading…</p>;
  if (state.error) return <Alert>{state.error.message}</Alert>;
  return children(state.data);
}

export function Pager({ page, hasNext, linkFor }) {
  if (page <= 1 && !hasNext) return null;
  return (
    <p className="pager">
      {page > 1 && <Link to={linkFor(page - 1)}>← Newer</Link>}
      {hasNext && <Link to={linkFor(page + 1)}>Older →</Link>}
    </p>
  );
}

// Renders text with blank lines as paragraph breaks (single newlines are kept via CSS .prose p).
export function Paragraphs({ text }) {
  return text
    .split(/\n\s*\n/)
    .filter((s) => s.trim())
    .map((p, i) => <p key={i}>{p}</p>);
}

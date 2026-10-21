import { Link } from 'react-router-dom';
import { DOC_TYPES, STATUS } from './config.js';
import { downloadFile } from './api.js';

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

export function DocList({ docs, enrollmentId, token, onDelete }) {
  if (!docs || !docs.length) return <p className="muted">No documents uploaded yet.</p>;
  return (
    <ul className="docs">
      {docs.map((d) => (
        <li key={d.id}>
          <strong>{DOC_TYPES[d.doc_type] || d.doc_type}</strong> — {d.original_name}{' '}
          <small>({Math.max(1, Math.round(d.size_bytes / 1024))} KB)</small>{' '}
          <button
            className="link"
            onClick={() =>
              downloadFile(`/enrollments/${enrollmentId}/documents/${d.id}`, token, d.original_name).catch((e) => alert(e.message))
            }
          >
            Download
          </button>
          {onDelete && (
            <button className="link danger" onClick={() => onDelete(d)}>Remove</button>
          )}
        </li>
      ))}
    </ul>
  );
}

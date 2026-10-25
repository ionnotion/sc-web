import { useEffect, useState } from 'react';
import { DOC_TYPES } from './config.js';
import { downloadFile, fetchBlob } from './api.js';
import { Alert } from './ui.jsx';

// Loads a protected file with the auth header and exposes it as an object URL (revoked on cleanup).
function useBlobUrl(path, token, enabled = true) {
  const [state, setState] = useState({ url: null, error: '' });
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    let objectUrl = null;
    fetchBlob(path, token).then(
      (blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, error: '' });
      },
      (e) => live && setState({ url: null, error: e.message }),
    );
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, token, enabled]);
  return state;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <div className="modal-bar">
          <strong>{title}</strong>
          <button className="link" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImageThumb({ path, token, name, onOpen }) {
  const { url, error } = useBlobUrl(path, token);
  if (error) return <div className="thumb">Preview unavailable</div>;
  if (!url) return <div className="thumb thumb-loading" />;
  return (
    <button type="button" className="thumb" onClick={() => onOpen(url)} title="Click to enlarge">
      <img src={url} alt={name} />
    </button>
  );
}

function PdfModal({ path, token, title, onClose }) {
  const { url, error } = useBlobUrl(path, token);
  return (
    <Modal title={title} onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      {!error && !url && <p className="muted" style={{ padding: 14 }}>Loading…</p>}
      {url && <iframe className="pdf-frame" src={url} title={title} />}
    </Modal>
  );
}

// Same props as before: docs, enrollmentId, token, onDelete (optional)
export function DocList({ docs, enrollmentId, token, onDelete }) {
  const [viewing, setViewing] = useState(null); // { kind: 'image', url, title } | { kind: 'pdf', path, title }
  if (!docs || !docs.length) return <p className="muted">No documents uploaded yet.</p>;
  const pathOf = (d) => `/enrollments/${enrollmentId}/documents/${d.id}`;

  return (
    <>
      <ul className="doc-grid">
        {docs.map((d) => (
          <li key={d.id} className="doc-card">
            {d.content_type.startsWith('image/') ? (
              <ImageThumb
                path={pathOf(d)}
                token={token}
                name={d.original_name}
                onOpen={(url) => setViewing({ kind: 'image', url, title: d.original_name })}
              />
            ) : (
              <button
                type="button"
                className="thumb pdf"
                onClick={() => setViewing({ kind: 'pdf', path: pathOf(d), title: d.original_name })}
              >
                PDF<small>Click to preview</small>
              </button>
            )}
            <div className="doc-meta">
              <strong>{DOC_TYPES[d.doc_type] || d.doc_type}</strong>
              <span className="muted">{d.original_name} ({Math.max(1, Math.round(d.size_bytes / 1024))} KB)</span>
              <div>
                <button
                  className="link"
                  onClick={() => downloadFile(pathOf(d), token, d.original_name).catch((e) => alert(e.message))}
                >
                  Download
                </button>
                {onDelete && <button className="link danger" onClick={() => onDelete(d)}>Remove</button>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {viewing && viewing.kind === 'image' && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <img className="lightbox-img" src={viewing.url} alt={viewing.title} />
        </Modal>
      )}
      {viewing && viewing.kind === 'pdf' && (
        <PdfModal path={viewing.path} token={token} title={viewing.title} onClose={() => setViewing(null)} />
      )}
    </>
  );
}

// Shows the file the user just picked (before uploading). Images get a preview, other files just their name.
export function FilePreview({ file }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setUrl(null);
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!file) return null;
  return url ? <img className="file-preview" src={url} alt="Selected file preview" /> : <span className="muted">{file.name}</span>;
}

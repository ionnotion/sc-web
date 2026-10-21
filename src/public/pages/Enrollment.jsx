import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { request } from '../../lib/api.js';
import { DOC_TYPES } from '../../lib/config.js';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate } from '../../lib/format.js';
import { Alert, Async, DocList, StatusBadge } from '../../lib/ui.jsx';
import EnrollmentForm from '../../lib/EnrollmentForm.jsx';
import { useAuth } from '../auth.js';

// Route guard: renders nested routes only for logged-in users.
export function RequireAuth() {
  const { user } = useAuth();
  if (user) return <Outlet />;
  return (
    <>
      <h1>Enrollment</h1>
      <Alert type="info">
        Please <Link to="/login?next=/enrollment">log in</Link> or <Link to="/register">create an account</Link> to apply.
      </Alert>
    </>
  );
}

export function EnrollmentList() {
  const { api } = useAuth();
  const years = useAsync(() => request('/academic-years'), []);
  const list = useAsync(() => api('/enrollments?limit=100'), []);
  const open = (years.data || []).filter((y) => y.registration_open);
  return (
    <>
      <h1>Enrollment</h1>
      {open.length > 0 ? (
        <p>
          Registration is open for <strong>{open.map((y) => y.name).join(', ')}</strong>.{' '}
          <Link to="/enrollment/new" className="btn small">New application</Link>
        </p>
      ) : (
        <Alert type="info">Registration is currently closed.</Alert>
      )}
      <h2>My applications</h2>
      <Async state={list}>
        {(rows) =>
          rows && rows.length ? (
            <table className="table">
              <thead><tr><th>Student</th><th>Year</th><th>Level</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.student_name}</td><td>{r.academic_year}</td><td>{r.target_level}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><Link to={'/enrollment/' + r.id}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">You have not submitted any application yet.</p>
          )
        }
      </Async>
    </>
  );
}

export function EnrollmentNew() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const years = useAsync(() => request('/academic-years'), []);
  return (
    <>
      <h1>New application</h1>
      <Async state={years}>
        {(list) => {
          const open = (list || []).filter((y) => y.registration_open);
          if (!open.length) return <Alert type="info">Registration is currently closed.</Alert>;
          return (
            <EnrollmentForm
              years={open}
              submitLabel="Submit application"
              onSubmit={async (body) => {
                const e = await api('/enrollments', { method: 'POST', body });
                navigate('/enrollment/' + e.id);
              }}
            />
          );
        }}
      </Async>
      <p><Link to="/enrollment">← Back</Link></p>
    </>
  );
}

function UploadForm({ id, onDone }) {
  const { api } = useAuth();
  const [type, setType] = useState('birth_certificate');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) { setErr('Choose a file first'); return; }
    setBusy(true);
    setErr('');
    const form = new FormData();
    form.append('doc_type', type);
    form.append('file', file);
    try {
      await api(`/enrollments/${id}/documents`, { method: 'POST', form });
      setFile(null);
      e.target.reset();
      onDone();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  return (
    <form className="form inline" onSubmit={submit}>
      <Alert>{err}</Alert>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0] || null)} />
      <button className="btn small" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      <small className="muted">PDF, JPG or PNG, max 5 MB.</small>
    </form>
  );
}

export function EnrollmentDetail() {
  const { id } = useParams();
  const { api, token } = useAuth();
  const state = useAsync(() => api('/enrollments/' + id), [id]);
  const [editing, setEditing] = useState(false);

  async function removeDoc(d) {
    if (!confirm(`Remove ${d.original_name}?`)) return;
    try {
      await api(`/enrollments/${id}/documents/${d.id}`, { method: 'DELETE' });
      state.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <>
      <p><Link to="/enrollment">← My applications</Link></p>
      <Async state={state}>
        {(e) => {
          if (!e) return null;
          const editable = e.status === 'pending' || e.status === 'needs_revision';
          return (
            <>
              <h1>{e.student_name} <StatusBadge status={e.status} /></h1>
              {e.admin_note && (
                <Alert type={e.status === 'accepted' ? 'success' : 'info'}>
                  <strong>Message from the school:</strong> {e.admin_note}
                </Alert>
              )}
              {e.status === 'needs_revision' && (
                <Alert type="info">Please update your details or documents. The school will review again after you do.</Alert>
              )}
              {editing ? (
                <>
                  <EnrollmentForm
                    initial={e}
                    submitLabel="Save changes"
                    onSubmit={async (body) => {
                      await api('/enrollments/' + id, { method: 'PUT', body });
                      setEditing(false);
                      state.reload();
                    }}
                  />
                  <button className="link" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <dl className="details">
                    <dt>Academic year</dt><dd>{e.academic_year}</dd>
                    <dt>Level</dt><dd>{e.target_level}</dd>
                    <dt>Date of birth</dt><dd>{fmtDate(e.birth_date)} ({e.gender})</dd>
                    <dt>Previous school</dt><dd>{e.previous_school || '—'}</dd>
                    <dt>Parent / guardian</dt><dd>{e.parent_name} · {e.parent_phone}</dd>
                    <dt>Address</dt><dd>{e.address}</dd>
                  </dl>
                  {editable && <button className="btn small secondary" onClick={() => setEditing(true)}>Edit details</button>}
                </>
              )}
              <h2>Documents</h2>
              <DocList docs={e.documents} enrollmentId={id} token={token} onDelete={editable ? removeDoc : null} />
              {editable ? (
                <UploadForm id={id} onDone={state.reload} />
              ) : (
                <p className="muted">This application is being processed, so documents can no longer be changed.</p>
              )}
            </>
          );
        }}
      </Async>
    </>
  );
}

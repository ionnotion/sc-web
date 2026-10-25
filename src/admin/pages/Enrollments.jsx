import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { request } from '../../lib/api.js';
import { STATUS } from '../../lib/config.js';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate, qs } from '../../lib/format.js';
import { Alert, Async, Field, Pager, StatusBadge } from '../../lib/ui.jsx';
import { DocList } from '../../lib/DocList.jsx';
import EnrollmentForm from '../../lib/EnrollmentForm.jsx';
import { useAuth } from '../auth.js';

const PER_PAGE = 20;

export function Enrollments() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status = params.get('status') || '';
  const year = params.get('year') || '';
  const page = Number(params.get('page') || 1);
  const years = useAsync(() => request('/academic-years'), []);
  const state = useAsync(
    () => api('/admin/enrollments' + qs({ limit: PER_PAGE, page, status, academic_year_id: year })),
    [status, year, page],
  );
  const filter = (patch) => navigate('/enrollments' + qs({ status, year, ...patch }));

  return (
    <>
      <h1>Enrollments</h1>
      <div className="filters-bar">
        <select value={status} onChange={(e) => filter({ status: e.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={year} onChange={(e) => filter({ year: e.target.value })}>
          <option value="">All academic years</option>
          {(years.data || []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>
      <Async state={state}>
        {(rows) => (
          <>
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Applicant</th><th>Year</th><th>Level</th><th>Status</th><th>Submitted</th><th></th></tr>
              </thead>
              <tbody>
                {(rows || []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.student_name}</td><td>{r.applicant_name}</td><td>{r.academic_year}</td><td>{r.target_level}</td>
                    <td><StatusBadge status={r.status} /></td><td>{fmtDate(r.created_at)}</td>
                    <td><Link to={'/enrollments/' + r.id}>Review</Link></td>
                  </tr>
                ))}
                {rows && !rows.length && <tr><td colSpan="7" className="muted">No applications match.</td></tr>}
              </tbody>
            </table>
            <Pager page={page} hasNext={!!rows && rows.length === PER_PAGE} linkFor={(n) => '/enrollments' + qs({ status, year, page: n })} />
          </>
        )}
      </Async>
    </>
  );
}

function StatusForm({ e, onDone }) {
  const { api } = useAuth();
  const [status, setStatus] = useState(e.status);
  const [note, setNote] = useState(e.admin_note || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(ev) {
    ev.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api(`/admin/enrollments/${e.id}/status`, { method: 'PATCH', body: { status, note } });
      onDone();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h3>Update status</h3>
      <Alert>{err}</Alert>
      <Field label="Status">
        <select value={status} onChange={(ev) => setStatus(ev.target.value)}>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field label="Note to the applicant (required for 'Needs revision' and 'Rejected')">
        <textarea rows="3" value={note} onChange={(ev) => setNote(ev.target.value)} />
      </Field>
      <button className="btn small" disabled={busy}>{busy ? 'Saving…' : 'Update status'}</button>
    </form>
  );
}

export function EnrollmentDetail() {
  const { id } = useParams();
  const { api, token } = useAuth();
  const navigate = useNavigate();
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
  async function removeAll(e) {
    if (!confirm(`Delete the application of ${e.student_name} and all its documents? This cannot be undone.`)) return;
    try {
      await api('/admin/enrollments/' + id, { method: 'DELETE' });
      navigate('/enrollments');
    } catch (x) {
      alert(x.message);
    }
  }

  return (
    <>
      <p><Link to="/enrollments">← All enrollments</Link></p>
      <Async state={state}>
        {(e) =>
          e && (
            <>
              <h1>{e.student_name} <StatusBadge status={e.status} /></h1>
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
                    <dt>Applicant account</dt><dd>{e.applicant_name}</dd>
                    <dt>Academic year</dt><dd>{e.academic_year}</dd>
                    <dt>Level</dt><dd>{e.target_level}</dd>
                    <dt>Date of birth</dt><dd>{fmtDate(e.birth_date)} ({e.gender})</dd>
                    <dt>Previous school</dt><dd>{e.previous_school || '—'}</dd>
                    <dt>Parent / guardian</dt><dd>{e.parent_name} · {e.parent_phone}</dd>
                    <dt>Address</dt><dd>{e.address}</dd>
                    <dt>Submitted</dt><dd>{fmtDate(e.created_at)}</dd>
                  </dl>
                  <button className="btn small secondary" onClick={() => setEditing(true)}>Edit details</button>
                </>
              )}
              <h2>Documents</h2>
              <DocList docs={e.documents} enrollmentId={id} token={token} onDelete={removeDoc} />
              <StatusForm key={e.status + e.updated_at} e={e} onDone={state.reload} />
              <p><button className="link danger" onClick={() => removeAll(e)}>Delete this application</button></p>
            </>
          )
        }
      </Async>
    </>
  );
}

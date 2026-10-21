import { useState } from 'react';
import { request } from '../../lib/api.js';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate } from '../../lib/format.js';
import { Alert, Async, Field } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

function YearForm({ initial, onDone, onCancel }) {
  const { api } = useAuth();
  const [f, setF] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api(f.id ? '/admin/academic-years/' + f.id : '/admin/academic-years', { method: f.id ? 'PUT' : 'POST', body: f });
      onDone();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <form className="form card" onSubmit={submit}>
      <Alert>{err}</Alert>
      <div className="grid2">
        <Field label="Name (e.g. 2026/2027)"><input value={f.name} onChange={set('name')} required /></Field>
        <span />
        <Field label="Start date"><input type="date" value={f.start_date} onChange={set('start_date')} required /></Field>
        <Field label="End date"><input type="date" value={f.end_date} onChange={set('end_date')} required /></Field>
      </div>
      <label className="check">
        <input type="checkbox" checked={f.registration_open} onChange={set('registration_open')} /> Registration open
      </label>
      <div>
        <button className="btn small" disabled={busy}>Save</button>{' '}
        <button type="button" className="btn small secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function Years() {
  const { api } = useAuth();
  const state = useAsync(() => request('/academic-years'), []);
  const [editing, setEditing] = useState(null); // null | 'new' | year
  const blank = { name: '', start_date: '', end_date: '', registration_open: false };

  async function toggle(y) {
    try {
      await api('/admin/academic-years/' + y.id, { method: 'PUT', body: { ...y, registration_open: !y.registration_open } });
      state.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <>
      <div className="bar">
        <h1>Academic years</h1>
        <button className="btn small" onClick={() => setEditing('new')}>New academic year</button>
      </div>
      {editing && (
        <YearForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? blank : editing}
          onDone={() => { setEditing(null); state.reload(); }}
          onCancel={() => setEditing(null)}
        />
      )}
      <Async state={state}>
        {(rows) => (
          <table className="table">
            <thead><tr><th>Name</th><th>Period</th><th>Registration</th><th></th></tr></thead>
            <tbody>
              {(rows || []).map((y) => (
                <tr key={y.id}>
                  <td>{y.name}</td>
                  <td>{fmtDate(y.start_date)} – {fmtDate(y.end_date)}</td>
                  <td><span className={'badge ' + (y.registration_open ? 'accepted' : 'rejected')}>{y.registration_open ? 'Open' : 'Closed'}</span></td>
                  <td className="actions">
                    <button className="link" onClick={() => toggle(y)}>{y.registration_open ? 'Close registration' : 'Open registration'}</button>
                    <button className="link" onClick={() => setEditing(y)}>Edit</button>
                  </td>
                </tr>
              ))}
              {rows && !rows.length && (
                <tr><td colSpan="4" className="muted">No academic years yet. Create one to start accepting applications.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Async>
    </>
  );
}

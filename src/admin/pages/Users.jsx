import { useState } from 'react';
import { ROLES } from '../../lib/config.js';
import { useAsync } from '../../lib/hooks.js';
import { qs } from '../../lib/format.js';
import { Alert, Async, Field } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

const ADMIN_ROLES = ['news_admin', 'enrollment_admin', 'super_admin'];

function AdminCreateForm({ onDone }) {
  const { api } = useAuth();
  const empty = { first_name: '', last_name: '', email: '', phone: '', password: '', role: 'news_admin' };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/admin/users', { method: 'POST', body: f });
      setF({ ...empty, role: f.role });
      onDone();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h3>Register a new admin</h3>
      <Alert>{err}</Alert>
      <div className="grid2">
        <Field label="First name"><input value={f.first_name} onChange={set('first_name')} required /></Field>
        <Field label="Last name"><input value={f.last_name} onChange={set('last_name')} required /></Field>
        <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Temporary password (8+ chars)">
          <input type="password" minLength="8" maxLength="72" value={f.password} onChange={set('password')} required />
        </Field>
        <Field label="Role">
          <select value={f.role} onChange={set('role')}>
            {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ROLES[r]}</option>)}
          </select>
        </Field>
      </div>
      <button className="btn small" disabled={busy}>{busy ? 'Creating…' : 'Create admin'}</button>
    </form>
  );
}

export default function Users() {
  const { api, user: me } = useAuth();
  const [role, setRole] = useState('');
  const state = useAsync(() => api('/admin/users' + qs({ limit: 100, role })), [role]);

  async function patch(u, body) {
    try {
      await api('/admin/users/' + u.id, { method: 'PATCH', body });
      state.reload();
    } catch (e) {
      alert(e.message);
    }
  }
  async function remove(u) {
    if (!confirm(`Delete ${u.email}? If they have posts or applications, deactivate instead.`)) return;
    try {
      await api('/admin/users/' + u.id, { method: 'DELETE' });
      state.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <>
      <h1>Users &amp; admins</h1>
      <AdminCreateForm onDone={state.reload} />
      <div className="filters-bar">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <Async state={state}>
        {(rows) => (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {(rows || []).map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>{u.first_name + " " + u.last_name}{self && <small className="muted"> (you)</small>}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} disabled={self} onChange={(e) => patch(u, { role: e.target.value })}>
                        {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td><span className={'badge ' + (u.is_active ? 'accepted' : 'rejected')}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                    <td className="actions">
                      <button className="link" disabled={self} onClick={() => patch(u, { is_active: !u.is_active })}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="link danger" disabled={self} onClick={() => remove(u)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Async>
    </>
  );
}

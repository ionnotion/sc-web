import { useState } from 'react';
import { request } from '../../lib/api.js';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate } from '../../lib/format.js';
import { Alert, Async, Field } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

function ProfileFormInner({ initial }) {
  const { api } = useAuth();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState(null); // { type, text }
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setMsg(null); };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/profile', { method: 'PUT', body: f });
      setMsg({ type: 'success', text: 'Saved. The public About us and Contact pages now show this content.' });
    } catch (x) {
      setMsg({ type: 'error', text: x.message });
    }
    setBusy(false);
  }

  return (
    <form className="form" onSubmit={submit}>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <Field label="About us"><textarea rows="8" maxLength="5000" value={f.about_us} onChange={set('about_us')} /></Field>
      <Field label="Vision"><textarea rows="4" maxLength="5000" value={f.vision} onChange={set('vision')} /></Field>
      <Field label="Mission"><textarea rows="6" maxLength="5000" value={f.mission} onChange={set('mission')} /></Field>
      <h2>Contact details</h2>
      <Field label="Address"><textarea rows="2" maxLength="500" value={f.address} onChange={set('address')} /></Field>
      <div className="grid2">
        <Field label="Phone"><input maxLength="50" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input type="email" maxLength="254" value={f.email} onChange={set('email')} /></Field>
      </div>
      <div>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>{' '}
        <a href="/about" target="_blank" rel="noreferrer" className="btn secondary">View About page</a>
      </div>
    </form>
  );
}

export default function Profile() {
  const state = useAsync(() => request('/profile'), []);
  return (
    <>
      <h1>School profile</h1>
      <p className="muted">
        Shown on the public About us and Contact pages. A blank line starts a new paragraph.
        {state.data && state.data.updated_at && <> Last saved {fmtDate(state.data.updated_at)}.</>}
      </p>
      <Async state={state}>
        {(p) => (
          <ProfileFormInner
            initial={{
              about_us: p.about_us || '', vision: p.vision || '', mission: p.mission || '',
              address: p.address || '', phone: p.phone || '', email: p.email || '',
            }}
          />
        )}
      </Async>
    </>
  );
}

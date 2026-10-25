import { useState } from 'react';
import { SITE } from '../../lib/config.js';
import ThemeToggle from '../../lib/ThemeToggle.jsx';
import { Alert, Field } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

// There is deliberately no admin sign-up: only a super admin creates admin accounts (Users & admins page).
export default function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(f.email, f.password);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <>
    <div className="login-theme"><ThemeToggle /></div>
    <form className="form narrow login-box" onSubmit={submit}>
      <h1>{SITE.name} admin</h1>
      <Alert>{err}</Alert>
      <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
      <Field label="Password"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></Field>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
      <p className="muted">Admin accounts are created by a super admin.</p>
    </form>
    </>
  );
}

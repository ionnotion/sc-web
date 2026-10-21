import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Field } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register(f);
      navigate('/enrollment');
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Create an account</h1>
      <Alert>{err}</Alert>
      <Field label="Full name"><input value={f.full_name} onChange={set('full_name')} required /></Field>
      <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required /></Field>
      <Field label="Phone"><input value={f.phone} onChange={set('phone')} /></Field>
      <Field label="Password (8+ characters)">
        <input type="password" minLength="8" maxLength="72" value={f.password} onChange={set('password')} required />
      </Field>
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(f.email, f.password);
      const next = params.get('next');
      navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/enrollment');
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Log in</h1>
      <Alert>{err}</Alert>
      <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
      <Field label="Password"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></Field>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
      <p className="muted">No account yet? <Link to="/register">Register</Link></p>
    </form>
  );
}

import { useState } from 'react';
import { Alert, Field } from './ui.jsx';

// Used by the public app (apply / edit) and the admin app (edit). Pass `years` only when creating.
export default function EnrollmentForm({ initial, years, onSubmit, submitLabel = 'Save' }) {
  const [f, setF] = useState(
    initial || {
      academic_year_id: years && years[0] ? years[0].id : '',
      student_name: '', birth_date: '', gender: 'male', previous_school: '',
      target_level: '', parent_name: '', parent_phone: '', address: '',
    },
  );
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try { await onSubmit(f); } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  return (
    <form className="form" onSubmit={submit}>
      <Alert>{err}</Alert>
      {years && (
        <Field label="Academic year">
          <select value={f.academic_year_id} onChange={set('academic_year_id')} required>
            {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </Field>
      )}
      <div className="grid2">
        <Field label="Student full name"><input value={f.student_name} onChange={set('student_name')} required /></Field>
        <Field label="Date of birth"><input type="date" value={f.birth_date} onChange={set('birth_date')} required /></Field>
        <Field label="Gender">
          <select value={f.gender} onChange={set('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Level applying for"><input value={f.target_level} onChange={set('target_level')} placeholder="e.g. Grade 1" required /></Field>
        <Field label="Previous school (optional)"><input value={f.previous_school} onChange={set('previous_school')} /></Field>
        <Field label="Parent / guardian name"><input value={f.parent_name} onChange={set('parent_name')} required /></Field>
        <Field label="Parent phone"><input value={f.parent_phone} onChange={set('parent_phone')} required /></Field>
      </div>
      <Field label="Home address"><textarea rows="3" value={f.address} onChange={set('address')} required /></Field>
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  );
}

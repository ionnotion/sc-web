import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate, qs } from '../../lib/format.js';
import { Alert, Async, Field, Pager } from '../../lib/ui.jsx';
import { useAuth } from '../auth.js';

const PER_PAGE = 15;

export function NewsList() {
  const { api } = useAuth();
  const [params] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const state = useAsync(() => api(`/admin/news?limit=${PER_PAGE}&page=${page}`), [page]);

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await api('/admin/news/' + p.id, { method: 'DELETE' });
      state.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <>
      <div className="bar"><h1>News &amp; announcements</h1><Link to="/news/new" className="btn small">New post</Link></div>
      <Async state={state}>
        {(rows) => (
          <>
            <table className="table">
              <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Published</th><th></th></tr></thead>
              <tbody>
                {(rows || []).map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.type}</td>
                    <td><span className={'badge ' + (p.is_published ? 'accepted' : 'pending')}>{p.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>{fmtDate(p.published_at)}</td>
                    <td className="actions">
                      <Link to={`/news/${p.id}/edit`}>Edit</Link>
                      <button className="link danger" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {rows && !rows.length && <tr><td colSpan="5" className="muted">No posts yet.</td></tr>}
              </tbody>
            </table>
            <Pager page={page} hasNext={!!rows && rows.length === PER_PAGE} linkFor={(n) => '/news' + qs({ page: n })} />
          </>
        )}
      </Async>
    </>
  );
}

function PostFormInner({ id, initial }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api(id ? '/admin/news/' + id : '/admin/news', { method: id ? 'PUT' : 'POST', body: f });
      navigate('/news');
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <Alert>{err}</Alert>
      <div className="grid2">
        <Field label="Type">
          <select value={f.type} onChange={set('type')}>
            <option value="news">News</option>
            <option value="announcement">Announcement</option>
          </select>
        </Field>
        <Field label="Title"><input value={f.title} onChange={set('title')} required /></Field>
      </div>
      <Field label="Short excerpt (shown in lists)"><input value={f.excerpt} onChange={set('excerpt')} /></Field>
      <Field label="Body (blank line = new paragraph)"><textarea rows="12" value={f.body} onChange={set('body')} required /></Field>
      <label className="check">
        <input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published (visible on the public site)
      </label>
      <div>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>{' '}
        <Link to="/news" className="btn secondary">Cancel</Link>
      </div>
    </form>
  );
}

// Handles both /news/new and /news/:id/edit
export function PostForm() {
  const { id } = useParams();
  const { api } = useAuth();
  const state = useAsync(() => (id ? api('/admin/news/' + id) : Promise.resolve(null)), [id]);
  const blank = { type: 'news', title: '', excerpt: '', body: '', is_published: false };
  return (
    <>
      <h1>{id ? 'Edit post' : 'New post'}</h1>
      <Async state={state}>{(p) => <PostFormInner key={id || 'new'} id={id} initial={p || blank} />}</Async>
    </>
  );
}

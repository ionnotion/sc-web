import { Link, useParams, useSearchParams } from 'react-router-dom';
import { request } from '../../lib/api.js';
import { useAsync } from '../../lib/hooks.js';
import { fmtDate, qs } from '../../lib/format.js';
import { Async, Pager } from '../../lib/ui.jsx';
import PostCard from './PostCard.jsx';

const PER_PAGE = 6;

export function News() {
  const [params] = useSearchParams();
  const type = params.get('type') || '';
  const page = Number(params.get('page') || 1);
  const state = useAsync(() => request('/news' + qs({ limit: PER_PAGE, page, type })), [type, page]);
  const cls = (active) => (active ? 'active' : '');
  return (
    <>
      <h1>News &amp; announcements</h1>
      <p className="filters">
        <Link to="/news" className={cls(!type)}>All</Link>{' '}
        <Link to={'/news' + qs({ type: 'news' })} className={cls(type === 'news')}>News</Link>{' '}
        <Link to={'/news' + qs({ type: 'announcement' })} className={cls(type === 'announcement')}>Announcements</Link>
      </p>
      <Async state={state}>
        {(list) => (
          <>
            {list && list.length ? list.map((p) => <PostCard key={p.id} p={p} />) : <p className="muted">Nothing here yet.</p>}
            <Pager page={page} hasNext={!!list && list.length === PER_PAGE} linkFor={(n) => '/news' + qs({ type, page: n })} />
          </>
        )}
      </Async>
    </>
  );
}

export function NewsDetail() {
  const { slug } = useParams();
  const state = useAsync(() => request('/news/' + slug), [slug]);
  return (
    <Async state={state}>
      {(p) =>
        p && (
          <article>
            <span className="tag">{p.type}</span>
            <h1>{p.title}</h1>
            <small>{fmtDate(p.published_at)} · {p.author}</small>
            {p.body.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            <p><Link to="/news">← Back to news</Link></p>
          </article>
        )
      }
    </Async>
  );
}

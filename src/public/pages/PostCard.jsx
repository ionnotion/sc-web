import { Link } from 'react-router-dom';
import { fmtDate } from '../../lib/format.js';

export default function PostCard({ p }) {
  return (
    <article className="card">
      <span className="tag">{p.type}</span>
      <h3><Link to={'/news/' + p.slug}>{p.title}</Link></h3>
      <p>{p.excerpt}</p>
      <small>{fmtDate(p.published_at)}</small>
    </article>
  );
}

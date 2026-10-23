import { Link } from 'react-router-dom';
import { ENROLLMENT_ROLES, NEWS_ROLES, ROLES } from '../../lib/config.js';
import { useAsync } from '../../lib/hooks.js';
import { useAuth } from '../auth.js';

export default function Overview() {
  const { user, api } = useAuth();
  const isEnr = ENROLLMENT_ROLES.includes(user.role);
  const isNews = NEWS_ROLES.includes(user.role);
  const none = () => Promise.resolve(null);
  const pending = useAsync(() => (isEnr ? api('/admin/enrollments?status=pending&limit=100') : none()), []);
  const review = useAsync(() => (isEnr ? api('/admin/enrollments?status=under_review&limit=100') : none()), []);
  const posts = useAsync(() => (isNews ? api('/admin/news?limit=100') : none()), []);
  const count = (s) => (s.data ? (s.data.length >= 100 ? '100+' : s.data.length) : '…');

  return (
    <>
      <h1>Welcome, {user.fiirst_name}</h1>
      <p className="muted">Signed in as {ROLES[user.role]}.</p>
      <div className="stats">
        {isEnr && <Link to="/enrollments?status=pending" className="stat"><b>{count(pending)}</b><span>Pending applications</span></Link>}
        {isEnr && <Link to="/enrollments?status=under_review" className="stat"><b>{count(review)}</b><span>Under review</span></Link>}
        {isNews && (
          <Link to="/news" className="stat">
            <b>{posts.data ? posts.data.filter((p) => !p.is_published).length : '…'}</b>
            <span>Draft posts</span>
          </Link>
        )}
      </div>
    </>
  );
}

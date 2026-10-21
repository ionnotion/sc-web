import { Link } from 'react-router-dom';
import { SITE } from '../../lib/config.js';
import { request } from '../../lib/api.js';
import { useAsync } from '../../lib/hooks.js';
import { Async } from '../../lib/ui.jsx';
import PostCard from './PostCard.jsx';

export function Home() {
  const posts = useAsync(() => request('/news?limit=3'), []);
  const years = useAsync(() => request('/academic-years'), []);
  const open = (years.data || []).filter((y) => y.registration_open);
  return (
    <>
      <section className="hero">
        <h1>Welcome to {SITE.name}</h1>
        <p>{SITE.tagline}</p>
        {open.length > 0 ? (
          <p><Link to="/enrollment" className="btn">Enroll for {open[0].name}</Link></p>
        ) : (
          <p className="muted">Enrollment is currently closed. Watch our announcements for the next intake.</p>
        )}
      </section>
      <h2>Latest news &amp; announcements</h2>
      <Async state={posts}>
        {(list) => (list && list.length ? list.map((p) => <PostCard key={p.id} p={p} />) : <p className="muted">No posts yet.</p>)}
      </Async>
      <p><Link to="/news">All news →</Link></p>
    </>
  );
}

export function About() {
  return (
    <>
      <h1>About us</h1>
      <p>Replace this text with your school's story, vision and mission.</p>
      <h2>Vision</h2>
      <p>Your vision statement.</p>
      <h2>Mission</h2>
      <p>Your mission statement.</p>
      <h2>Programs</h2>
      <p>Describe your levels and programs.</p>
    </>
  );
}

export function Contact() {
  return (
    <>
      <h1>Contact</h1>
      <dl>
        <dt>Address</dt><dd>{SITE.address}</dd>
        <dt>Phone</dt><dd>{SITE.phone}</dd>
        <dt>Email</dt><dd><a href={'mailto:' + SITE.email}>{SITE.email}</a></dd>
      </dl>
    </>
  );
}

export function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p><Link to="/">Go home</Link></p>
    </>
  );
}

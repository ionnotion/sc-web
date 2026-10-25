import { Link } from 'react-router-dom';
import { SITE } from '../../lib/config.js';
import { request } from '../../lib/api.js';
import { useAsync } from '../../lib/hooks.js';
import { useProfile } from '../../lib/profile.js';
import { Async, Paragraphs } from '../../lib/ui.jsx';
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
  const state = useProfile();
  return (
    <Async state={state}>
      {() => {
        const p = state.profile;
        return (
          <div className="prose">
            <h1>About us</h1>
            {p.about_us ? <Paragraphs text={p.about_us} /> : <p className="muted">This page has not been filled in yet.</p>}
            {p.vision && (<><h2>Vision</h2><Paragraphs text={p.vision} /></>)}
            {p.mission && (<><h2>Mission</h2><Paragraphs text={p.mission} /></>)}
          </div>
        );
      }}
    </Async>
  );
}

export function Contact() {
  const state = useProfile();
  return (
    <Async state={state}>
      {() => {
        const p = state.profile;
        return (
          <>
            <h1>Contact</h1>
            <dl className="prose">
              {p.address && (<><dt>Address</dt><dd><p>{p.address}</p></dd></>)}
              {p.phone && (<><dt>Phone</dt><dd>{p.phone}</dd></>)}
              {p.email && (<><dt>Email</dt><dd><a href={'mailto:' + p.email}>{p.email}</a></dd></>)}
            </dl>
          </>
        );
      }}
    </Async>
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

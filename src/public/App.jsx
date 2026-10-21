import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { SITE } from '../lib/config.js';
import { useAuth } from './auth.js';
import { About, Contact, Home, NotFound } from './pages/Static.jsx';
import { News, NewsDetail } from './pages/News.jsx';
import { Login, Register } from './pages/Account.jsx';
import { EnrollmentDetail, EnrollmentList, EnrollmentNew, RequireAuth } from './pages/Enrollment.jsx';

function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="top">
        <Link to="/" className="brand">{SITE.name}</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About us</NavLink>
          <NavLink to="/news">News</NavLink>
          <NavLink to="/enrollment">Enrollment</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user ? (
            <>
              <span className="muted">{user.full_name}</span>
              <button className="link" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn small">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main><Outlet /></main>
      <footer>© {new Date().getFullYear()} {SITE.name}</footer>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="enrollment" element={<RequireAuth />}>
          <Route index element={<EnrollmentList />} />
          <Route path="new" element={<EnrollmentNew />} />
          <Route path=":id" element={<EnrollmentDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

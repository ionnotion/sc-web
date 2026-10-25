import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { ENROLLMENT_ROLES, NEWS_ROLES, ROLES, SITE, SUPER_ROLES } from '../lib/config.js';
import { Alert } from '../lib/ui.jsx';
import { useAuth } from './auth.js';
import Login from './pages/Login.jsx';
import Overview from './pages/Overview.jsx';
import { NewsList, PostForm } from './pages/News.jsx';
import Years from './pages/Years.jsx';
import { EnrollmentDetail, Enrollments } from './pages/Enrollments.jsx';
import Users from './pages/Users.jsx';
import Profile from './pages/Profile.jsx';

const NAV = [
  { to: '/', label: 'Overview', roles: null, end: true },
  { to: '/news', label: 'News & announcements', roles: NEWS_ROLES },
  { to: '/years', label: 'Academic years', roles: ENROLLMENT_ROLES },
  { to: '/enrollments', label: 'Enrollments', roles: ENROLLMENT_ROLES },
  { to: '/users', label: 'Users & admins', roles: SUPER_ROLES },
  { to: '/profile', label: 'School profile', roles: SUPER_ROLES },
];

function Shell() {
  const { user, logout } = useAuth();
  return (
    <div className="admin">
      <aside className="side">
        <div className="brand">{SITE.name}<small>Admin</small></div>
        <nav>
          {NAV.filter((n) => !n.roles || n.roles.includes(user.role)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="who">
          <div>{user.first_name + " " + user.last_name}</div>
          <small>{ROLES[user.role]}</small>
          <div><button className="link" onClick={logout}>Log out</button></div>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}

// Nested-route guard. (The API enforces the same roles; this only hides what you can't use.)
function RoleGate({ roles }) {
  const { user } = useAuth();
  if (roles.includes(user.role)) return <Outlet />;
  return <Alert>You do not have permission to view this page.</Alert>;
}

export default function App() {
  const { user, logout } = useAuth();
  if (!user) return <Login />;
  if (user.role === 'user') {
    return (
      <div className="form narrow login-box">
        <h1>No admin access</h1>
        <p>This account is a regular user account. Ask a super admin for an admin role.</p>
        <button className="btn" onClick={logout}>Log out</button>
      </div>
    );
  }
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
        <Route element={<RoleGate roles={NEWS_ROLES} />}>
          <Route path="news" element={<NewsList />} />
          <Route path="news/new" element={<PostForm />} />
          <Route path="news/:id/edit" element={<PostForm />} />
        </Route>
        <Route element={<RoleGate roles={ENROLLMENT_ROLES} />}>
          <Route path="years" element={<Years />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="enrollments/:id" element={<EnrollmentDetail />} />
        </Route>
        <Route element={<RoleGate roles={SUPER_ROLES} />}>
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
    </Routes>
  );
}

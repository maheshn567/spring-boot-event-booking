import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../ui/Feedback';
import { PUBLIC_URL } from '../lib/sites';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/events', label: 'Events' },
  { to: '/bookings', label: 'Bookings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/signin');
    showToast(200, 'Signed out');
  };

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="brand-mark" />Turnstile<span className="admin-tag">Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `admin-nav-btn ${isActive ? 'active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <span className="admin-email">{user?.email}</span>
          <a href={PUBLIC_URL} className="admin-link">View public site ↗</a>
          <button className="admin-link admin-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../ui/Feedback';

export default function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/');
    showToast(200, 'Signed out');
  };

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        Turnstile
      </Link>
      <nav className="site-nav">
        <Link to="/events" className="nav-btn">Events</Link>
        <Link to="/bookings" className="nav-btn">My bookings</Link>
        {user ? (
          <>
            <div className="nav-user">
              <span className="nav-user-label">Signed in</span>
              <span className="nav-user-email">{user.email}</span>
            </div>
            <button className="nav-btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="nav-btn">Sign in</Link>
            <Link to="/signup" className="nav-btn nav-btn-red">Sign up →</Link>
          </>
        )}
      </nav>
    </header>
  );
}

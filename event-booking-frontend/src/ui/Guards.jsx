import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Signed-in users only; otherwise go to sign in and come back after
export function RequireUser({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user || !isAdmin) return <Navigate to="/signin" replace />;
  return children;
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

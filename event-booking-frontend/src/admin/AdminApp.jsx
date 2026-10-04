import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, ScrollToTop } from '../ui/Guards';
import AuthPage from '../ui/AuthPage';
import AdminLayout from './AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminEventForm from './pages/AdminEventForm';
import AdminBookings from './pages/AdminBookings';

// Organizer console (admin.localhost:5173)
export default function AdminApp() {
  useEffect(() => {
    document.title = 'Turnstile Admin';
  }, []);

  return (
    <div className="app">
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<AuthPage mode="admin" />} />
        <Route path="/" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/new" element={<AdminEventForm key="new" />} />
          <Route path="events/:id/edit" element={<AdminEventForm key="edit" />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

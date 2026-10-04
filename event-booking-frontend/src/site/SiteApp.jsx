import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './Header';
import { RequireUser, ScrollToTop } from '../ui/Guards';
import AuthPage from '../ui/AuthPage';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyBookings from './pages/MyBookings';

// Public website (localhost:5173)
export default function SiteApp() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/bookings" element={<RequireUser><MyBookings /></RequireUser>} />
        <Route path="/signin" element={<AuthPage key="signin" mode="signin" />} />
        <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

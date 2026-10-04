import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../api/endpoints';
import { useFeedback } from '../../ui/Feedback';
import ErrorBanner from '../../ui/ErrorBanner';
import { bookingRef, fmtShort, fmtStamp, isPast, usd } from '../../lib/format';

const PAGE_SIZE = 20;

export default function MyBookings() {
  const { showToast, confirm } = useFeedback();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reload everything shown so far (keeps the list in sync after a cancel)
  const load = useCallback(async (size = PAGE_SIZE) => {
    try {
      const res = await bookingsApi.mine({ size });
      setBookings(res.content);
      setPage(res.page);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (b) => {
    const ok = await confirm({
      title: 'Cancel this booking?',
      body: `Your ticket for ${b.eventTitle} goes back on sale.`,
      cta: 'Cancel booking',
    });
    if (!ok) return;
    try {
      await bookingsApi.cancel(b.id);
      showToast(200, 'Booking cancelled');
      load(Math.max(bookings.length, PAGE_SIZE));
    } catch (err) {
      showToast(err.status, err.message);
    }
  };

  const hasMore = page && bookings.length < page.totalElements;

  return (
    <main>
      <div className="page-head">
        <h1 className="h1">My bookings</h1>
        <div className="muted page-sub">Newest first. Cancel any time before the event starts.</div>
      </div>

      {error && <ErrorBanner error={error} className="banner-inset" />}
      {loading && <div className="page-loading">Loading…</div>}

      {bookings.map((b) => {
        const confirmed = b.status === 'CONFIRMED';
        const canCancel = confirmed && !isPast(b.eventDate);
        return (
          <div key={b.id} className="booking-row">
            <button className="booking-row-main" onClick={() => navigate(`/events/${b.eventId}`)}>
              <span className="eyebrow red">{fmtShort(b.eventDate)}</span>
              <span className="booking-row-title">{b.eventTitle}</span>
              <span className="muted small">
                {b.eventLocation} · {usd(b.eventPrice)} · Ref {bookingRef(b.id)} · Booked {fmtStamp(b.bookedAt)}
              </span>
            </button>
            <div className="booking-row-actions">
              {confirmed ? <span className="chip chip-dark">Confirmed</span> : <span className="chip chip-outline">Cancelled</span>}
              {canCancel && <button className="btn btn-outline btn-sm" onClick={() => cancel(b)}>Cancel</button>}
            </div>
          </div>
        );
      })}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty empty-cta">
          <div className="empty-title">No bookings yet.</div>
          <Link to="/events" className="btn btn-red btn-wide">Browse events →</Link>
        </div>
      )}

      {hasMore && (
        <div className="load-more">
          <button className="btn btn-outline" onClick={() => load(bookings.length + PAGE_SIZE)}>Load more</button>
        </div>
      )}
    </main>
  );
}

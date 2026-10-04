import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useFeedback } from '../../ui/Feedback';
import ErrorBanner from '../../ui/ErrorBanner';
import { bookingRef, fmtShort, fmtStamp, isPast } from '../../lib/format';

const PAGE_SIZE = 50;

export default function AdminBookings() {
  const { showToast, confirm } = useFeedback();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback((size = PAGE_SIZE) => {
    adminApi
      .bookings({ size })
      .then((res) => {
        setBookings(res.content);
        setPage(res.page);
      })
      .catch(setError);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (b) => {
    const ok = await confirm({
      title: 'Cancel this booking?',
      body: `${b.userEmail}'s ticket for ${b.eventTitle} goes back on sale.`,
      cta: 'Cancel booking',
    });
    if (!ok) return;
    try {
      await adminApi.cancelBooking(b.id);
      showToast(200, 'Booking cancelled');
      load(Math.max(bookings.length, PAGE_SIZE));
    } catch (err) {
      showToast(err.status, err.message);
    }
  };

  const hasMore = page && bookings.length < page.totalElements;

  return (
    <main>
      <div className="admin-head"><h1 className="h-admin">Bookings</h1></div>
      {error && <ErrorBanner error={error} className="banner-inset" />}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Ref</th><th>User</th><th>Event</th><th>Booked</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const confirmed = b.status === 'CONFIRMED';
              return (
                <tr key={b.id}>
                  <td className="mono">{bookingRef(b.id)}</td>
                  <td>{b.userEmail}</td>
                  <td><div className="semi">{b.eventTitle}</div><div className="muted micro">{fmtShort(b.eventDate)}</div></td>
                  <td className="nowrap">{fmtStamp(b.bookedAt)}</td>
                  <td>{confirmed ? <span className="chip chip-dark">Confirmed</span> : <span className="chip chip-outline">Cancelled</span>}</td>
                  <td className="right">
                    {confirmed && !isPast(b.eventDate) && (
                      <button className="btn btn-outline btn-xs" onClick={() => cancel(b)}>Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {page && bookings.length === 0 && <div className="empty"><div className="empty-title">No bookings yet.</div></div>}
        {hasMore && (
          <div className="load-more">
            <button className="btn btn-outline" onClick={() => load(bookings.length + PAGE_SIZE)}>Load more</button>
          </div>
        )}
      </div>
    </main>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, eventsApi } from '../../api/endpoints';
import { useFeedback } from '../../ui/Feedback';
import ErrorBanner from '../../ui/ErrorBanner';
import { eventView } from '../../lib/format';

export default function AdminEvents() {
  const { showToast, confirm } = useFeedback();
  const navigate = useNavigate();
  const [events, setEvents] = useState(null); // null = still loading
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    eventsApi
      .search({ sort: 'date', size: 100 })
      .then((page) => setEvents(page.content.map(eventView)))
      .catch(setError);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (e) => {
    setError(null);
    const ok = await confirm({
      title: 'Delete event?',
      body: `${e.title} will be removed from the public site.`,
      cta: 'Delete event',
    });
    if (!ok) return;
    try {
      await adminApi.deleteEvent(e.id);
      showToast(204, 'Event deleted');
      load();
    } catch (err) {
      setError(
        err.status === 409
          ? { status: 409, message: `Cannot delete "${e.title}": it has bookings. Edit it instead.` }
          : err,
      );
    }
  };

  return (
    <main>
      <div className="admin-head">
        <h1 className="h-admin">Events</h1>
        <Link to="/events/new" className="btn btn-red btn-mid">+ New event</Link>
      </div>
      {error && <ErrorBanner error={error} className="banner-inset" />}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Event</th><th>Date</th><th>Location</th><th>Sold</th><th>Price</th><th /></tr>
          </thead>
          <tbody>
            {events?.map((e) => (
              <tr key={e.id}>
                <td><div className="semi">{e.title}</div><div className="muted micro">{e.categoryLabel} · {e.statusLabel}</div></td>
                <td className="nowrap">{e.dateShort}</td>
                <td>{e.location}</td>
                <td className="mono">{e.soldLabel}</td>
                <td>{e.priceLabel}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-outline btn-xs" onClick={() => navigate(`/events/${e.id}/edit`)}>Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => remove(e)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events?.length === 0 && <div className="empty"><div className="empty-title">No events yet.</div></div>}
      </div>
    </main>
  );
}

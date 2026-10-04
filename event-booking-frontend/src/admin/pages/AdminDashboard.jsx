import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, eventsApi } from '../../api/endpoints';
import ErrorBanner from '../../ui/ErrorBanner';
import { eventView, nowLocal, usd } from '../../lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.stats(), eventsApi.search({ from: nowLocal(), sort: 'date', size: 20 })])
      .then(([s, page]) => {
        setStats(s);
        setUpcoming(page.content.map(eventView));
      })
      .catch(setError);
  }, []);

  const tiles = stats
    ? [
        { label: 'Upcoming events', value: stats.upcomingEvents },
        { label: 'Tickets sold', value: stats.ticketsSold.toLocaleString('en-US') },
        { label: 'Active bookings', value: stats.activeBookings },
        { label: 'Revenue (tracked)', value: usd(stats.revenue) },
      ]
    : [];

  return (
    <main>
      <div className="admin-head">
        <h1 className="h-admin">Overview</h1>
        <Link to="/events/new" className="btn btn-red btn-mid">+ New event</Link>
      </div>
      {error && <ErrorBanner error={error} className="banner-inset" />}

      <div className="stats">
        {tiles.map((t) => (
          <div key={t.label} className="stat">
            <div className="label">{t.label}</div>
            <div className="stat-value">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-subhead">Upcoming · capacity</div>
      {upcoming.map((e) => (
        <div key={e.id} className="capacity-row">
          <div className="min0">
            <div className="semi">{e.title}</div>
            <div className="muted tiny">{e.dateShort} · {e.location}</div>
          </div>
          <div className="bar"><div className="bar-fill" style={{ width: e.pct }} /></div>
          <div className="mono right">{e.soldLabel}</div>
        </div>
      ))}
      {stats && upcoming.length === 0 && (
        <div className="empty"><div className="empty-title">No upcoming events.</div></div>
      )}
    </main>
  );
}

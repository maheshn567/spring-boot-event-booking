import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookingsApi, eventsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { useFeedback } from '../../ui/Feedback';
import EventImage from '../../ui/EventImage';
import ErrorBanner from '../../ui/ErrorBanner';
import { bookingRef, eventView, imgFor } from '../../lib/format';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast, confirm } = useFeedback();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [myBooking, setMyBooking] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setEvent(eventView(await eventsApi.get(id)));
    } catch (err) {
      if (err.status === 404 || err.status === 400) setNotFound(true);
      else setApiError(err);
      return;
    }
    if (user) {
      // Is this user already booked? (look through their recent bookings)
      const mine = await bookingsApi.mine({ size: 100 }).catch(() => null);
      setMyBooking(mine?.content.find((b) => b.eventId === id && b.status === 'CONFIRMED') || null);
    } else {
      setMyBooking(null);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const book = async () => {
    if (!user) {
      navigate(`/signin?next=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    setBusy(true);
    setApiError(null);
    try {
      await bookingsApi.create(id);
      showToast(201, `Booked: ${event.title}`);
    } catch (err) {
      setApiError(err); // 409 sold out / already booked / lost the race
    } finally {
      setBusy(false);
      load(); // ticket count may have changed either way
    }
  };

  const cancel = async () => {
    const ok = await confirm({
      title: 'Cancel this booking?',
      body: `Your ticket for ${event.title} goes back on sale.`,
      cta: 'Cancel booking',
    });
    if (!ok) return;
    try {
      await bookingsApi.cancel(myBooking.id);
      showToast(200, 'Booking cancelled');
      load();
    } catch (err) {
      showToast(err.status, err.message);
    }
  };

  if (notFound) {
    return (
      <main>
        <div className="back-bar"><Link to="/events" className="link-btn">← All events</Link></div>
        <div className="empty"><div className="empty-title">Event not found.</div><div className="muted">It may have been removed.</div></div>
      </main>
    );
  }
  if (!event) {
    return (
      <main>
        <div className="back-bar"><Link to="/events" className="link-btn">← All events</Link></div>
        {apiError ? <ErrorBanner error={apiError} className="banner-inset" /> : <div className="page-loading">Loading…</div>}
      </main>
    );
  }

  const booked = !!myBooking;

  return (
    <main>
      <div className="back-bar"><Link to="/events" className="link-btn">← All events</Link></div>

      <section className="detail-hero">
        <div className="detail-media stripes">
          <EventImage src={imgFor(event.category, 1400)} alt={event.title} className="img-fill" />
        </div>
        <div className="detail-copy">
          <span className="kicker">{event.categoryLabel}</span>
          <h1 className="h-big">{event.title}</h1>
          {event.description && <p className="lead-sm">{event.description}</p>}
        </div>
      </section>

      <section className="facts">
        <div className="fact"><div className="label">When</div><div className="fact-value">{event.dateLong}</div></div>
        <div className="fact"><div className="label">Where</div><div className="fact-value">{event.location}</div></div>
        <div className="fact"><div className="label">Price</div><div className="fact-value">{event.priceLabel}</div></div>
        <div className="fact"><div className="label">Tickets</div><div className="fact-value">{event.availLong}</div></div>
      </section>

      <section className="book-panel">
        {event.isOpen && !booked && (
          <button className="btn btn-red btn-xl btn-split" onClick={book} disabled={busy}>
            <span>{busy ? 'Booking…' : user ? `Book 1 ticket · ${event.priceLabel}` : 'Sign in to book'}</span>
            <span>→</span>
          </button>
        )}
        {booked && (
          <div className="booked-box">
            <div>
              <div className="booked-title">You're booked.</div>
              <div className="muted small">Booking {bookingRef(myBooking.id)} · confirmed</div>
            </div>
            {!event.isPast && <button className="btn btn-outline" onClick={cancel}>Cancel booking</button>}
          </div>
        )}
        {event.isSoldOut && !booked && <button className="btn btn-red btn-xl" disabled>Sold out</button>}
        {event.isPast && !booked && <button className="btn btn-outline btn-xl" disabled>This event has already started</button>}
        <ErrorBanner error={apiError} />
      </section>
    </main>
  );
}

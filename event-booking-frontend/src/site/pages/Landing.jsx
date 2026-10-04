import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/endpoints';
import EventImage from '../../ui/EventImage';
import { HERO_PHOTO, eventView, imgFor, nowLocal } from '../../lib/format';
import { ADMIN_URL } from '../../lib/sites';

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    eventsApi
      .search({ from: nowLocal(), sort: 'date', size: 3 })
      .then((page) => setFeatured(page.content.map(eventView)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">Concerts · Meetups · Workshops</div>
          <h1 className="hero-title">One seat.<br />One booking.<br />No oversold rooms.</h1>
          <p className="lead">Find what's on near you and book in one click. When an event says it has one ticket left, it does.</p>
          <div className="row-gap">
            <Link to="/events" className="btn btn-red btn-lg btn-wide">Browse events →</Link>
            <Link to="/signup" className="btn btn-outline btn-lg">Create account</Link>
          </div>
        </div>
        <div className="hero-media stripes">
          <EventImage src={HERO_PHOTO} alt="Crowd at a concert" className="img-fill" />
        </div>
      </section>

      <section className="bordered">
        <div className="section-head">
          <h2 className="h2">Coming up</h2>
          <Link to="/events" className="link-btn">All events →</Link>
        </div>
        <div className="card-grid">
          {featured.map((e) => (
            <Link key={e.id} to={`/events/${e.id}`} className="event-card">
              <div className="event-card-media stripes">
                <EventImage src={imgFor(e.category, 640)} alt={e.title} />
              </div>
              <div className="event-card-body">
                <span className="eyebrow red">{e.dateShort}</span>
                <span className="event-card-title">{e.title}</span>
                <span className="muted small">{e.location} · {e.priceLabel}</span>
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <div className="empty">
              <div className="empty-title">Nothing scheduled yet.</div>
              <div className="muted">Check back soon.</div>
            </div>
          )}
        </div>
      </section>

      <section className="steps bordered">
        <div className="step"><span className="step-num">01</span><span className="step-title">Browse</span><span className="body-ink">Filter by city and date. No account needed to look.</span></div>
        <div className="step"><span className="step-num">02</span><span className="step-title">Book</span><span className="body-ink">One ticket per person per event, confirmed instantly.</span></div>
        <div className="step"><span className="step-num">03</span><span className="step-title">Cancel</span><span className="body-ink">Changed plans? Cancel any time before the doors open.</span></div>
      </section>

      <section className="bordered">
        <div className="fair">
          <div className="fair-left">
            <span className="kicker">Built to be fair</span>
            <h2 className="h-big">Ten people. One last ticket. One booking.</h2>
          </div>
          <div className="fair-right">
            <p className="lead-sm">When several people hit "Book" for the last seat at the same moment, exactly one booking goes through. Everyone else is told straight away that someone beat them to it, and no money changes hands.</p>
            <div className="code-line"><span className="code-status">409</span><span>Someone else just booked this. Please try again.</span></div>
          </div>
        </div>
        <div className="features">
          <div className="feature"><span className="feature-title">No overselling</span><span className="body-ink small-plus">Every ticket count is version-checked when it's saved. If it changed underneath you, the booking is rejected, never double-sold.</span></div>
          <div className="feature"><span className="feature-title">No duplicate bookings</span><span className="body-ink small-plus">One active booking per person per event. A double-click on "Book" can't create two.</span></div>
          <div className="feature"><span className="feature-title">Secure sign-in</span><span className="body-ink small-plus">Passwords are hashed with BCrypt. Each request carries a signed token, with no session to hijack.</span></div>
          <div className="feature"><span className="feature-title">Your bookings are yours</span><span className="body-ink small-plus">Only you, or an organizer, can view or cancel a booking. Only organizers can create or change events.</span></div>
        </div>
      </section>

      <section className="cta-band">
        <h2 className="cta-title">Running an event? Publish it on Turnstile.</h2>
        <a href={ADMIN_URL} className="btn btn-on-red btn-lg btn-wide">Organizer sign in →</a>
      </section>

      <footer className="site-footer"><span>© 2026 Turnstile</span><span>Prices in USD</span></footer>
    </main>
  );
}

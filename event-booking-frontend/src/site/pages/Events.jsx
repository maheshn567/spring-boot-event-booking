import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/endpoints';
import EventImage from '../../ui/EventImage';
import ErrorBanner from '../../ui/ErrorBanner';
import { endOfDay, eventView, imgFor, startOfDay } from '../../lib/format';

const EMPTY_FILTERS = { location: '', from: '', to: '', sort: 'date' };
const PAGE_SIZE = 20;

// Upcoming first, past ("Ended") at the bottom
const upcomingFirst = (list) => [...list.filter((e) => !e.isPast), ...list.filter((e) => e.isPast)];

export default function Events() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [location, setLocation] = useState(''); // debounced copy of filters.location
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wait until typing pauses before searching by city
  useEffect(() => {
    const t = setTimeout(() => setLocation(filters.location.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.location]);

  const query = (pageNumber) =>
    eventsApi.search({
      location,
      from: startOfDay(filters.from),
      to: endOfDay(filters.to),
      sort: filters.sort,
      page: pageNumber,
      size: PAGE_SIZE,
    });

  useEffect(() => {
    let stale = false;
    setLoading(true);
    query(0)
      .then((res) => {
        if (stale) return;
        setEvents(res.content.map(eventView));
        setPage(res.page);
        setError(null);
      })
      .catch((err) => !stale && setError(err))
      .finally(() => !stale && setLoading(false));
    return () => { stale = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, filters.from, filters.to, filters.sort]);

  const loadMore = async () => {
    try {
      const res = await query(page.number + 1);
      setEvents((prev) => [...prev, ...res.content.map(eventView)]);
      setPage(res.page);
    } catch (err) {
      setError(err);
    }
  };

  const set = (key) => (ev) => setFilters((f) => ({ ...f, [key]: ev.target.value }));
  const total = page?.totalElements ?? 0;
  const list = upcomingFirst(events);
  const hasMore = page && page.number + 1 < page.totalPages;

  return (
    <main>
      <div className="page-head"><h1 className="h1">Events</h1></div>

      <div className="filters">
        <label className="filter">
          <span className="label">Location</span>
          <input value={filters.location} onChange={set('location')} placeholder="Any city" className="input-line" />
        </label>
        <label className="filter">
          <span className="label">From</span>
          <input type="date" value={filters.from} onChange={set('from')} className="input-line" />
        </label>
        <label className="filter">
          <span className="label">To</span>
          <input type="date" value={filters.to} onChange={set('to')} className="input-line" />
        </label>
        <label className="filter">
          <span className="label">Sort</span>
          <select value={filters.sort} onChange={set('sort')} className="input-line">
            <option value="date">Date, soonest</option>
            <option value="priceAsc">Price, low to high</option>
            <option value="priceDesc">Price, high to low</option>
          </select>
        </label>
      </div>

      <div className="result-bar">
        <span>{loading ? 'Loading…' : `${total} ${total === 1 ? 'event' : 'events'}`}</span>
        <button className="link-btn" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
      </div>

      {error && <ErrorBanner error={error} className="banner-inset" />}

      {list.map((e) => (
        <Link key={e.id} to={`/events/${e.id}`} className="event-row">
          <div className="event-row-date">
            <span className="eyebrow red">{e.month}</span>
            <span className="event-row-day">{e.day}</span>
            <span className="muted tiny">{e.time}</span>
          </div>
          <div className="event-row-media stripes">
            <EventImage src={imgFor(e.category, 640)} />
          </div>
          <div className="event-row-info">
            <span className="eyebrow">{e.categoryLabel}</span>
            <span className="event-row-title">{e.title}</span>
            <span className="body-ink small-plus">{e.location}</span>
          </div>
          <div className="event-row-price">
            <span className="price">{e.priceLabel}</span>
            {e.isOpen && <span className="chip">{e.availLabel}</span>}
            {e.isSoldOut && <span className="chip chip-red">Sold out</span>}
            {e.isPast && <span className="chip chip-outline">Ended</span>}
          </div>
        </Link>
      ))}

      {!loading && !error && list.length === 0 && (
        <div className="empty bordered">
          <div className="empty-title">No events match.</div>
          <div className="muted">Try a different city or widen the dates.</div>
        </div>
      )}

      {hasMore && (
        <div className="load-more">
          <button className="btn btn-outline" onClick={loadMore}>Load more</button>
        </div>
      )}
    </main>
  );
}

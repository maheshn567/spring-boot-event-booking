import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi, eventsApi } from '../../api/endpoints';
import { useFeedback } from '../../ui/Feedback';
import ErrorBanner from '../../ui/ErrorBanner';
import { CATEGORIES } from '../../lib/format';

const EMPTY = { title: '', description: '', category: 'CONCERT', location: '', eventDate: '', totalTickets: '100', price: '0' };

// Create (/events/new) and edit (/events/:id/edit) on the admin site
export default function AdminEventForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    eventsApi
      .get(id)
      .then((e) =>
        setForm({
          title: e.title,
          description: e.description || '',
          category: e.category || 'CONCERT',
          location: e.location,
          eventDate: e.eventDate.slice(0, 16), // fits <input type="datetime-local">
          totalTickets: String(e.totalTickets),
          price: String(e.price),
        }),
      )
      .catch(setApiError);
  }, [editing, id]);

  const set = (key) => (ev) => setForm((f) => ({ ...f, [key]: ev.target.value }));

  const save = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setErrors({});
    setApiError(null);
    const body = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      eventDate: form.eventDate || null,
      totalTickets: form.totalTickets === '' ? null : Number(form.totalTickets),
      price: form.price === '' ? null : Number(form.price),
    };
    try {
      if (editing) await adminApi.updateEvent(id, body);
      else await adminApi.createEvent(body);
      showToast(editing ? 200 : 201, editing ? 'Event updated' : 'Event published');
      navigate('/events');
    } catch (err) {
      setErrors(err.errors || {});
      setApiError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <div className="admin-head admin-head-col">
        <Link to="/events" className="link-btn">← Events</Link>
        <h1 className="h-admin">{editing ? 'Edit event' : 'New event'}</h1>
      </div>

      <form className="event-form" onSubmit={save} noValidate>
        <label className="field span-all">
          <span className="field-label">Title</span>
          <input value={form.title} onChange={set('title')} className="input-box" />
          <span className="field-error">{errors.title}</span>
        </label>
        <label className="field span-all">
          <span className="field-label">Description</span>
          <textarea rows={4} value={form.description} onChange={set('description')} className="input-box textarea" />
          <span className="field-error">{errors.description}</span>
        </label>
        <label className="field">
          <span className="field-label">Category</span>
          <select value={form.category} onChange={set('category')} className="input-box">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="field-error">{errors.category}</span>
        </label>
        <label className="field">
          <span className="field-label">Location</span>
          <input value={form.location} onChange={set('location')} className="input-box" />
          <span className="field-error">{errors.location}</span>
        </label>
        <label className="field">
          <span className="field-label">Date and time</span>
          <input type="datetime-local" value={form.eventDate} onChange={set('eventDate')} className="input-box" />
          <span className="field-error">{errors.eventDate}</span>
        </label>
        <label className="field">
          <span className="field-label">Total tickets</span>
          <input type="number" min="1" value={form.totalTickets} onChange={set('totalTickets')} className="input-box" />
          <span className="field-error">{errors.totalTickets}</span>
        </label>
        <label className="field">
          <span className="field-label">Price (USD)</span>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input-box" />
          <span className="field-error">{errors.price}</span>
        </label>

        {apiError && <ErrorBanner error={apiError} className="span-all" />}

        <div className="form-actions span-all">
          <button type="submit" className="btn btn-red btn-wide" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes →' : 'Publish event →'}
          </button>
          <Link to="/events" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

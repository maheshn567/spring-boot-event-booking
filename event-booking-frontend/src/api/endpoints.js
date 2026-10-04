import { api } from './client';

const qs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

// UI sort keys → Spring Data "sort" param
const SORTS = {
  date: 'eventDate,asc',
  priceAsc: 'price,asc',
  priceDesc: 'price,desc',
};

export const authApi = {
  register: (body) => api('/api/auth/register', { method: 'POST', body }),
  login: (body) => api('/api/auth/login', { method: 'POST', body }),
  me: () => api('/api/users/me'),
};

export const eventsApi = {
  // from / to are LocalDateTime strings, e.g. 2026-11-01T00:00:00
  search: ({ location, from, to, sort = 'date', page = 0, size = 20 } = {}) =>
    api(`/api/events${qs({ location, from, to, sort: SORTS[sort], page, size })}`),
  get: (id) => api(`/api/events/${id}`),
};

export const bookingsApi = {
  create: (eventId) => api('/api/bookings', { method: 'POST', body: { eventId } }),
  mine: ({ page = 0, size = 20 } = {}) => api(`/api/bookings${qs({ page, size })}`),
  cancel: (id) => api(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// Organizer console only — everything under /api/admin (ADMIN role)
export const adminApi = {
  stats: () => api('/api/admin/stats'),
  createEvent: (body) => api('/api/admin/events', { method: 'POST', body }),
  updateEvent: (id, body) => api(`/api/admin/events/${id}`, { method: 'PUT', body }),
  deleteEvent: (id) => api(`/api/admin/events/${id}`, { method: 'DELETE' }),
  bookings: ({ page = 0, size = 20 } = {}) => api(`/api/admin/bookings${qs({ page, size })}`),
  cancelBooking: (id) => api(`/api/admin/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// Display helpers shared by every page

export const CATEGORIES = [
  { value: 'CONCERT', label: 'Concert' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'TALK', label: 'Talk' },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || 'Event';

const PHOTOS = {
  CONCERT: 'photo-1501281668745-f7f57925c3b4',
  MEETUP: 'photo-1540575467063-178a50c2df87',
  WORKSHOP: 'photo-1513364776144-60967b0f800f',
  COMEDY: 'photo-1527224857830-43a7acc85260',
  TALK: 'photo-1475721027785-f74eccf877e2',
};

export const FALLBACK_PHOTO = '/photo.jpg';
export const HERO_PHOTO =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=70';

export const imgFor = (category, width) =>
  PHOTOS[category]
    ? `https://images.unsplash.com/${PHOTOS[category]}?auto=format&fit=crop&w=${width}&q=70`
    : FALLBACK_PHOTO;

export const usd = (n) =>
  Number(n) === 0 ? 'Free' : '$' + Number(n).toFixed(2).replace(/\.00$/, '');

// Backend sends LocalDateTime without a zone → parsed as local time
const dt = (s) => new Date(s);

export const fmtShort = (s) =>
  dt(s).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
  ' · ' +
  dt(s).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });

export const fmtLong = (s) =>
  dt(s).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
  ', ' +
  dt(s).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });

export const fmtStamp = (s) => dt(s).toLocaleString('en-US', { month: 'short', day: 'numeric' });

export const isPast = (eventDate) => dt(eventDate) < new Date();

// UUIDv7 starts with a timestamp, so use the random tail as a short reference
export const bookingRef = (id) => id.slice(-8).toUpperCase();

// Everything the event cards / rows need, worked out in one place
export function eventView(e) {
  const left = e.availableTickets;
  const past = isPast(e.eventDate);
  const d = dt(e.eventDate);
  return {
    ...e,
    categoryLabel: categoryLabel(e.category),
    priceLabel: usd(e.price),
    dateShort: fmtShort(e.eventDate),
    dateLong: fmtLong(e.eventDate),
    month: d.toLocaleString('en-US', { month: 'short' }),
    day: d.getDate(),
    time: d.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
    isPast: past,
    isSoldOut: !past && left <= 0,
    isOpen: !past && left > 0,
    availLabel: left <= 10 ? `${left} left` : 'Available',
    availLong: past ? 'Event ended' : left <= 0 ? 'Sold out' : `${left} of ${e.totalTickets} left`,
    soldLabel: `${e.bookedTickets}/${e.totalTickets}`,
    pct: `${Math.round((e.bookedTickets / e.totalTickets) * 100)}%`,
    statusLabel: past ? 'Ended' : left <= 0 ? 'Sold out' : 'On sale',
  };
}

// <input type="date"> value → LocalDateTime string for the API
export const startOfDay = (date) => (date ? `${date}T00:00:00` : undefined);
export const endOfDay = (date) => (date ? `${date}T23:59:59` : undefined);
export const nowLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

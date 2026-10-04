// One React app, two sites:
//   http://localhost:5173        → public website
//   http://admin.localhost:5173  → organizer console
// Browsers resolve *.localhost to your machine, so no hosts-file setup is needed.
// Each site has its own origin, so each keeps its own login.

const { protocol, hostname, port } = window.location;
const baseHost = hostname.replace(/^admin\./, '');
const portPart = port ? `:${port}` : '';

export const IS_ADMIN_SITE = hostname.startsWith('admin.');

// Override in .env for real domains, e.g. VITE_ADMIN_URL=https://admin.example.com
export const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || `${protocol}//${baseHost}${portPart}`;
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || `${protocol}//admin.${baseHost}${portPart}`;

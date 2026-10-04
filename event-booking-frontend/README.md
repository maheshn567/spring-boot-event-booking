# Turnstile frontend

React + Vite app for the event booking API. One codebase serves two sites:

| URL | Site |
|---|---|
| `http://localhost:5173` | Public website (browse, sign up, book) |
| `http://admin.localhost:5173` | Organizer console (events, bookings, stats) |

```bash
npm install
npm run dev     # needs the Spring Boot backend on localhost:8080
npm run build
npm run lint
```

`/api` requests are proxied to the backend (see `vite.config.js`). For real domains, set `VITE_PUBLIC_URL` and `VITE_ADMIN_URL`.

See the [main README](../README.md) for the full setup.

// Small fetch wrapper: adds the JWT, parses JSON, and turns error responses
// into ApiError { status, message, errors } (the backend's ErrorResponse shape).

const TOKEN_KEY = 'turnstile.token';

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage blocked */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ }
  },
};

export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const FALLBACK_MESSAGES = {
  400: 'Bad request',
  401: 'Please sign in again',
  403: "You don't have access to this",
  404: 'Not found',
  409: 'Conflict',
  500: 'Something went wrong on the server',
};

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Expired or invalid token: forget it so the UI shows "signed out"
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(
      res.status,
      data?.message || FALLBACK_MESSAGES[res.status] || `Request failed (${res.status})`,
      data?.errors || {},
    );
  }
  return data;
}

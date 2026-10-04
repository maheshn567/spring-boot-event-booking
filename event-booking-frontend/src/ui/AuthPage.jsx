import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from './Feedback';
import ErrorBanner from './ErrorBanner';
import { PUBLIC_URL } from '../lib/sites';

const COPY = {
  signin: {
    kicker: 'Welcome back', head: 'Your seat is waiting.', title: 'Sign in', cta: 'Sign in',
    switchLabel: 'New here? Create an account', switchTo: '/signup', hint: '',
    dark: false, foot: 'Tickets are held for you the moment you book.',
  },
  signup: {
    kicker: 'Create an account', head: 'Book in one click.', title: 'Sign up', cta: 'Create account',
    switchLabel: 'Have an account? Sign in', switchTo: '/signin', hint: 'password: 8+ characters',
    dark: false, foot: 'Free to join. Cancel bookings any time before an event starts.',
  },
  admin: {
    kicker: 'Organizer console', head: 'Publish. Track. Fill the room.', title: 'Admin sign in', cta: 'Sign in to console',
    switchLabel: '← Back to public site', switchHref: PUBLIC_URL, hint: '',
    dark: true, foot: 'Admin accounts are created by your team. There is no public sign-up.',
  },
};

// One page for sign in, sign up and admin sign in (mode prop)
export default function AuthPage({ mode }) {
  const copy = COPY[mode];
  const { login, register, logout } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Only follow in-app paths after sign in
  const next = params.get('next')?.startsWith('/') ? params.get('next') : '/events';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (ev) => setForm((f) => ({ ...f, [key]: ev.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setErrors({});
    setApiError(null);
    try {
      if (mode === 'signup') {
        await register(form.name, form.email, form.password);
        showToast(201, 'Account created');
        navigate(next);
        return;
      }
      const me = await login(form.email, form.password);
      if (mode === 'admin' && me.role !== 'ADMIN') {
        logout();
        setApiError({ status: 403, message: "This account doesn't have admin access" });
        return;
      }
      showToast(200, `Signed in as ${me.email}`);
      navigate(mode === 'admin' ? '/' : next);
    } catch (err) {
      setErrors(err.errors || {});
      setApiError(err.status === 401 ? { status: 401, message: 'Invalid email or password' } : err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`auth ${mode === 'admin' ? 'auth-full' : ''}`}>
      <div className={`auth-panel ${copy.dark ? 'auth-panel-dark' : ''}`}>
        <span className="kicker-plain">{copy.kicker}</span>
        <h1 className="auth-head">{copy.head}</h1>
        <span className="small">{copy.foot}</span>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        <h2 className="h2">{copy.title}</h2>

        {mode === 'signup' && (
          <label className="field">
            <span className="field-label">Full name</span>
            <input value={form.name} onChange={set('name')} autoComplete="name" className="input-box" />
            <span className="field-error">{errors.name}</span>
          </label>
        )}
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" className="input-box" />
          <span className="field-error">{errors.email}</span>
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="input-box"
          />
          <span className="field-error">{errors.password}</span>
        </label>

        <ErrorBanner error={apiError} />

        <button type="submit" className="btn btn-red btn-lg btn-split" disabled={busy}>
          <span>{busy ? 'Please wait…' : copy.cta}</span>
          <span>→</span>
        </button>

        <div className="auth-foot">
          {copy.switchHref ? (
            <a href={copy.switchHref} className="link-btn">{copy.switchLabel}</a>
          ) : (
            <button type="button" className="link-btn" onClick={() => navigate(copy.switchTo + window.location.search)}>{copy.switchLabel}</button>
          )}
          {copy.hint && <span className="mono-hint">{copy.hint}</span>}
        </div>
      </form>
    </main>
  );
}

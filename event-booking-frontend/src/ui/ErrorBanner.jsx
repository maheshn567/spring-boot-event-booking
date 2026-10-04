// Shows an API error as "409  Event is sold out"
export default function ErrorBanner({ error, className = '' }) {
  if (!error) return null;
  return (
    <div className={`error-banner ${className}`} role="alert">
      <span className="error-code">{error.status || 'ERR'}</span>
      <span className="error-text">{error.message}</span>
    </div>
  );
}

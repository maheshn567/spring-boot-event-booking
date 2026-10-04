import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { FeedbackProvider } from './ui/Feedback';
import { IS_ADMIN_SITE } from './lib/sites';
import './index.css';

// Load only the site being visited: the public bundle never contains admin code
const SiteApp = IS_ADMIN_SITE
  ? lazy(() => import('./admin/AdminApp'))
  : lazy(() => import('./site/SiteApp'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
          <Suspense fallback={<div className="page-loading">Loading…</div>}>
            <SiteApp />
          </Suspense>
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

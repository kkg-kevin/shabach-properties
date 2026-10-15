import { Suspense, lazy, useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, Route, Routes, useLocation, useMatch, useNavigate, useNavigationType, useParams } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { PropertiesPage } from './components/PropertiesPage';
import { PropertyDetail } from './components/PropertyDetail';
import { PrivacyPage } from './components/PrivacyPage';
import { NotFound } from './components/NotFound';
import { WhatsAppButton, WhatsAppProvider } from './components/WhatsAppButton';

// Visitors never download the dashboard code unless they open /admin
const AdminPage = lazy(() => import('./components/AdminPage').then((module) => ({ default: module.AdminPage })));

// New pages start at the top (or at their #section); Back and Forward return
// to where the visitor was; filter changes on the same page leave scroll alone.
function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const current = useRef({ key: location.key, pathname: location.pathname });

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const save = () => positions.current.set(current.current.key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  // A layout effect, so the new page's key is in place before any scroll event fires for it
  useLayoutEffect(() => {
    const previous = current.current;
    current.current = { key: location.key, pathname: location.pathname };

    if (navigationType === 'REPLACE' && previous.pathname === location.pathname) {
      positions.current.set(location.key, window.scrollY);
      return;
    }

    const saved = navigationType === 'POP' ? positions.current.get(location.key) : undefined;
    if (saved !== undefined) {
      window.scrollTo({ top: saved });
      return;
    }

    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.key]);

  return null;
}

function PublicLayout() {
  // Property pages have their own contact bar on phones, which the floating button would cover
  const onPropertyPage = Boolean(useMatch('/properties/:id'));

  return (
    <div className={`flex flex-1 flex-col ${onPropertyPage ? 'pb-20 lg:pb-0' : ''}`}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton className={onPropertyPage ? 'hidden lg:flex' : ''} />
    </div>
  );
}

function PropertyDetailRoute() {
  const { id } = useParams();
  return <PropertyDetail propertyId={id ?? ''} />;
}

function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-purple" />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <WhatsAppProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-center" richColors />
        <ScrollManager />

        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailRoute />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageSpinner />}>
                <AdminPage onBack={() => navigate('/')} />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </WhatsAppProvider>
  );
}

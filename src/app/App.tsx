import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { PropertiesPage } from './components/PropertiesPage';
import { PropertyDetail } from './components/PropertyDetail';
import { AdminPage } from './components/AdminPage';
import { WhatsAppButton } from './components/WhatsAppButton';

// Scrolls to the #section in the URL, or to the top on a new page
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);

  return null;
}

function PublicLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function PropertyDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  return <PropertyDetail propertyId={id ?? ''} onBack={() => navigate('/properties')} />;
}

export default function App() {
  const navigate = useNavigate();
  const viewProperty = (id: string) => navigate(`/properties/${id}`);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <ScrollManager />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage onViewProperty={viewProperty} />} />
          <Route path="/properties" element={<PropertiesPage onViewProperty={viewProperty} />} />
          <Route path="/properties/:id" element={<PropertyDetailRoute />} />
        </Route>
        <Route path="/admin" element={<AdminPage onBack={() => navigate('/')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

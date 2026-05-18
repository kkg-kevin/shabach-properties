import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { PropertyDetail } from './components/PropertyDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppButton } from './components/WhatsAppButton';

type Page = 'home' | 'property-detail' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleViewProperty = (id: string) => {
    setSelectedPropertyId(id);
    setCurrentPage('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedPropertyId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />

      {currentPage !== 'admin' && <Header />}

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onViewProperty={handleViewProperty} />
        )}

        {currentPage === 'property-detail' && selectedPropertyId && (
          <PropertyDetail
            propertyId={selectedPropertyId}
            onBack={handleBackToHome}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onBack={handleBackToHome} />
        )}
      </main>

      {currentPage !== 'admin' && <Footer />}

      {currentPage !== 'admin' && <WhatsAppButton />}

      {/* Admin Access Button (Hidden in production) */}
      <button
        onClick={() => setCurrentPage('admin')}
        className="fixed bottom-6 left-6 z-50 bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-20 hover:opacity-100 transition-opacity"
      >
        Admin
      </button>
    </div>
  );
}
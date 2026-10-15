import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileCheck,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  Wallet,
} from 'lucide-react';
import { Button } from './ui/button';
import { EnquiryForm } from './EnquiryForm';
import { PropertyGallery } from './PropertyGallery';
import { PropertyCard, StatusBadge } from './PropertyCard';
import { usePageWhatsAppMessage } from './WhatsAppButton';
import {
  formatDate,
  formatPrice,
  isNotFound,
  priceValue,
  propertyAPI,
  type Property,
} from '../../utils/api';
import { propertyWhatsAppMessage, site, whatsappUrl } from '../../config/site';
import { usePageTitle } from '../../hooks/usePageTitle';
import { cachedProperty, useProperties } from '../../hooks/useProperties';

type LoadState = 'loading' | 'ready' | 'missing' | 'failed';

const panelClass = 'rounded-xl border border-gray-200 bg-white p-6';

// "Kitengela, Kajiado" -> "kitengela", to match plots in the same area
const area = (location: string) => location.split(',')[0].trim().toLowerCase();

// Lets search engines understand the listing (price, availability, photos)
function useListingStructuredData(property: Property | null) {
  useEffect(() => {
    if (!property) return;
    const availability = { Available: 'InStock', Reserved: 'LimitedAvailability', Sold: 'SoldOut', Hidden: 'Discontinued' };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description: property.description || `${property.size} plot in ${property.location}`,
      url: `${window.location.origin}/properties/${property.id}`,
      image: property.images,
      datePosted: property.createdAt,
      offers: {
        '@type': 'Offer',
        price: priceValue(property.price) || undefined,
        priceCurrency: 'KES',
        availability: `https://schema.org/${availability[property.status]}`,
      },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [property]);
}

export function PropertyDetail({ propertyId }: { propertyId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { properties } = useProperties();
  const [property, setProperty] = useState<Property | null>(() => cachedProperty(propertyId));
  const [loadState, setLoadState] = useState<LoadState>(property ? 'ready' : 'loading');
  const [attempt, setAttempt] = useState(0);
  const [visitRequest, setVisitRequest] = useState(0);

  useEffect(() => {
    // Show the copy from the listings at once, then the latest from the server
    const cached = cachedProperty(propertyId);
    setProperty(cached);
    setLoadState(cached ? 'ready' : 'loading');

    let current = true;
    propertyAPI
      .getById(propertyId)
      .then((data) => {
        if (!current) return;
        setProperty(data);
        setLoadState('ready');
      })
      .catch((error) => {
        if (!current) return;
        console.error('Failed to load property:', error);
        if (isNotFound(error)) {
          setProperty(null);
          setLoadState('missing');
        } else if (!cached) {
          setLoadState('failed');
        }
      });
    return () => {
      current = false;
    };
  }, [propertyId, attempt]);

  usePageTitle(
    property ? `${property.title} in ${property.location}` : loadState === 'missing' ? 'Property not found' : undefined,
  );
  usePageWhatsAppMessage(property ? propertyWhatsAppMessage(property) : null);
  useListingStructuredData(property);

  // Back to wherever the visitor came from, keeping their filters and scroll position
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/properties'));

  const backButton = (
    <Button variant="ghost" onClick={goBack} className="-ml-3">
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );

  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6" aria-busy="true">
        {backButton}
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="aspect-video animate-pulse rounded-xl bg-gray-100" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
        <p className="sr-only">Loading property details...</p>
      </div>
    );
  }

  if (loadState !== 'ready' || !property) {
    const missing = loadState === 'missing';
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center" role="alert">
        <h1 className="text-2xl font-bold text-ink">
          {missing ? 'This property is no longer listed' : 'We could not load this property'}
        </h1>
        <p className="mt-3 text-gray-600">
          {missing
            ? 'It may have been sold or removed. Have a look at the other plots we have available.'
            : 'Please check your connection and try again.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!missing && <Button onClick={() => setAttempt((count) => count + 1)}>Try again</Button>}
          <Button asChild variant={missing ? 'default' : 'outline'}>
            <Link to="/properties">Browse properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sold = property.status === 'Sold';
  const reserved = property.status === 'Reserved';
  const whatsappLink = whatsappUrl(propertyWhatsAppMessage(property));

  const scrollToEnquiry = () =>
    document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const bookVisit = () => {
    setVisitRequest((count) => count + 1);
    scrollToEnquiry();
  };

  const share = async () => {
    const url = `${window.location.origin}/properties/${property.id}`;
    const text = `${property.title} in ${property.location}, ${formatPrice(property.price)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text, url });
      } catch {
        // The visitor closed the share sheet
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener');
  };

  // Available plots, those in the same area first
  const similar = properties
    .filter((candidate) => candidate.id !== property.id && candidate.status !== 'Sold')
    .sort((a, b) => Number(area(b.location) === area(property.location)) - Number(area(a.location) === area(property.location)))
    .slice(0, 4);

  const facts = [
    { icon: Ruler, label: 'Size', value: property.size },
    { icon: FileCheck, label: 'Title', value: property.titleStatus },
    { icon: Wallet, label: 'Payment plan', value: property.paymentPlan },
    { icon: Calendar, label: 'Listed', value: formatDate(property.createdAt) },
  ].filter((fact) => fact.value);

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {backButton}

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <PropertyGallery images={property.images ?? []} title={property.title} />

            <section className={panelClass}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <StatusBadge status={property.status} />
                  <h1 className="mt-3 text-2xl font-extrabold leading-tight text-ink md:text-3xl">{property.title}</h1>
                  <p className="mt-2 flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5 shrink-0 text-brand-purple" />
                    {property.location}
                  </p>
                </div>
                <Button variant="outline" onClick={share}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <p className="mt-5 text-3xl font-bold text-brand-green md:text-4xl">{formatPrice(property.price)}</p>

              {(sold || reserved) && (
                <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 text-amber-900">
                  <Info className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    {sold
                      ? 'This plot has been sold. See similar plots below, or ask us about plots like it.'
                      : 'This plot is reserved by a buyer. Contact us to be told if it becomes available, or see similar plots below.'}
                  </p>
                </div>
              )}

              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3">
                    <fact.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                    <div>
                      <dt className="text-sm text-gray-500">{fact.label}</dt>
                      <dd className="font-semibold text-ink">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {property.description && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="mb-3 text-xl font-semibold text-ink">Description</h2>
                  <p className="whitespace-pre-line leading-relaxed text-gray-700">{property.description}</p>
                </div>
              )}

              {property.features?.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="mb-3 text-xl font-semibold text-ink">Features & Amenities</h2>
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {property.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 shrink-0 text-brand-green" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className={panelClass}>
              <h2 className="mb-4 text-xl font-semibold text-ink">Location</h2>
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                <iframe
                  title={`Map of ${property.location}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.location}, Kenya`)}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {property.mapUrl ? (
                <a
                  href={property.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-purple hover:underline"
                >
                  Open the exact location in Google Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Map shows the general area. Exact location will be shared during your site visit.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            {/* Phones get the same actions in the bar along the bottom of the screen */}
            <div className={`${panelClass} hidden space-y-3 lg:block`}>
              <p className="text-sm text-gray-500">Interested in this plot?</p>
              <Button asChild variant="secondary" size="xl" className="w-full">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </Button>
              {!sold && (
                <Button size="xl" className="w-full" onClick={bookVisit}>
                  Book a Site Visit
                </Button>
              )}
              <div className="space-y-2 border-t border-gray-200 pt-4 text-sm text-gray-600">
                <a href={site.phoneHref} className="flex items-center gap-2 hover:text-brand-green">
                  <Phone className="h-4 w-4" />
                  {site.phoneDisplay}
                </a>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-brand-green">
                  <Mail className="h-4 w-4" />
                  {site.email}
                </a>
              </div>
            </div>

            <div id="enquiry" className={`${panelClass} scroll-mt-24`}>
              <EnquiryForm
                idPrefix="property-enquiry"
                heading={sold ? 'Ask about similar plots' : 'Send an Enquiry'}
                subheading={sold ? undefined : 'Ask a question or choose a date for a site visit.'}
                property={property}
                visitRequest={visitRequest}
              />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-extrabold text-ink">
              {sold || reserved ? 'Similar plots still available' : 'More plots you may like'}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((candidate) => (
                <PropertyCard key={candidate.id} property={candidate} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <div className="mr-auto min-w-0">
            <p className="text-xs text-gray-500">Price</p>
            <p className="truncate font-bold text-brand-green">{formatPrice(property.price)}</p>
          </div>
          <Button asChild variant="secondary" size="xl" className="w-12 px-0">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-12 px-0">
            <a href={site.phoneHref} aria-label="Call us">
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <Button size="xl" onClick={sold ? scrollToEnquiry : bookVisit}>
            {sold ? 'Enquire' : 'Book Visit'}
          </Button>
        </div>
      </div>
    </div>
  );
}

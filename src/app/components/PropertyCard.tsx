import { Link } from 'react-router';
import { Home, MapPin, Wallet } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { formatPrice, statusLabels, thumbnailUrl, type Property, type PropertyStatus } from '../../utils/api';

const badgeColours: Record<PropertyStatus, string> = {
  Available: 'bg-brand-green text-white',
  Reserved: 'bg-amber-700 text-white',
  Sold: 'bg-gray-600 text-white',
  Hidden: 'bg-gray-200 text-gray-800',
};

export function StatusBadge({ status, className = '' }: { status: PropertyStatus; className?: string }) {
  return (
    <span className={`inline-block rounded px-3 py-1 text-xs font-bold ${badgeColours[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

// A link, so plots can be opened in new tabs, shared and long-pressed
export function PropertyCard({ property }: { property: Property }) {
  const { id, title, location, price, size, images, status, paymentPlan } = property;
  const cover = images?.[0];

  return (
    <Link
      to={`/properties/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-brand-green-bright/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {cover ? (
          <ImageWithFallback
            src={thumbnailUrl(cover)}
            fallbackSrc={cover}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PhotoPlaceholder className="h-full w-full" />
        )}
        <StatusBadge status={status} className="absolute left-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-1 text-base font-bold text-ink">{title}</h3>

        <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-4 w-4 shrink-0 text-brand-purple" />
          {location}
        </p>
        <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
          <Home className="h-4 w-4 shrink-0 text-brand-purple" />
          {size}
        </p>
        {paymentPlan && (
          <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
            <Wallet className="h-4 w-4 shrink-0 text-brand-purple" />
            Payment plan available
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-brand-green">{formatPrice(price)}</p>
          </div>
          <span className="text-sm font-bold text-brand-purple group-hover:text-brand-purple-dark">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

// Same shape as a card, so the page does not jump when the listings arrive
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-gray-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

// Loading, error and empty states shared by every list of cards
export function PropertyGrid({
  properties,
  loading,
  failed,
  onRetry,
  skeletons = 4,
  empty = 'No properties available at the moment.',
}: {
  properties: Property[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  skeletons?: number;
  empty?: string;
}) {
  if (failed) {
    return (
      <div className="py-12 text-center" role="alert">
        <p className="mb-4 text-gray-600">We could not load the properties. Please check your connection and try again.</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!loading && properties.length === 0) {
    return <p className="py-12 text-center text-gray-600">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy={loading}>
      {loading
        ? Array.from({ length: skeletons }, (_, index) => <PropertyCardSkeleton key={index} />)
        : properties.map((property) => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
}

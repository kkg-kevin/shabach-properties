import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { PropertyGrid } from './PropertyCard';
import { priceValue, type PropertyStatus } from '../../utils/api';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useProperties } from '../../hooks/useProperties';

type SortOrder = 'newest' | 'price-low' | 'price-high';

const STATUSES: PropertyStatus[] = ['Available', 'Reserved', 'Sold'];

const MAX_PRICES = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

// Plots that can still be bought come before sold ones
const statusRank: Record<PropertyStatus, number> = { Available: 0, Reserved: 1, Sold: 2, Hidden: 3 };

const fieldClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-green-bright focus:ring-2 focus:ring-brand-green-bright/20';

export function PropertiesPage() {
  const { properties, loading, failed, retry } = useProperties();
  // Filters live in the address, so Back, refresh and shared links keep them
  const [params, setParams] = useSearchParams();

  usePageTitle('Land for Sale');

  const search = params.get('q') ?? '';
  const location = params.get('location') ?? '';
  const status = STATUSES.find((value) => value === params.get('status')) ?? '';
  const maxPrice = Number(params.get('max')) || 0;
  const sort = (['price-low', 'price-high'].includes(params.get('sort') ?? '') ? params.get('sort') : 'newest') as SortOrder;

  const setFilter = (name: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(name, value);
        else next.delete(name);
        return next;
      },
      // Typing in the search box should not add a history entry per letter
      { replace: true, preventScrollReset: true },
    );
  };

  const filtered = Boolean(search || location || status || maxPrice);

  const locations = useMemo(
    () => [...new Set(properties.map((property) => property.location.trim()).filter(Boolean))].sort(),
    [properties],
  );

  const visibleProperties = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = properties.filter(
      (property) =>
        (!status || property.status === status) &&
        (!location || property.location.trim() === location) &&
        (!maxPrice || priceValue(property.price) <= maxPrice) &&
        (!term ||
          [property.title, property.location, property.size, property.description, ...(property.features ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(term)),
    );

    if (sort === 'newest') {
      // The API returns newest first; sort is stable, so that order holds within each status
      return [...matches].sort((a, b) => statusRank[a.status] - statusRank[b.status]);
    }
    const direction = sort === 'price-low' ? 1 : -1;
    return [...matches].sort((a, b) => direction * (priceValue(a.price) - priceValue(b.price)));
  }, [properties, search, status, location, maxPrice, sort]);

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">All Properties</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Land for sale</h1>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(4,auto)]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              className={`${fieldClass} pl-9`}
              type="search"
              aria-label="Search properties"
              placeholder="Search by name, location, size or feature"
              value={search}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </div>
          <select className={fieldClass} aria-label="Filter by location" value={location} onChange={(e) => setFilter('location', e.target.value)}>
            <option value="">All locations</option>
            {locations.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select className={fieldClass} aria-label="Filter by price" value={maxPrice || ''} onChange={(e) => setFilter('max', e.target.value)}>
            <option value="">Any price</option>
            {MAX_PRICES.map((amount) => (
              <option key={amount} value={amount}>
                Up to KSh {amount.toLocaleString('en-KE')}
              </option>
            ))}
          </select>
          <select className={fieldClass} aria-label="Filter by status" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="Available">For Sale</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
          <select
            className={fieldClass}
            aria-label="Sort properties"
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value === 'newest' ? '' : e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        <div className="mb-6 mt-4 flex min-h-8 items-center justify-between gap-3 text-sm text-gray-600">
          {!loading && !failed && (
            <p aria-live="polite">
              {visibleProperties.length} {visibleProperties.length === 1 ? 'property' : 'properties'}
              {filtered ? ' match your search' : ''}
            </p>
          )}
          {filtered && (
            <button
              type="button"
              onClick={() => setParams(sort === 'newest' ? {} : { sort }, { replace: true, preventScrollReset: true })}
              className="font-semibold text-brand-purple hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <PropertyGrid
          properties={visibleProperties}
          loading={loading}
          failed={failed}
          onRetry={retry}
          skeletons={8}
          empty={properties.length === 0 ? 'No properties available at the moment.' : 'No properties match your search. Try clearing some filters.'}
        />
      </div>
    </div>
  );
}

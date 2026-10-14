import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { PropertyCard } from './PropertyCard';
import { propertyAPI, priceValue, type Property } from '../../utils/api';
import { usePageTitle } from '../../hooks/usePageTitle';

type StatusFilter = 'All' | 'Available' | 'Sold';
type SortOrder = 'newest' | 'price-low' | 'price-high';

export function PropertiesPage({ onViewProperty }: { onViewProperty: (id: string) => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');

  usePageTitle('Land for Sale');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setFailed(false);
      setProperties(await propertyAPI.getAll());
    } catch (error) {
      console.error('Failed to load properties:', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const locations = useMemo(
    () => [...new Set(properties.map((property) => property.location.trim()).filter(Boolean))].sort(),
    [properties],
  );

  const visibleProperties = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = properties.filter(
      (property) =>
        (status === 'All' || property.status === status) &&
        (!location || property.location.trim() === location) &&
        (!term || `${property.title} ${property.location} ${property.size}`.toLowerCase().includes(term)),
    );

    // The API already returns newest first
    if (sort === 'newest') return matches;
    const direction = sort === 'price-low' ? 1 : -1;
    return [...matches].sort((a, b) => direction * (priceValue(a.price) - priceValue(b.price)));
  }, [properties, search, status, location, sort]);

  const fieldClass =
    'w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#2DB34A] focus:ring-2 focus:ring-[#2DB34A]/15';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[#5E2CA5]">All Properties</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#111827]">Land for sale</h1>

        <div className="mt-6 mb-8 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className={`${fieldClass} pl-9`}
              type="search"
              aria-label="Search properties"
              placeholder="Search by name, location or size"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={`${fieldClass} lg:w-52`}
            aria-label="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            className={`${fieldClass} lg:w-40`}
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="All">All statuses</option>
            <option value="Available">For Sale</option>
            <option value="Sold">Sold</option>
          </select>
          <select
            className={`${fieldClass} lg:w-48`}
            aria-label="Sort properties"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#2DB34A]" />
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : failed ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-600">We could not load the properties. Please try again.</p>
            <Button onClick={loadProperties} className="bg-[#2DB34A] hover:bg-[#23923B]">
              Retry
            </Button>
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {properties.length === 0
                ? 'No properties available at the moment.'
                : 'No properties match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visibleProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onClick={() => onViewProperty(property.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

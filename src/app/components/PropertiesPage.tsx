import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyCard, PropertyGrid } from './PropertyCard';
import { Button } from './ui/button';
import { useOpenEnquiry } from './EnquiryDialog';
import { track } from '@vercel/analytics';
import { formatPrice, priceValue, type PropertyStatus } from '../../utils/api';
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
  const openEnquiry = useOpenEnquiry();
  // Filters live in the address, so Back, refresh and shared links keep them
  const [params, setParams] = useSearchParams();
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('shabach-compare') || '[]').slice(0, 3); } catch { return []; }
  });
  const [compareNotice, setCompareNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  usePageTitle('Land for Sale');

  const search = params.get('q') ?? '';
  const location = params.get('location') ?? '';
  const status = STATUSES.find((value) => value === params.get('status')) ?? '';
  const maxPrice = Number(params.get('max')) || 0;
  const plan = params.get('plan') ?? '';
  const sort = (['price-low', 'price-high'].includes(params.get('sort') ?? '') ? params.get('sort') : 'newest') as SortOrder;

  const setFilter = (name: string, value: string) => {
    if (name !== 'q') track('Property Filter Used', { filter: name, value: value || 'all' });
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

  const filtered = Boolean(search || location || status || maxPrice || plan);
  const activeFilters = [
    search && { key: 'q', label: `Search: ${search}` },
    location && { key: 'location', label: location },
    maxPrice && { key: 'max', label: `Up to ${formatPrice(String(maxPrice))}` },
    plan && { key: 'plan', label: plan === 'yes' ? 'Payment plan' : 'No plan listed' },
    status && { key: 'status', label: status },
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  const toggleCompare = (id: string) => {
    if (!compareIds.includes(id) && compareIds.length >= 3) {
      setCompareNotice('You can compare up to three plots. Remove one from your shortlist to add another.');
      return;
    }
    const next = compareIds.includes(id) ? compareIds.filter((item) => item !== id) : [...compareIds, id];
    setCompareIds(next);
    setCompareNotice('');
    localStorage.setItem('shabach-compare', JSON.stringify(next));
    track('Property Compared', { action: compareIds.includes(id) ? 'removed' : 'added' });
  };

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
        (plan !== 'yes' || Boolean(property.paymentPlan)) &&
        (plan !== 'no' || !property.paymentPlan) &&
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
  }, [properties, search, status, location, maxPrice, plan, sort]);

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">All Properties</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Land for sale</h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
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
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-ink hover:bg-gray-50 lg:hidden"
            aria-expanded={filtersOpen} aria-controls="property-filters" onClick={() => setFiltersOpen((open) => !open)}>
            <SlidersHorizontal className="h-4 w-4" />Filters{activeFilters.length > 0 && <span className="rounded-full bg-brand-purple px-2 py-0.5 text-xs text-white">{activeFilters.length}</span>}
            <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div id="property-filters" className={`${filtersOpen ? 'grid' : 'hidden'} mt-3 grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2 lg:grid lg:grid-cols-5 lg:border-0 lg:bg-transparent lg:p-0`}>
          <select className={fieldClass} aria-label="Filter by location" value={location} onChange={(e) => setFilter('location', e.target.value)}>
            <option value="">All locations</option>
            {locations.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <div>
            <input className={fieldClass} aria-label="Maximum price in KSh" type="number" min="0" step="50000" list="price-suggestions"
              placeholder="Any budget (KSh)" value={maxPrice || ''} onChange={(e) => setFilter('max', e.target.value)} />
            <datalist id="price-suggestions">{MAX_PRICES.map((amount) => <option key={amount} value={amount}>{amount.toLocaleString('en-KE')}</option>)}</datalist>
          </div>
          <select className={fieldClass} aria-label="Filter by payment plan" value={params.get('plan') ?? ''} onChange={(e) => setFilter('plan', e.target.value)}>
            <option value="">Any payment option</option>
            <option value="yes">Payment plan available</option>
            <option value="no">No payment plan listed</option>
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

        <div className="mb-3 mt-4 flex min-h-8 items-center justify-between gap-3 text-sm text-gray-600">
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

        {activeFilters.length > 0 && <div className="mb-6 flex flex-wrap gap-2" aria-label="Active filters">
          {activeFilters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key, '')}
            className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-brand-purple hover:bg-purple-100">
            {item.label}<X className="h-3.5 w-3.5" /><span className="sr-only">Remove filter</span>
          </button>)}
        </div>}

        {loading || failed ? <PropertyGrid
          properties={visibleProperties} loading={loading} failed={failed} onRetry={retry} skeletons={8}
        /> : visibleProperties.length === 0 ? <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-brand-purple" />
          <h2 className="mt-3 text-xl font-bold text-ink">{properties.length === 0 ? 'No plots are listed right now' : 'No plots match these filters'}</h2>
          <p className="mx-auto mt-2 max-w-lg text-gray-600">{properties.length === 0 ? 'Ask our team about upcoming listings or tell us what you are looking for.' : 'Try a wider budget or another location, or tell us what kind of plot you need.'}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            {filtered && <Button variant="outline" onClick={() => setParams({}, { replace: true, preventScrollReset: true })}>Clear filters</Button>}
            <Button onClick={() => { track('Enquiry Started', { source: 'no_results' }); openEnquiry(); }}>Ask us to help <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProperties.map((property) => <div key={property.id} className="flex flex-col">
            <PropertyCard property={property} />
            <button type="button" onClick={() => toggleCompare(property.id)} aria-pressed={compareIds.includes(property.id)}
              className="mt-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-purple hover:bg-purple-50">
              {compareIds.includes(property.id) ? 'Added to compare' : 'Compare plots'}
            </button>
          </div>)}
        </div>}

        {compareIds.length > 0 && <section className="mt-10 rounded-xl border border-brand-purple/20 bg-purple-50 p-4" aria-label="Property comparison">
          {compareNotice && <p role="status" className="mb-3 text-sm font-medium text-amber-900">{compareNotice}</p>}
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-ink">Compare shortlist ({compareIds.length}/3)</h2>
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple" onClick={() => { setCompareIds([]); localStorage.removeItem('shabach-compare'); }}>Clear <X className="h-4 w-4" /></button></div>
          <div className="mt-3 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="p-2">Property</th><th className="p-2">Availability</th><th className="p-2">Location</th><th className="p-2">Size</th><th className="p-2">Price</th><th className="p-2">Title status</th><th className="p-2">Payment plan</th></tr></thead>
            <tbody>{properties.filter((item) => compareIds.includes(item.id)).map((item) => <tr key={item.id} className="border-t border-purple-100"><td className="p-2"><a className="font-semibold text-brand-purple underline" href={`/properties/${item.id}`}>{item.title}</a></td><td className="p-2">{item.status === 'Available' ? 'For sale' : item.status}</td><td className="p-2">{item.location}</td><td className="p-2">{item.size}</td><td className="p-2">{formatPrice(item.price)}</td><td className="p-2">{item.titleStatus || 'Ask us'}</td><td className="p-2">{item.paymentPlan || 'Ask us'}</td></tr>)}</tbody>
          </table></div>
        </section>}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { track } from '@vercel/analytics';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle, Clock, DollarSign, Lock, MapPin, Search, Shield, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { PropertyGrid } from './PropertyCard';
import { useOpenEnquiry } from './EnquiryDialog';
import { ImageWithFallback } from './ImageWithFallback';
import { site } from '../../config/site';
import { useProperties } from '../../hooks/useProperties';
import type { PropertyStatus } from '../../utils/api';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef';

const trustIndicators = [
  { icon: Shield, title: 'Property Due Diligence', description: 'Get guidance on title checks and property documents before you buy.' },
  { icon: Lock, title: 'Clear Buying Process', description: 'Understand each step from your first enquiry through transfer.' },
  { icon: DollarSign, title: 'Affordable Prices', description: 'Competitive prices with flexible plans.' },
  { icon: MapPin, title: 'Prime Locations', description: 'High-growth areas across Kenya.' },
];

// Plots that can be bought now come first; sold ones only fill any gaps
const featuredRank: Record<PropertyStatus, number> = { Available: 0, Reserved: 1, Sold: 2, Hidden: 3 };

function QuickPropertySearch({ locations }: { locations: string[] }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [plan, setPlan] = useState('');
  const query = new URLSearchParams();
  if (location) query.set('location', location);
  if (budget) query.set('max', budget);
  if (plan) query.set('plan', plan);
  return (
    <form className="mt-7 rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-5" onSubmit={(event) => { event.preventDefault(); track('Property Search Started', { source: 'home_hero' }); const params = query.toString(); navigate(`/properties${params ? `?${params}` : ''}`); }}>
      <p className="mb-3 flex items-center gap-2 font-semibold text-ink"><Search className="h-4 w-4 text-brand-purple" />Find land that fits your plans</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="sr-only" htmlFor="home-search-location">Location</label>
        <select id="home-search-location" className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base" value={location} onChange={(event) => setLocation(event.target.value)}>
          <option value="">Any location</option>{locations.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="sr-only" htmlFor="home-search-budget">Maximum budget in KSh</label>
        <input id="home-search-budget" type="number" min="0" step="50000" inputMode="numeric" placeholder="Max budget (KSh)" className="rounded-md border border-gray-300 px-3 py-2.5 text-base" value={budget} onChange={(event) => setBudget(event.target.value)} />
        <label className="sr-only" htmlFor="home-search-plan">Payment preference</label>
        <select id="home-search-plan" className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base" value={plan} onChange={(event) => setPlan(event.target.value)}>
          <option value="">Any payment option</option><option value="yes">Payment plan available</option>
        </select>
        <Button type="submit" size="lg" className="w-full sm:col-span-2 lg:col-span-1"><Search className="h-4 w-4" />Find plots</Button>
      </div>
    </form>
  );
}

export function HomePage() {
  const { properties, loading, failed, retry } = useProperties();
  const { testimonials, buyingSteps } = site;
  const openEnquiry = useOpenEnquiry();

  const featuredProperties = useMemo(
    () => [...properties].sort((a, b) => featuredRank[a.status] - featuredRank[b.status]).slice(0, 4),
    [properties],
  );
  const locations = useMemo(() => [...new Set(properties.filter((property) => property.status === 'Available').map((property) => property.location.trim()).filter(Boolean))].sort(), [properties]);

  const officeDetails = [
    { icon: Building2, value: site.officeAddress },
    { icon: Clock, value: site.officeHours },
    { icon: Shield, value: site.registration },
  ].filter((detail) => detail.value);

  return (
    <div id="home" className="bg-white">
      <section className="relative overflow-hidden border-b border-gray-200 bg-tint">
        <ImageWithFallback
          src={`${HERO_IMAGE}?w=1800`}
          srcSet={`${HERO_IMAGE}?w=800 800w, ${HERO_IMAGE}?w=1200 1200w, ${HERO_IMAGE}?w=1800 1800w`}
          sizes="100vw"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20" />

        <div className="relative mx-auto flex max-w-7xl items-center px-4 py-12 md:py-16 lg:min-h-[560px] lg:px-6">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-green-bright/20 bg-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
              <CheckCircle className="h-4 w-4" />
              Land listings with clear buying guidance
            </p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              Find, Buy & Own the <span className="text-brand-purple">Perfect Land</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-700">
              Explore land listings, understand the buying process, and speak with our team before you decide.
            </p>
            <QuickPropertySearch locations={locations} />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                variant="outline"
                className="w-fit border-brand-green text-brand-green hover:bg-brand-green/5"
                onClick={() => { track('Enquiry Started', { source: 'home_hero' }); openEnquiry(); }}
              >
                Have a question? Enquire
              </Button>
              <Link to="/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple hover:underline">Browse all plots <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="mt-6 flex max-w-2xl flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
              {['Prices shown on listings', 'Request a site visit', 'Speak directly with our team'].map((benefit) => (
                <span key={benefit} className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-brand-green" />{benefit}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="properties" className="scroll-mt-24 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">Featured Properties</p>
              <h2 className="mt-2 text-3xl font-extrabold text-ink">Hand-picked land ideal for investment</h2>
              <p className="mt-2 max-w-2xl text-gray-600">
                Residential, commercial and agricultural plots in high-growth locations.
              </p>
            </div>
            <Button asChild variant="ghost" className="w-fit text-brand-purple hover:bg-brand-purple/5 hover:text-brand-purple-dark">
              <Link to="/properties">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <PropertyGrid properties={featuredProperties} loading={loading} failed={failed} onRetry={retry} />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-t border-gray-200 bg-tint py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <p className="text-center text-sm font-bold uppercase tracking-wide text-brand-purple">How It Works</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-ink">How buying land works</h2>
          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {buyingSteps.map((step, index) => (
              <li key={step.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Button size="lg" onClick={openEnquiry}>
              Ask us anything
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">About Us</p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">{site.name}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We deal in selling prime and affordable land. Our mission is to help you invest wisely and own land with confidence.
          </p>
          {officeDetails.length > 0 && (
            <ul className="mx-auto mt-6 inline-flex flex-col gap-2 text-left text-gray-700">
              {officeDetails.map((detail) => (
                <li key={detail.value} className="flex items-start gap-2">
                  <detail.icon className="mt-1 h-4 w-4 shrink-0 text-brand-green" />
                  {detail.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="why-choose-us" className="scroll-mt-24 border-y border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-brand-purple">Why Choose {site.name}?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {trustIndicators.map((indicator) => (
              <div key={indicator.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-purple/20 bg-white text-brand-purple">
                  <indicator.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-ink">{indicator.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div
          className={`mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:px-6 ${
            testimonials.length > 0 ? 'lg:grid-cols-[1fr_1fr]' : ''
          }`}
        >
          <div className="rounded-lg bg-brand-purple p-10 text-white shadow-lg">
            <h2 className="text-3xl font-bold">Ready to own a piece of land?</h2>
            <p className="mt-3 text-lg text-white/90">Let us help you find the perfect one.</p>
            <Button asChild size="lg" className="mt-8 px-8">
              <Link to="/properties">Browse All Properties</Link>
            </Button>
          </div>

          {testimonials.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-10 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">What Our Clients Say</p>
              <div className="mt-6 grid gap-6">
                {testimonials.map((testimonial) => (
                  <blockquote key={testimonial.name} className="border-l-4 border-brand-green-bright pl-5">
                    <p className="text-gray-700">"{testimonial.content}"</p>
                    <footer className="mt-3 text-sm">
                      <span className="font-bold text-ink">{testimonial.name}</span>
                      <span className="text-gray-500"> - {testimonial.role}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

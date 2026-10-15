import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle, Clock, DollarSign, Lock, MapPin, Shield, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { PropertyGrid } from './PropertyCard';
import { EnquiryForm } from './EnquiryForm';
import { ImageWithFallback } from './ImageWithFallback';
import { site } from '../../config/site';
import { useProperties } from '../../hooks/useProperties';
import type { PropertyStatus } from '../../utils/api';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef';

const trustIndicators = [
  { icon: Shield, title: 'Verified Properties', description: 'Legally checked land with clear documents.' },
  { icon: Lock, title: 'Secure Transactions', description: 'Transparent process from inquiry to transfer.' },
  { icon: DollarSign, title: 'Affordable Prices', description: 'Competitive prices with flexible plans.' },
  { icon: MapPin, title: 'Prime Locations', description: 'High-growth areas across Kenya.' },
];

// Plots that can be bought now come first; sold ones only fill any gaps
const featuredRank: Record<PropertyStatus, number> = { Available: 0, Reserved: 1, Sold: 2, Hidden: 3 };

export function HomePage() {
  const { properties, loading, failed, retry } = useProperties();
  const { testimonials, buyingSteps } = site;

  const featuredProperties = useMemo(
    () => [...properties].sort((a, b) => featuredRank[a.status] - featuredRank[b.status]).slice(0, 4),
    [properties],
  );

  const locations = useMemo(
    () => [...new Set(properties.map((property) => property.location.trim()).filter(Boolean))].sort(),
    [properties],
  );

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

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:min-h-[640px] lg:grid-cols-[1.1fr_420px] lg:px-6">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-green-bright/20 bg-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
              <CheckCircle className="h-4 w-4" />
              Verified land for secure ownership
            </p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              Find, Buy & Own the <span className="text-brand-purple">Perfect Land</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-700">
              Prime, affordable and secure land for your future. Invest today, build tomorrow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="px-8">
                <Link to="/properties">
                  View Properties
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-brand-green px-8 text-brand-green hover:bg-brand-green/5">
                <Link to="/#how-it-works">How Buying Works</Link>
              </Button>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {trustIndicators.map((indicator) => (
                <div key={indicator.title} className="rounded-lg border border-gray-200 bg-white/90 p-4 text-center shadow-sm">
                  <indicator.icon className="mx-auto mb-2 h-6 w-6 text-brand-green" />
                  <p className="text-xs font-bold leading-snug text-ink">{indicator.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="contact" className="scroll-mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow-2xl">
            <EnquiryForm
              idPrefix="home-enquiry"
              heading="Enquire About Land"
              subheading="Tell us what you are looking for and we will call you."
              locations={locations}
              showWhatsApp
            />
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
            <Button asChild size="lg">
              <Link to="/#contact">Ask us anything</Link>
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

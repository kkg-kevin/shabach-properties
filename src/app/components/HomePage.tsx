import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Lock,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { PropertyCard } from './PropertyCard';
import { ImageWithFallback } from './ImageWithFallback';
import { propertyAPI, leadAPI, errorMessage, type Property } from '../../utils/api';
import { site, whatsappUrl } from '../../config/site';

const emptyEnquiry = { name: '', phone: '', email: '', preferredLocation: '', message: '', website: '' };

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef';

export function HomePage({ onViewProperty }: { onViewProperty: (id: string) => void }) {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState(emptyEnquiry);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const properties = await propertyAPI.getAll();
      setFeaturedProperties(properties.slice(0, 4));
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await leadAPI.create(enquiry);
      toast.success('Thank you! We have received your inquiry and will call you shortly.');
      setEnquiry(emptyEnquiry);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error(errorMessage(error, 'Failed to submit inquiry. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const location = enquiry.preferredLocation ? ` in ${enquiry.preferredLocation}` : '';
    window.open(whatsappUrl(`Hello, I am interested in buying land${location}.`), '_blank', 'noopener');
  };

  const trustIndicators = [
    { icon: Shield, title: 'Verified Properties', description: 'Legally checked land with clear documents.' },
    { icon: Lock, title: 'Secure Transactions', description: 'Transparent process from inquiry to transfer.' },
    { icon: DollarSign, title: 'Affordable Prices', description: 'Competitive prices with flexible plans.' },
    { icon: MapPin, title: 'Prime Locations', description: 'High-growth areas across Kenya.' },
  ];

  const { testimonials } = site;

  const fieldClass =
    'w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#2DB34A] focus:ring-2 focus:ring-[#2DB34A]/15';

  return (
    <div id="home" className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-gray-200 bg-[#F7FAF6]">
        <ImageWithFallback
          src={`${HERO_IMAGE}?w=1800`}
          srcSet={`${HERO_IMAGE}?w=800 800w, ${HERO_IMAGE}?w=1200 1200w, ${HERO_IMAGE}?w=1800 1800w`}
          sizes="100vw"
          alt="Green land parcels"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20" />

        <div className="relative mx-auto grid min-h-[640px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_420px] lg:px-6">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2DB34A]/20 bg-white/90 px-4 py-2 text-sm font-semibold text-[#16872E] shadow-sm">
              <CheckCircle className="h-4 w-4" />
              Verified land for secure ownership
            </p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-[#111827] md:text-6xl">
              Find, Buy & Own the <span className="text-[#5E2CA5]">Perfect Land</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-700">
              Prime, affordable and secure land for your future. Invest today, build tomorrow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-md bg-[#2DB34A] px-8 hover:bg-[#23923B]">
                <Link to="/properties">
                  View Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-md border-[#2DB34A] bg-white px-8 text-[#16872E] hover:bg-[#2DB34A]/10 hover:text-[#16872E]"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </Button>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {trustIndicators.map((indicator) => (
                <div key={indicator.title} className="rounded-lg border border-gray-200 bg-white/90 p-4 text-center shadow-sm">
                  <indicator.icon className="mx-auto mb-2 h-6 w-6 text-[#2DB34A]" />
                  <p className="text-xs font-bold leading-snug text-[#111827]">{indicator.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="contact" className="scroll-mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#111827]">Enquire About Land</h2>
            <p className="mt-1 text-sm text-gray-500">Get in touch with us</p>
            <form className="mt-5 space-y-3" onSubmit={handleEnquiry}>
              {/* Hidden from people; bots that fill it in are ignored */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={enquiry.website}
                onChange={(e) => setEnquiry({ ...enquiry, website: e.target.value })}
              />
              <input
                className={fieldClass}
                type="text"
                required
                aria-label="Full Name"
                placeholder="Full Name"
                value={enquiry.name}
                onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
              />
              <input
                className={fieldClass}
                type="tel"
                required
                aria-label="Phone Number"
                placeholder="Phone Number"
                value={enquiry.phone}
                onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
              />
              <input
                className={fieldClass}
                type="email"
                aria-label="Email Address"
                placeholder="Email Address (optional)"
                value={enquiry.email}
                onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
              />
              <select
                className={fieldClass}
                aria-label="Preferred Location"
                value={enquiry.preferredLocation}
                onChange={(e) => setEnquiry({ ...enquiry, preferredLocation: e.target.value })}
              >
                <option value="">Preferred Location</option>
                <option>Kitengela</option>
                <option>Kamulu</option>
                <option>Ngong</option>
                <option>Juja</option>
              </select>
              <textarea
                className={fieldClass}
                rows={4}
                aria-label="Message"
                placeholder="Message (optional)"
                value={enquiry.message}
                onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-[#2DB34A] hover:bg-[#23923B]"
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
              <Button
                type="button"
                onClick={handleWhatsApp}
                className="w-full rounded-md bg-[#5E2CA5] hover:bg-[#4C2388]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </Button>
              <p className="text-xs text-gray-500">
                We only use your details to contact you about this inquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section id="properties" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#5E2CA5]">Featured Properties</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Hand-picked land ideal for investment</h2>
              <p className="mt-2 max-w-2xl text-gray-600">
                Residential, commercial and agricultural plots in high-growth locations.
              </p>
            </div>
            <Button asChild variant="ghost" className="w-fit text-[#5E2CA5] hover:bg-[#5E2CA5]/5 hover:text-[#3F1E72]">
              <Link to="/properties">View All Properties</Link>
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#2DB34A]" />
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">No properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  onClick={() => onViewProperty(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[#5E2CA5]">About Us</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#111827]">Shabach Properties Ltd</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We deal in selling prime and affordable land. Our mission is to help you invest wisely and own land with confidence.
          </p>
        </div>
      </section>

      <section id="why-choose-us" className="scroll-mt-20 border-y border-gray-200 bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#5E2CA5]">
            Why Choose Shabach Properties Ltd?
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {trustIndicators.map((indicator) => (
              <div key={indicator.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#5E2CA5]/20 bg-white text-[#5E2CA5]">
                  <indicator.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827]">{indicator.title}</h3>
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
          <div className="rounded-lg bg-[#5E2CA5] p-10 text-white shadow-lg">
            <h2 className="text-3xl font-bold">Ready to own a piece of land?</h2>
            <p className="mt-3 text-lg text-white/90">Let us help you find the perfect one.</p>
            <Button asChild className="mt-8 rounded-md bg-[#2DB34A] px-8 hover:bg-[#23923B]">
              <Link to="/properties">Browse All Properties</Link>
            </Button>
          </div>

          {testimonials.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-10 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-[#5E2CA5]">What Our Clients Say</p>
            <div className="mt-6 grid gap-6">
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.name} className="border-l-4 border-[#2DB34A] pl-5">
                  <p className="text-gray-700">"{testimonial.content}"</p>
                  <footer className="mt-3 text-sm">
                    <span className="font-bold text-[#111827]">{testimonial.name}</span>
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

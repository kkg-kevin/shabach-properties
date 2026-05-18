import { useState, useEffect } from 'react';
import { CheckCircle, Shield, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { PropertyCard } from './PropertyCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { propertyAPI } from '../../utils/api';
import { initializeSampleData } from '../../utils/sampleData';

export function HomePage({ onViewProperty }: { onViewProperty: (id: string) => void }) {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAndLoadProperties();
  }, []);

  const initializeAndLoadProperties = async () => {
    try {
      await initializeSampleData();
      await loadProperties();
    } catch (error) {
      console.error('Failed to initialize:', error);
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const properties = await propertyAPI.getAll();
      setFeaturedProperties(properties.slice(0, 6));
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const trustIndicators = [
    {
      icon: CheckCircle,
      title: 'Verified Properties',
      description: 'All our lands are verified and legally documented',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Safe and transparent buying process',
    },
    {
      icon: DollarSign,
      title: 'Affordable Prices',
      description: 'Competitive pricing with flexible payment plans',
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Strategic locations across Kenya',
    },
  ];

  const testimonials = [
    {
      name: 'John Kamau',
      role: 'Property Owner',
      content: 'Shabach Properties made my dream of owning land a reality. The process was smooth and transparent.',
      rating: 5,
    },
    {
      name: 'Mary Wanjiku',
      role: 'Investor',
      content: 'Professional service and prime locations. I highly recommend Shabach Properties for land investment.',
      rating: 5,
    },
    {
      name: 'Peter Odhiambo',
      role: 'First-time Buyer',
      content: 'The team was very supportive throughout. They helped me understand every step of the process.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E2CA5]/90 to-[#1E3A8A]/80 z-10" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600"
          alt="Land"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find, Buy & Own the Perfect Land
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
            Discover prime land opportunities across Kenya. Your journey to property ownership starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#2DB34A] hover:bg-[#2DB34A]/90 text-lg px-8 py-6"
              onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Properties
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white hover:text-[#5E2CA5] text-lg px-8 py-6"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-[#5E2CA5]/10 rounded-full flex items-center justify-center mb-4">
                  <indicator.icon className="w-8 h-8 text-[#5E2CA5]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{indicator.title}</h3>
                <p className="text-gray-600 text-sm">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our handpicked selection of prime land available for purchase
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E2CA5] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#5E2CA5] to-[#1E3A8A] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Own a Piece of Land?
          </h2>
          <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Let us help you find the perfect property that matches your needs and budget
          </p>
          <Button
            size="lg"
            className="bg-[#2DB34A] hover:bg-[#2DB34A]/90 text-lg px-8 py-6"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 text-lg">
              Real experiences from satisfied property owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#F59E0B] text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-gray-600 text-lg">
              Have questions? We're here to help you find your perfect property
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5E2CA5] focus:border-transparent outline-none resize-none"
                  placeholder="Tell us about your land requirements..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#5E2CA5] hover:bg-[#5E2CA5]/90 text-lg"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

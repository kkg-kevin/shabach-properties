import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Home, CheckCircle, Calendar, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { propertyAPI, leadAPI } from '../../utils/api';
import { toast } from 'sonner';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

export function PropertyDetail({ propertyId, onBack }: PropertyDetailProps) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyAPI.getById(propertyId);
      setProperty(data);
    } catch (error) {
      console.error('Failed to load property:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await leadAPI.create({
        ...formData,
        propertyId,
        propertyTitle: property?.title,
      });
      toast.success('Your inquiry has been submitted successfully!');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hello, I am interested in ${property?.title} located in ${property?.location}. Price: KSh ${property?.price}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/254700000000?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DB34A] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Property not found</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const images = property.images?.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200'];

  const features = property.features || [
    'Clear Title Deed',
    'Road Access',
    'Water Available',
    'Electricity Nearby',
    'Secure Location',
    'Ready for Development',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden rounded-t-xl">
                  <ImageWithFallback
                    src={images[selectedImage]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-[#2DB34A]'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      property.status === 'Available'
                        ? 'bg-[#2DB34A] text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {property.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#2DB34A]" />
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-semibold">{property.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#2DB34A]" />
                    <div>
                      <p className="text-sm text-gray-500">Listed</p>
                      <p className="font-semibold">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description ||
                      'Prime land available for sale in a strategic location. Perfect for residential or commercial development. Clean title deed with all necessary documentation in place.'}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#2DB34A]" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-[#2DB34A]/10 to-[#1E3A8A]/10 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-16 h-16 text-[#2DB34A] mx-auto mb-4" />
                    <h4 className="text-xl font-semibold mb-2">{property.location}</h4>
                    <p className="text-gray-600">
                      Exact location coordinates will be shared during your site visit
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">
                  To enable interactive maps, configure your Google Maps API key in the settings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-4xl font-bold text-[#16872E]">
                    KSh {property.price}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-lg h-12"
                  >
                    <MessageSquare className="mr-2 w-5 h-5" />
                    Chat on WhatsApp
                  </Button>
                  <Button
                    onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-[#1E3A8A] hover:bg-[#172E70] text-lg h-12"
                  >
                    Book Site Visit
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Contact Us</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>+254 700 000 000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>info@shabachproperties.co.ke</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiry Form */}
            <Card id="inquiry-form">
              <CardHeader>
                <CardTitle>Send Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2DB34A]/20 focus:border-[#2DB34A] outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2DB34A]/20 focus:border-[#2DB34A] outline-none"
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2DB34A]/20 focus:border-[#2DB34A] outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2DB34A]/20 focus:border-[#2DB34A] outline-none resize-none"
                      placeholder="Tell us about your interest..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#2DB34A] hover:bg-[#23923B]"
                  >
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

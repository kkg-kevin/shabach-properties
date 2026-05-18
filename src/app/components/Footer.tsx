import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Shabach Properties Ltd</h3>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted partner in finding and owning the perfect land in Kenya.
              We specialize in prime locations with verified ownership.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-[#F59E0B] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#F59E0B] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#F59E0B] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#F59E0B] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#properties" className="text-gray-300 hover:text-white transition-colors">
                  Properties
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Land Sales</li>
              <li>Property Verification</li>
              <li>Site Visits</li>
              <li>Documentation Assistance</li>
              <li>After-Sales Support</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">info@shabachproperties.co.ke</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Shabach Properties Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

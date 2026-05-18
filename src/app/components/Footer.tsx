import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-[#111827]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-extrabold uppercase text-[#5E2CA5]">Shabach Properties Ltd</h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              We deal in selling prime and affordable land. Our mission is to help you invest wisely and own land with confidence.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="rounded-full bg-[#1E3A8A] p-2 text-white transition-colors hover:bg-[#172E70]">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-[#F59E0B] p-2 text-white transition-colors hover:bg-[#D88707]">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-[#2DB34A] p-2 text-white transition-colors hover:bg-[#23923B]">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase text-[#5E2CA5]">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {['Home', 'Properties', 'About Us', 'Why Choose Us', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 transition-colors hover:text-[#2DB34A]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase text-[#5E2CA5]">Properties</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Residential Plots</li>
              <li>Commercial Plots</li>
              <li>Agricultural Land</li>
              <li>Buy & Build Packages</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase text-[#5E2CA5]">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2DB34A]" />
                <span className="text-gray-600">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#2DB34A]" />
                <span className="text-gray-600">+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#2DB34A]" />
                <span className="text-gray-600">info@shabachproperties.co.ke</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#5E2CA5] px-4 py-4 text-center text-xs text-white">
        <p>&copy; {new Date().getFullYear()} Shabach Properties Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}

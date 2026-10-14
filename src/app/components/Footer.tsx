import { Link } from 'react-router';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { site } from '../../config/site';

const quickLinks = [
  { name: 'Home', href: '/#home' },
  { name: 'Properties', href: '/properties' },
  { name: 'About Us', href: '/#about' },
  { name: 'Why Choose Us', href: '/#why-choose-us' },
  { name: 'Contact Us', href: '/#contact' },
];

const socialLinks = [
  { name: 'Facebook', href: site.social.facebook, icon: Facebook, className: 'bg-[#1E3A8A] hover:bg-[#172E70]' },
  { name: 'Instagram', href: site.social.instagram, icon: Instagram, className: 'bg-[#F59E0B] hover:bg-[#D88707]' },
  { name: 'LinkedIn', href: site.social.linkedin, icon: Linkedin, className: 'bg-[#2DB34A] hover:bg-[#23923B]' },
].filter((link) => link.href);

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
            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className={`rounded-full p-2 text-white transition-colors ${link.className}`}
                  >
                    <link.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase text-[#5E2CA5]">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-600 transition-colors hover:text-[#2DB34A]">
                    {item.name}
                  </Link>
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
                <span className="text-gray-600">{site.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#2DB34A]" />
                <a href={site.phoneHref} className="text-gray-600 hover:text-[#2DB34A]">{site.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#2DB34A]" />
                <a href={`mailto:${site.email}`} className="text-gray-600 hover:text-[#2DB34A]">{site.email}</a>
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

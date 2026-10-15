import { useMemo } from 'react';
import { Link } from 'react-router';
import { Building2, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { navigation } from './Header';
import { site } from '../../config/site';
import { useProperties } from '../../hooks/useProperties';

const socialLinks = [
  { name: 'Facebook', href: site.social.facebook, icon: Facebook },
  { name: 'Instagram', href: site.social.instagram, icon: Instagram },
  { name: 'LinkedIn', href: site.social.linkedin, icon: Linkedin },
].filter((link) => link.href);

const linkClass = 'text-gray-600 transition-colors hover:text-brand-green';

export function Footer() {
  const { properties } = useProperties();

  // The areas with the most plots on sale, each linking to its filtered list
  const topLocations = useMemo(() => {
    const counts = new Map<string, number>();
    properties
      .filter((property) => property.status !== 'Sold')
      .forEach((property) => {
        const location = property.location.trim();
        counts.set(location, (counts.get(location) ?? 0) + 1);
      });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([location]) => location);
  }, [properties]);

  const browseLinks = [
    { name: 'All properties', href: '/properties' },
    { name: 'Available now', href: '/properties?status=Available' },
    ...topLocations.map((location) => ({
      name: `Land in ${location}`,
      href: `/properties?location=${encodeURIComponent(location)}`,
    })),
  ];

  return (
    <footer className="border-t border-gray-200 bg-white text-ink">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase text-brand-purple">{site.name}</h2>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              We deal in selling prime and affordable land. Our mission is to help you invest wisely and own land with confidence.
            </p>
            {site.registration && <p className="mt-3 text-xs text-gray-500">{site.registration}</p>}
            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="rounded-full bg-brand-purple p-2 text-white transition-colors hover:bg-brand-purple-hover"
                  >
                    <link.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-extrabold uppercase text-brand-purple">Quick Links</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Browse land">
            <h2 className="text-sm font-extrabold uppercase text-brand-purple">Browse Land</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {browseLinks.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-extrabold uppercase text-brand-purple">Contact Us</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                {site.officeAddress ? (
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                )}
                <span className="text-gray-600">{site.officeAddress || site.address}</span>
              </li>
              {site.officeHours && (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  <span className="text-gray-600">{site.officeHours}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-green" />
                <a href={site.phoneHref} className={linkClass}>
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-green" />
                <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-brand-purple px-4 py-4 text-center text-xs text-white">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          <span aria-hidden="true"> · </span>
          <Link to="/privacy" className="underline underline-offset-2 hover:text-white/80">
            Privacy notice
          </Link>
        </p>
      </div>
    </footer>
  );
}

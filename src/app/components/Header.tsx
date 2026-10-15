import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Phone, X } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../../assets/images/logo.jpg';
import { site } from '../../config/site';
import { useOpenEnquiry } from './EnquiryDialog';

export const navigation = [
  { name: 'Home', href: '/#home' },
  { name: 'Properties', href: '/properties' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'About Us', href: '/#about' },
  { name: 'Contact', href: '/#contact' },
];

// "Contact" opens the enquiry form over the current page instead of leaving it
export function NavItem({
  item,
  className,
  current = false,
  onSelect,
}: {
  item: (typeof navigation)[number];
  className: string;
  current?: boolean;
  onSelect?: () => void;
}) {
  const openEnquiry = useOpenEnquiry();

  if (item.href === '/#contact') {
    return (
      <button
        type="button"
        className={`text-left ${className}`}
        onClick={() => {
          onSelect?.();
          openEnquiry();
        }}
      >
        {item.name}
      </button>
    );
  }
  return (
    <Link to={item.href} className={className} aria-current={current ? 'page' : undefined} onClick={onSelect}>
      {item.name}
    </Link>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname, hash, key } = useLocation();

  // Close the menu whenever the page changes, however that happened
  useEffect(() => setIsMenuOpen(false), [key]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setIsMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const isCurrent = (href: string) => {
    const [path, section] = href.split('#');
    if (path === '/properties') return pathname.startsWith('/properties');
    return pathname === '/' && (section === 'home' ? !hash || hash === '#home' : hash === `#${section}`);
  };

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors hover:text-brand-green ${
      isCurrent(href) ? 'text-brand-green' : 'text-gray-700'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-3 md:h-20">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#9A8A00] bg-white shadow-sm md:h-14 md:w-14">
              <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover md:h-10 md:w-10" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-bold text-ink md:text-xl">Shabach Properties</span>
              <span className="text-xs font-medium uppercase tracking-wide text-brand-purple">Real Estate & Land</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} className={linkClass(item.href)} current={isCurrent(item.href)} />
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a href={site.phoneHref} className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600 hover:text-brand-green">
              <Phone className="h-4 w-4 text-brand-green" />
              <span>{site.phoneDisplay}</span>
            </a>
            <Button asChild variant="secondary">
              <a href={site.phoneHref}>Call Us</a>
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {/* Calling is the main way buyers reach the team, so it stays one tap away */}
            <a
              href={site.phoneHref}
              className="rounded-full p-2.5 text-brand-green hover:bg-gray-100"
              aria-label={`Call us on ${site.phoneDisplay}`}
            >
              <Phone className="h-6 w-6" />
            </a>
            <button
              type="button"
              className="rounded-full p-2.5 hover:bg-gray-100 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav id="mobile-menu" className="border-t py-4 md:hidden" aria-label="Main">
            <div className="flex flex-col">
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  className={`py-3 ${linkClass(item.href)}`}
                  current={isCurrent(item.href)}
                  onSelect={() => setIsMenuOpen(false)}
                />
              ))}
            </div>
            <Button asChild variant="secondary" size="lg" className="mt-3 w-full">
              <a href={site.phoneHref}>
                <Phone className="h-4 w-4" />
                Call {site.phoneDisplay}
              </a>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

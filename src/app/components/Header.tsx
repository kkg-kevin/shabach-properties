import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, Phone, X } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../../assets/images/logo.jpg';
import { site } from '../../config/site';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/#home' },
    { name: 'Properties', href: '/properties' },
    { name: 'About Us', href: '/#about' },
    { name: 'Why Choose Us', href: '/#why-choose-us' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#9A8A00] bg-white shadow-sm">
              <img src={logo} alt="Shabach Properties Logo" className="h-10 w-10 rounded-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#111827]">Shabach Properties</span>
              <span className="text-xs font-medium uppercase tracking-wide text-[#5E2CA5]">Real Estate & Land</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-semibold text-gray-700 transition-colors hover:text-[#2DB34A]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a href={site.phoneHref} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2DB34A]">
              <Phone className="h-4 w-4 text-[#2DB34A]" />
              <span>{site.phoneDisplay}</span>
            </a>
            <Button asChild className="rounded-md bg-[#1E3A8A] hover:bg-[#172E70]">
              <a href={site.phoneHref}>Call Us</a>
            </Button>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-[#2DB34A]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="space-y-2 border-t pt-4">
                <a href={site.phoneHref} className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-[#2DB34A]" />
                  <span>{site.phoneDisplay}</span>
                </a>
                <Button asChild className="w-full rounded-md bg-[#1E3A8A] hover:bg-[#172E70]">
                  <a href={site.phoneHref}>Call Us</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

import { Link } from 'react-router';
import { Button } from './ui/button';
import { usePageTitle } from '../../hooks/usePageTitle';

export function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-brand-purple">Page not found</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">We could not find that page</h1>
      <p className="mt-3 text-gray-600">The link may be out of date or mistyped.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/properties">Browse properties</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { EnquiryForm } from './EnquiryForm';
import { useProperties } from '../../hooks/useProperties';

const OpenEnquiryContext = createContext<() => void>(() => {});

// Opens the enquiry form from anywhere on the public site
export function useOpenEnquiry() {
  return useContext(OpenEnquiryContext);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex="0"]';

// The general enquiry form, shown only when asked for: a sheet from the bottom
// on phones, a centred dialog on larger screens. It stays mounted while closed,
// so anything typed is still there when it is opened again.
export function EnquiryDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { properties } = useProperties();
  const location = useLocation();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const locations = useMemo(
    () => [...new Set(properties.map((property) => property.location.trim()).filter(Boolean))].sort(),
    [properties],
  );

  const openDialog = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  // Links to /#contact, including old and shared ones, open the form
  useEffect(() => {
    if (location.hash !== '#contact') return;
    openDialog();
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, preventScrollReset: true });
  }, [location.key]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Straight to the first field (or the thank-you message after sending), not the Close button
    requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLElement>('form input:not([tabindex="-1"]), [role="status"] h3')?.focus(),
    );

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      // Keep Tab inside the dialog
      if (event.key !== 'Tab' || !dialog.current) return;
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => item.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <OpenEnquiryContext.Provider value={openDialog}>
      {children}

      <div className={open ? 'fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4' : 'hidden'}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-dialog-heading"
          className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 rounded-full p-2 text-gray-500 outline-none hover:bg-gray-100 hover:text-ink focus-visible:ring-4 focus-visible:ring-brand-green-bright/40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <EnquiryForm
            idPrefix="enquiry-dialog"
            heading="Enquire About Land"
            subheading="Tell us what you are looking for and we will call you."
            locations={locations}
            showWhatsApp
          />
        </div>
      </div>
    </OpenEnquiryContext.Provider>
  );
}

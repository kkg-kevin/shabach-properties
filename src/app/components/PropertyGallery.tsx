import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { thumbnailUrl } from '../../utils/api';

const SWIPE_PX = 40;

// Calls back with -1 or 1 when the user swipes right or left on the element
function useSwipe(onSwipe: (direction: -1 | 1) => void) {
  const startX = useRef<number | null>(null);
  return {
    onTouchStart: (event: React.TouchEvent) => {
      startX.current = event.touches[0].clientX;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (startX.current === null) return;
      const distance = event.changedTouches[0].clientX - startX.current;
      startX.current = null;
      if (Math.abs(distance) > SWIPE_PX) onSwipe(distance < 0 ? 1 : -1);
    },
  };
}

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-md transition hover:bg-white focus-visible:ring-4 focus-visible:ring-brand-green-bright/50 outline-none';

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const step = (direction: -1 | 1) => setIndex((current) => (current + direction + count) % count);
  const swipe = useSwipe(step);

  // Back to the cover only when the photos themselves change, not on every refresh
  const imagesKey = images.join('\n');
  useEffect(() => setIndex(0), [imagesKey]);

  useEffect(() => {
    if (!fullScreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullScreen(false);
      if (event.key === 'ArrowLeft' && count > 1) step(-1);
      if (event.key === 'ArrowRight' && count > 1) step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      openButton.current?.focus({ preventScroll: true });
    };
  }, [fullScreen, count]);

  if (count === 0) {
    return <PhotoPlaceholder className="aspect-video w-full rounded-xl border border-gray-200" />;
  }

  const photoLabel = (position: number) => `Photo ${position + 1} of ${count}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-video bg-gray-100" {...swipe}>
        <button
          ref={openButton}
          type="button"
          onClick={() => setFullScreen(true)}
          className="block h-full w-full cursor-zoom-in"
          aria-label={`View ${photoLabel(index).toLowerCase()} full screen`}
        >
          <ImageWithFallback src={images[index]} alt={`${title}, ${photoLabel(index).toLowerCase()}`} className="h-full w-full object-cover" />
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} className={`${arrowClass} left-3`} aria-label="Previous photo">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => step(1)} className={`${arrowClass} right-3`} aria-label="Next photo">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
          <Expand className="h-3.5 w-3.5" />
          {count > 1 ? `${index + 1} / ${count}` : 'Full screen'}
        </span>
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {images.map((image, position) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show ${photoLabel(position).toLowerCase()}`}
              aria-current={position === index ? 'true' : undefined}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 outline-none transition focus-visible:ring-4 focus-visible:ring-brand-green-bright/40 ${
                position === index ? 'border-brand-green' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <ImageWithFallback
                src={thumbnailUrl(image)}
                fallbackSrc={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {fullScreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          onClick={(event) => event.target === event.currentTarget && setFullScreen(false)}
          {...swipe}
        >
          <ImageWithFallback
            src={images[index]}
            alt={`${title}, ${photoLabel(index).toLowerCase()}`}
            className="max-h-full max-w-full object-contain"
          />
          <button
            ref={closeButton}
            type="button"
            onClick={() => setFullScreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white outline-none hover:bg-white/25 focus-visible:ring-4 focus-visible:ring-white/50"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} className={`${arrowClass} left-4`} aria-label="Previous photo">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => step(1)} className={`${arrowClass} right-4`} aria-label="Next photo">
                <ChevronRight className="h-6 w-6" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white" aria-live="polite">
                {photoLabel(index)}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

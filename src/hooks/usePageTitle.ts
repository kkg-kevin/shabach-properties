import { useEffect } from 'react';

const BASE_TITLE = 'Shabach Properties Ltd';

// Sets the browser tab title for the current page and restores it on leave
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} | ${BASE_TITLE}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

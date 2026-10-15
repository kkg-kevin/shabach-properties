import { useEffect, useSyncExternalStore } from 'react';
import { propertyAPI, type Property } from '../utils/api';

// One shared copy of the public property list. Pages show it straight away,
// so going back to the listings is instant, and refresh it in the background.

interface State {
  properties: Property[] | null;
  failed: boolean;
}

// The API response is cached for a minute too, so refreshing more often gains nothing
const FRESH_MS = 60_000;

let state: State = { properties: null, failed: false };
let fetchedAt = 0;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function refreshProperties(force = false) {
  if (pending) return pending;
  if (!force && state.properties && Date.now() - fetchedAt < FRESH_MS) return Promise.resolve();

  if (state.failed) setState({ ...state, failed: false });
  pending = propertyAPI
    .getAll()
    .then((properties) => {
      fetchedAt = Date.now();
      setState({ properties, failed: false });
    })
    .catch((error) => {
      console.error('Failed to load properties:', error);
      // Keep showing the last good list if there is one
      setState({ ...state, failed: true });
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

// The property as last seen in the list, to show while its page loads
export function cachedProperty(id: string) {
  return state.properties?.find((property) => property.id === id) ?? null;
}

export function useProperties() {
  const current = useSyncExternalStore(subscribe, () => state);

  useEffect(() => {
    refreshProperties();
  }, []);

  return {
    properties: current.properties ?? [],
    loading: !current.properties && !current.failed,
    failed: current.failed && !current.properties,
    retry: () => refreshProperties(true),
  };
}

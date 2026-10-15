import { HttpError, text, textList } from './http.js';
import type { PropertyInput } from './store.js';

const STATUSES = ['Available', 'Reserved', 'Sold', 'Hidden'];

// "KSh 1,500,000", "1.5M" or "750k" -> "1500000". Prices are stored as plain
// digits so they sort correctly and can be formatted the same way everywhere.
export function parsePrice(value: unknown): string {
  const raw = text(value, 'Price', 40, true)
    .toLowerCase()
    .replace(/[,\s]/g, '')
    .replace(/^(kshs?|kes)\.?/, '');
  const match = raw.match(/^(\d+(?:\.\d+)?)(k|m|million)?$/);
  const amount = match ? Math.round(Number(match[1]) * (match[2] === 'k' ? 1e3 : match[2] ? 1e6 : 1)) : 0;
  if (!amount) {
    throw new HttpError(400, 'Enter the price as a number, e.g. 1,500,000');
  }
  return String(amount);
}

// "1500000" -> "KSh 1,500,000"; anything saved before prices were normalised is shown as typed
export function formatPrice(price: string): string {
  const plain = price.replace(/^\s*(kshs?|kes)\.?\s*/i, '');
  return /^\d+$/.test(plain) ? `KSh ${Number(plain).toLocaleString('en-KE')}` : `KSh ${plain}`;
}

export function parseProperty(input: Record<string, unknown>): PropertyInput {
  const status = text(input.status, 'Status', 20) || 'Available';
  if (!STATUSES.includes(status)) {
    throw new HttpError(400, 'Status must be Available, Reserved, Sold or Hidden');
  }

  const images = textList(input.images, 'Images', 12, 2000);
  if (images.some((url) => !/^https?:\/\//i.test(url))) {
    throw new HttpError(400, 'Image links must start with http:// or https://');
  }

  const mapUrl = text(input.mapUrl, 'Map link', 2000);
  if (mapUrl && !/^https:\/\//i.test(mapUrl)) {
    throw new HttpError(400, 'The map link must start with https://');
  }

  return {
    title: text(input.title, 'Title', 150, true),
    location: text(input.location, 'Location', 150, true),
    price: parsePrice(input.price),
    size: text(input.size, 'Size', 80, true),
    description: text(input.description, 'Description', 5000),
    status,
    images,
    features: textList(input.features, 'Features', 30, 150),
    paymentPlan: text(input.paymentPlan, 'Payment plan', 300),
    titleStatus: text(input.titleStatus, 'Title status', 100),
    mapUrl,
  };
}

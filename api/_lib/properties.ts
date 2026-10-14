import { HttpError, text, textList } from './http.js';
import type { PropertyInput } from './store.js';

const STATUSES = ['Available', 'Sold'];

export function parseProperty(input: Record<string, unknown>): PropertyInput {
  const status = text(input.status, 'Status', 20) || 'Available';
  if (!STATUSES.includes(status)) {
    throw new HttpError(400, 'Status must be Available or Sold');
  }

  const images = textList(input.images, 'Images', 12, 2000);
  if (images.some((url) => !/^https?:\/\//i.test(url))) {
    throw new HttpError(400, 'Image links must start with http:// or https://');
  }

  return {
    title: text(input.title, 'Title', 150, true),
    location: text(input.location, 'Location', 150, true),
    price: text(input.price, 'Price', 40, true),
    size: text(input.size, 'Size', 80, true),
    description: text(input.description, 'Description', 5000),
    status,
    images,
    features: textList(input.features, 'Features', 30, 150),
  };
}

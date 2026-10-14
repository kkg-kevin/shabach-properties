import type { VercelRequest } from '@vercel/node';
import { HttpError } from './http.js';
import { countHits, recordHit } from './store.js';

export { recordHit };

export function clientKey(req: VercelRequest, bucket: string): string {
  const forwarded = req.headers['x-real-ip'] ?? req.headers['x-forwarded-for'] ?? 'unknown';
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
  return `${bucket}:${ip}`;
}

export async function assertUnderLimit(key: string, max: number, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000);
  if ((await countHits(key, since)) >= max) {
    throw new HttpError(429, 'Too many attempts. Please try again later.');
  }
}

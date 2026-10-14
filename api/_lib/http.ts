import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdmin } from './auth.js';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

// Wraps a handler so every response has the { success, data | error } shape
export function route(handlers: Record<string, Handler>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const handler = handlers[req.method ?? ''];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
      const data = await handler(req, res);
      return res.status(req.method === 'POST' ? 201 : 200).json({ success: true, data });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ success: false, error: error.message });
      }
      console.error(`${req.method} ${req.url} failed:`, error);
      return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
    }
  };
}

export function requireAdmin(req: VercelRequest) {
  if (!isAdmin(req)) {
    throw new HttpError(401, 'Please sign in');
  }
}

export function body(req: VercelRequest): Record<string, unknown> {
  let value = req.body;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      value = null;
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Invalid request body');
  }
  return value as Record<string, unknown>;
}

export function text(value: unknown, field: string, max: number, required = false): string {
  const result = typeof value === 'string' ? value.trim() : '';
  if (required && !result) {
    throw new HttpError(400, `${field} is required`);
  }
  if (result.length > max) {
    throw new HttpError(400, `${field} is too long`);
  }
  return result;
}

export function textList(value: unknown, field: string, maxItems: number, maxLength: number): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${field} must be a list`);
  }
  const items = value.map((item) => text(item, field, maxLength)).filter(Boolean);
  if (items.length > maxItems) {
    throw new HttpError(400, `${field} has too many entries`);
  }
  return items;
}

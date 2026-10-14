import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'shabach_admin';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }
  return password;
}

// Derived from the password, so changing the password signs everyone out
function signingKey(): Buffer {
  return createHash('sha256').update(`shabach-session:${adminPassword()}`).digest();
}

function sign(value: string): string {
  return createHmac('sha256', signingKey()).update(value).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = createHash('sha256').update(a).digest();
  const bufferB = createHash('sha256').update(b).digest();
  return timingSafeEqual(bufferA, bufferB);
}

export function checkPassword(candidate: unknown): boolean {
  return typeof candidate === 'string' && safeEqual(candidate, adminPassword());
}

function cookie(value: string, maxAge: number): string {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function startSession(res: VercelResponse) {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  res.setHeader('Set-Cookie', cookie(`${expires}.${sign(expires)}`, SESSION_SECONDS));
}

export function endSession(res: VercelResponse) {
  res.setHeader('Set-Cookie', cookie('', 0));
}

export function isAdmin(req: VercelRequest): boolean {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return false;

  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;

  return Number(expires) > Date.now() / 1000;
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listProperties } from './_lib/store.js';

// Serves /robots.txt and /sitemap.xml (see vercel.json). Both need the site's
// full address, which is only known from the request.

const PAGES = ['/', '/properties', '/privacy'];

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function robots(origin: string) {
  // Search engines must be able to load the property list to see the listings
  return [
    'User-agent: *',
    'Allow: /api/properties',
    'Disallow: /api/',
    'Disallow: /admin',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

async function sitemap(origin: string) {
  let properties: Awaited<ReturnType<typeof listProperties>> = [];
  try {
    properties = await listProperties();
  } catch (error) {
    console.error('Sitemap could not list properties:', error);
  }

  const urls = [
    ...PAGES.map((path) => `<url><loc>${escapeXml(origin + path)}</loc></url>`),
    ...properties.map(
      (property) =>
        `<url><loc>${escapeXml(`${origin}/properties/${property.id}`)}</loc>` +
        `<lastmod>${escapeXml((property.updatedAt || property.createdAt).slice(0, 10))}</lastmod></url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = `https://${req.headers.host}`;
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');

  if (req.query.file === 'robots') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(robots(origin));
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.status(200).send(await sitemap(origin));
}

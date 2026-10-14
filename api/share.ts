import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProperty, isId } from './_lib/store.js';

// Link-preview page for a property. vercel.json sends WhatsApp, Facebook and
// similar preview bots here; real visitors always get the normal site.

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = `https://${req.headers.host}`;
  let title = 'Shabach Properties Ltd | Prime & Affordable Land for Sale in Kenya';
  let description = 'Prime, affordable and verified land in Kenya. Browse available plots and book a site visit.';
  let image = '';
  let url = `${origin}/properties`;

  try {
    const { id } = req.query;
    const property = isId(id) ? await getProperty(id) : null;
    if (property) {
      title = `${property.title} - KSh ${property.price} | Shabach Properties`;
      description = [property.location, property.size, property.description].filter(Boolean).join(' · ').slice(0, 300);
      url = `${origin}/properties/${id}`;
      image = property.images[0] ?? '';
    }
  } catch (error) {
    console.error(`GET ${req.url} failed:`, error);
  }

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Shabach Properties Ltd">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    image && `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
  ].filter(Boolean);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
  return res
    .status(200)
    .send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${tags.join('')}</head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></body></html>`);
}

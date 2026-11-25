import type { VercelRequest, VercelResponse } from '@vercel/node';
import { formatPrice } from './_lib/properties.js';
import { getProperty, isId } from './_lib/store.js';

// Link-preview page for a property. vercel.json sends WhatsApp, Facebook and
// similar preview bots here; real visitors always get the normal site.

// Same picture as the home page's og:image, used when there is no property photo
const SITE_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=630&fit=crop';

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
  let description = 'Browse land listings in Kenya, review the buying process, and book a site visit.';
  let image = SITE_IMAGE;
  let url = `${origin}/properties`;
  let price = '';

  try {
    const { id } = req.query;
    const property = isId(id) ? await getProperty(id) : null;
    if (property && property.status !== 'Hidden') {
      title = `${property.title} - ${formatPrice(property.price)} | Shabach Properties`;
      price = formatPrice(property.price);
      description = [property.location, property.size, property.description].filter(Boolean).join(' · ').slice(0, 300);
      url = `${origin}/properties/${id}`;
      // A property without photos gets a text-only preview rather than a stock photo
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
    price && `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'RealEstateListing', name: title, url, image, offers: { '@type': 'Offer', price: propertyPrice(price), priceCurrency: 'KES' } }).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
  return res
    .status(200)
    .send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${tags.join('')}</head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${price ? `<p>${escapeHtml(price)}</p>` : ''}<a href="${escapeHtml(url)}">View property details</a></main></body></html>`);
}

function propertyPrice(price: string) {
  return price.replace(/[^\d]/g, '');
}

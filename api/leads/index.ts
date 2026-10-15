import { waitUntil } from '@vercel/functions';
import { HttpError, body, forField, requireAdmin, route, text } from '../_lib/http.js';
import { notifyNewLead } from '../_lib/notify.js';
import { assertUnderLimit, clientKey, recordHit } from '../_lib/rateLimit.js';
import { createLead, listLeads } from '../_lib/store.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Optional preferred site-visit date, "YYYY-MM-DD", from today up to a year ahead
function visitDate(value: unknown): string {
  const date = text(value, 'Visit date', 10);
  if (!date) return '';

  const time = Date.parse(`${date}T00:00:00Z`);
  // A day of slack either side covers visitors in other time zones
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(time) || time < Date.now() - 2 * DAY_MS) {
    throw new HttpError(400, 'Please choose a visit date from today onwards');
  }
  if (time > Date.now() + 366 * DAY_MS) {
    throw new HttpError(400, 'Please choose a visit date within the next year');
  }
  return date;
}

export default route({
  GET: async (req) => {
    requireAdmin(req);
    return listLeads();
  },

  // Public: submitted from the enquiry forms
  POST: async (req) => {
    const input = body(req);

    // Hidden form field that only bots fill in: accept and discard
    if (text(input.website, 'Website', 500)) {
      return { id: '' };
    }

    const lead = {
      name: forField('name', () => text(input.name, 'Name', 120, true)),
      phone: forField('phone', () => {
        const phone = text(input.phone, 'Phone number', 30, true);
        if (!/^\+?[\d\s()-]{7,}$/.test(phone)) {
          throw new HttpError(400, 'Please enter a valid phone number');
        }
        return phone;
      }),
      email: forField('email', () => {
        const email = text(input.email, 'Email', 200);
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new HttpError(400, 'Please enter a valid email address');
        }
        return email;
      }),
      message: forField('message', () => text(input.message, 'Message', 3000)),
      preferredLocation: forField('preferredLocation', () =>
        text(input.preferredLocation, 'Preferred location', 150),
      ),
      visitDate: forField('visitDate', () => visitDate(input.visitDate)),
      propertyId: text(input.propertyId, 'Property', 40),
      propertyTitle: text(input.propertyTitle, 'Property', 150),
    };

    const limitKey = clientKey(req, 'lead');
    await assertUnderLimit(limitKey, 10, 60 * 60);
    const [id] = await Promise.all([createLead(lead), recordHit(limitKey)]);

    // The email goes out after the visitor has their answer, so they are not kept waiting
    waitUntil(notifyNewLead(lead));
    return { id };
  },
});

import { HttpError, body, requireAdmin, route, text } from '../_lib/http.js';
import { notifyNewLead } from '../_lib/notify.js';
import { assertUnderLimit, clientKey, recordHit } from '../_lib/rateLimit.js';
import { createLead, listLeads } from '../_lib/store.js';

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

    const email = text(input.email, 'Email', 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, 'Please enter a valid email address');
    }

    const phone = text(input.phone, 'Phone number', 30, true);
    if (!/^\+?[\d\s()-]{7,}$/.test(phone)) {
      throw new HttpError(400, 'Please enter a valid phone number');
    }

    const lead = {
      name: text(input.name, 'Name', 120, true),
      phone,
      email,
      message: text(input.message, 'Message', 3000),
      preferredLocation: text(input.preferredLocation, 'Preferred location', 150),
      propertyId: text(input.propertyId, 'Property', 40),
      propertyTitle: text(input.propertyTitle, 'Property', 150),
    };

    const limitKey = clientKey(req, 'lead');
    await assertUnderLimit(limitKey, 10, 60 * 60);
    await recordHit(limitKey);

    const id = await createLead(lead);
    await notifyNewLead(lead);
    return { id };
  },
});

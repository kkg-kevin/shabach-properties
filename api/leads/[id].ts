import type { VercelRequest } from '@vercel/node';
import { HttpError, body, requireAdmin, route, text } from '../_lib/http.js';
import { deleteLead, isId, updateLead, type LeadChanges } from '../_lib/store.js';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Visit Scheduled', 'Visited', 'Offer Made', 'Won', 'Lost', 'Closed'];

function leadId(req: VercelRequest) {
  const { id } = req.query;
  if (!isId(id)) {
    throw new HttpError(404, 'Lead not found');
  }
  return id;
}

export default route({
  // Changes the status, the admin's notes, or both
  PATCH: async (req) => {
    requireAdmin(req);
    const input = body(req);
    const changes: LeadChanges = {};

    if (input.status !== undefined) {
      if (typeof input.status !== 'string' || !STATUSES.includes(input.status)) {
        throw new HttpError(400, 'Choose a valid lead stage');
      }
      changes.status = input.status;
    }
    if (input.followUpAt !== undefined) {
      const value = text(input.followUpAt, 'Follow-up date', 40);
      const timestamp = value ? Date.parse(value) : NaN;
      if (value && Number.isNaN(timestamp)) throw new HttpError(400, 'Enter a valid follow-up date');
      changes.follow_up_at = value ? new Date(timestamp).toISOString() : null;
    }
    if (input.notes !== undefined) {
      changes.notes = text(input.notes, 'Notes', 2000);
    }
    if (Object.keys(changes).length === 0) {
      throw new HttpError(400, 'Nothing to update');
    }

    const lead = await updateLead(leadId(req), changes);
    if (!lead) {
      throw new HttpError(404, 'Lead not found');
    }
    return lead;
  },

  DELETE: async (req) => {
    requireAdmin(req);
    if (!(await deleteLead(leadId(req)))) {
      throw new HttpError(404, 'Lead not found');
    }
    return null;
  },
});

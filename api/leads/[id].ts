import type { VercelRequest } from '@vercel/node';
import { HttpError, body, requireAdmin, route } from '../_lib/http.js';
import { deleteLead, isId, setLeadStatus } from '../_lib/store.js';

const STATUSES = ['New', 'Contacted', 'Closed'];

function leadId(req: VercelRequest) {
  const { id } = req.query;
  if (!isId(id)) {
    throw new HttpError(404, 'Lead not found');
  }
  return id;
}

export default route({
  PATCH: async (req) => {
    requireAdmin(req);
    const { status } = body(req);
    if (typeof status !== 'string' || !STATUSES.includes(status)) {
      throw new HttpError(400, 'Status must be New, Contacted or Closed');
    }

    const lead = await setLeadStatus(leadId(req), status);
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

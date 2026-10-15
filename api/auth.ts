import { checkPassword, endSession, isAdmin, startSession } from './_lib/auth.js';
import { HttpError, body, route } from './_lib/http.js';
import { assertUnderLimit, clientKey, recordHit } from './_lib/rateLimit.js';

// emailAlerts tells the dashboard whether new enquiries are being emailed to the team
function status(authenticated: boolean) {
  return {
    authenticated,
    emailAlerts: authenticated && Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_EMAIL),
  };
}

export default route({
  // Is the current visitor signed in?
  GET: async (req) => status(isAdmin(req)),

  POST: async (req, res) => {
    // Five wrong passwords locks that visitor out for 15 minutes
    const limitKey = clientKey(req, 'login');
    await assertUnderLimit(limitKey, 5, 15 * 60);

    if (!checkPassword(body(req).password)) {
      await recordHit(limitKey);
      throw new HttpError(401, 'Incorrect password');
    }
    startSession(res);
    return status(true);
  },

  DELETE: async (_req, res) => {
    endSession(res);
    return status(false);
  },
});

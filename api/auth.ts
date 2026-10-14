import { checkPassword, endSession, isAdmin, startSession } from './_lib/auth.js';
import { HttpError, body, route } from './_lib/http.js';
import { assertUnderLimit, clientKey, recordHit } from './_lib/rateLimit.js';

export default route({
  // Is the current visitor signed in?
  GET: async (req) => ({ authenticated: isAdmin(req) }),

  POST: async (req, res) => {
    // Five wrong passwords locks that visitor out for 15 minutes
    const limitKey = clientKey(req, 'login');
    await assertUnderLimit(limitKey, 5, 15 * 60);

    if (!checkPassword(body(req).password)) {
      await recordHit(limitKey);
      throw new HttpError(401, 'Incorrect password');
    }
    startSession(res);
    return { authenticated: true };
  },

  DELETE: async (_req, res) => {
    endSession(res);
    return { authenticated: false };
  },
});

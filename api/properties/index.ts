import { body, cachePublicly, doNotCache, requireAdmin, route } from '../_lib/http.js';
import { parseProperty } from '../_lib/properties.js';
import { createProperty, listProperties } from '../_lib/store.js';

export default route({
  // The public list is cached; ?all=1 is the admin's uncached list, hidden properties included
  GET: async (req, res) => {
    if (req.query.all) {
      requireAdmin(req);
      doNotCache(res);
      return listProperties(true);
    }
    cachePublicly(res);
    return listProperties();
  },

  POST: async (req) => {
    requireAdmin(req);
    return createProperty(parseProperty(body(req)));
  },
});

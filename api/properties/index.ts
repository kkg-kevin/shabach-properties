import { body, requireAdmin, route } from '../_lib/http.js';
import { parseProperty } from '../_lib/properties.js';
import { createProperty, listProperties } from '../_lib/store.js';

export default route({
  GET: async () => listProperties(),

  POST: async (req) => {
    requireAdmin(req);
    return createProperty(parseProperty(body(req)));
  },
});

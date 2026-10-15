import type { VercelRequest } from '@vercel/node';
import { isAdmin } from '../_lib/auth.js';
import { HttpError, body, cachePublicly, doNotCache, requireAdmin, route } from '../_lib/http.js';
import { parseProperty } from '../_lib/properties.js';
import { deleteImages, deleteProperty, getProperty, isId, updateProperty } from '../_lib/store.js';

function propertyId(req: VercelRequest) {
  const { id } = req.query;
  if (!isId(id)) {
    throw new HttpError(404, 'Property not found');
  }
  return id;
}

export default route({
  GET: async (req, res) => {
    const property = await getProperty(propertyId(req));
    // Hidden properties exist only for the admin, and must never be cached for everyone
    if (!property || (property.status === 'Hidden' && !isAdmin(req))) {
      throw new HttpError(404, 'Property not found');
    }
    if (property.status === 'Hidden') {
      doNotCache(res);
    } else {
      cachePublicly(res);
    }
    return property;
  },

  PUT: async (req) => {
    requireAdmin(req);
    const id = propertyId(req);
    const changes = parseProperty(body(req));

    const previous = await getProperty(id);
    const property = previous && (await updateProperty(id, changes));
    if (!previous || !property) {
      throw new HttpError(404, 'Property not found');
    }

    await deleteImages(previous.images.filter((url) => !changes.images.includes(url)));
    return property;
  },

  DELETE: async (req) => {
    requireAdmin(req);
    const property = await deleteProperty(propertyId(req));
    if (!property) {
      throw new HttpError(404, 'Property not found');
    }
    await deleteImages(property.images);
    return null;
  },
});

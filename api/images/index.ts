import { HttpError, requireAdmin, route } from '../_lib/http.js';
import { saveImage } from '../_lib/store.js';

const MAX_BYTES = 3 * 1024 * 1024;

export default route({
  // Body is the raw JPEG, sent as application/octet-stream
  POST: async (req) => {
    requireAdmin(req);

    const data: unknown = req.body;
    if (!Buffer.isBuffer(data) || data.length === 0) {
      throw new HttpError(400, 'No image was uploaded');
    }
    if (data.length > MAX_BYTES) {
      throw new HttpError(413, 'Image is too large');
    }
    if (data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff) {
      throw new HttpError(400, 'Image must be a JPEG');
    }

    return { url: await saveImage(data) };
  },
});

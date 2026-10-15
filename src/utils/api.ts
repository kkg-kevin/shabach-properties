export type PropertyStatus = 'Available' | 'Reserved' | 'Sold' | 'Hidden';
export type LeadStatus = 'New' | 'Contacted' | 'Closed';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  size: string;
  description?: string;
  status: PropertyStatus;
  images: string[];
  features: string[];
  paymentPlan?: string;
  titleStatus?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  preferredLocation?: string;
  propertyId?: string;
  propertyTitle?: string;
  visitDate?: string;
  notes?: string;
  status?: LeadStatus;
  createdAt: string;
}

export interface AuthStatus {
  authenticated: boolean;
  // Whether new enquiries are emailed to the team
  emailAlerts: boolean;
}

export type NewProperty = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;
// `website` is the hidden anti-spam field; real visitors leave it empty
export type NewLead = Omit<Lead, 'id' | 'createdAt' | 'status' | 'notes'> & { website?: string };

// `field` names the form field the server rejected, when there is one
export class ApiError extends Error {
  constructor(public status: number, message: string, public field?: string) {
    super(message);
  }
}

async function request<T>(path: string, method = 'GET', payload?: unknown): Promise<T> {
  const isFile = payload instanceof Blob;
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers:
      payload === undefined
        ? undefined
        : { 'Content-Type': isFile ? 'application/octet-stream' : 'application/json' },
    body: payload === undefined ? undefined : isFile ? payload : JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new ApiError(
      response.status,
      result?.error || 'Something went wrong. Please try again.',
      result?.field,
    );
  }
  return result.data as T;
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function isSignedOut(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

// "1,500,000" -> 1500000, for sorting and filtering
export function priceValue(price: string) {
  return Number(price.replace(/[^\d.]/g, '')) || 0;
}

// "1500000" -> "KSh 1,500,000"; prices saved before they were stored as numbers are shown as typed
export function formatPrice(price: string) {
  const plain = price.replace(/^\s*(kshs?|kes)\.?\s*/i, '');
  return /^\d+$/.test(plain) ? `KSh ${Number(plain).toLocaleString('en-KE')}` : `KSh ${plain}`;
}

// Same rules as the server: "KSh 1.5M" -> "1500000", or '' if it is not a price
export function normalisePrice(value: string) {
  const raw = value.trim().toLowerCase().replace(/[,\s]/g, '').replace(/^(kshs?|kes)\.?/, '');
  const match = raw.match(/^(\d+(?:\.\d+)?)(k|m|million)?$/);
  const amount = match ? Math.round(Number(match[1]) * (match[2] === 'k' ? 1e3 : match[2] ? 1e6 : 1)) : 0;
  return amount ? String(amount) : '';
}

export function formatDate(value: string, withTime = false) {
  // A plain "YYYY-MM-DD" (a visit date) is a calendar day, not midnight UTC
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return date.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

// What visitors see for each status
export const statusLabels: Record<PropertyStatus, string> = {
  Available: 'For Sale',
  Reserved: 'Reserved',
  Sold: 'Sold',
  Hidden: 'Hidden',
};

// Uploaded photos have a smaller "-thumb" copy for cards. Pasted links and
// photos uploaded before thumbnails existed have none, so callers fall back to the original.
const UPLOADED_PHOTO = /(\/storage\/v1\/object\/public\/property-images\/[\da-f-]{36})\.jpg$/i;

export function thumbnailUrl(url: string) {
  return UPLOADED_PHOTO.test(url) ? url.replace(UPLOADED_PHOTO, '$1-thumb.jpg') : url;
}

export const propertyAPI = {
  getAll: () => request<Property[]>('/properties'),
  // Admin only: includes hidden properties and is never cached
  getAllForAdmin: () => request<Property[]>('/properties?all=1'),
  getById: (id: string) => request<Property>(`/properties/${encodeURIComponent(id)}`),
  create: (property: NewProperty) => request<Property>('/properties', 'POST', property),
  update: (id: string, property: NewProperty) =>
    request<Property>(`/properties/${encodeURIComponent(id)}`, 'PUT', property),
  delete: (id: string) => request<null>(`/properties/${encodeURIComponent(id)}`, 'DELETE'),
};

export const leadAPI = {
  getAll: () => request<Lead[]>('/leads'),
  create: (lead: NewLead) => request<{ id: string }>('/leads', 'POST', lead),
  update: (id: string, changes: { status?: LeadStatus; notes?: string }) =>
    request<Lead>(`/leads/${encodeURIComponent(id)}`, 'PATCH', changes),
  delete: (id: string) => request<null>(`/leads/${encodeURIComponent(id)}`, 'DELETE'),
};

export const authAPI = {
  check: () => request<AuthStatus>('/auth'),
  login: (password: string) => request<AuthStatus>('/auth', 'POST', { password }),
  logout: () => request<AuthStatus>('/auth', 'DELETE'),
};

const PHOTO_SIDE = 1600;
const THUMBNAIL_SIDE = 640;

// Shrinks a photo in the browser so phone pictures upload quickly
async function toJpeg(bitmap: ImageBitmap, maxSide: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext('2d')!;
  // JPEG has no transparency
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo'))),
      'image/jpeg',
      0.82,
    );
  });
}

export const imageAPI = {
  // Uploads the photo, then its thumbnail; returns the photo's link
  upload: async (file: File) => {
    const bitmap = await createImageBitmap(file).catch(() => {
      throw new Error(`${file.name} is not an image this browser can read`);
    });
    try {
      const { url } = await request<{ url: string }>('/images', 'POST', await toJpeg(bitmap, PHOTO_SIDE));
      const photoId = url.match(UPLOADED_PHOTO)?.[1].split('/').pop();
      if (photoId) {
        // Cards fall back to the full photo, so a failed thumbnail is not worth failing the upload
        await request('/images?thumbOf=' + photoId, 'POST', await toJpeg(bitmap, THUMBNAIL_SIDE)).catch(
          (error) => console.error('Thumbnail upload failed:', error),
        );
      }
      return url;
    } finally {
      bitmap.close();
    }
  },
};

export type PropertyStatus = 'Available' | 'Sold';
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
  createdAt: string;
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
  status?: LeadStatus;
  createdAt: string;
}

export type NewProperty = Omit<Property, 'id' | 'createdAt'>;
// `website` is the hidden anti-spam field; real visitors leave it empty
type NewLead = Omit<Lead, 'id' | 'createdAt' | 'status'> & { website?: string };

class ApiError extends Error {
  constructor(public status: number, message: string) {
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
    throw new ApiError(response.status, result?.error || 'Something went wrong. Please try again.');
  }
  return result.data as T;
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function isSignedOut(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

// "1,500,000" -> 1500000, for sorting
export function priceValue(price: string) {
  return Number(price.replace(/[^\d.]/g, '')) || 0;
}

export const propertyAPI = {
  getAll: () => request<Property[]>('/properties'),
  getById: (id: string) => request<Property>(`/properties/${encodeURIComponent(id)}`),
  create: (property: NewProperty) => request<Property>('/properties', 'POST', property),
  update: (id: string, property: NewProperty) =>
    request<Property>(`/properties/${encodeURIComponent(id)}`, 'PUT', property),
  delete: (id: string) => request<null>(`/properties/${encodeURIComponent(id)}`, 'DELETE'),
};

export const leadAPI = {
  getAll: () => request<Lead[]>('/leads'),
  create: (lead: NewLead) => request<{ id: string }>('/leads', 'POST', lead),
  setStatus: (id: string, status: LeadStatus) =>
    request<Lead>(`/leads/${encodeURIComponent(id)}`, 'PATCH', { status }),
  delete: (id: string) => request<null>(`/leads/${encodeURIComponent(id)}`, 'DELETE'),
};

export const authAPI = {
  check: () => request<{ authenticated: boolean }>('/auth').then((result) => result.authenticated),
  login: (password: string) => request<{ authenticated: boolean }>('/auth', 'POST', { password }),
  logout: () => request<{ authenticated: boolean }>('/auth', 'DELETE'),
};

const MAX_IMAGE_SIDE = 1600;

// Shrinks a photo in the browser so phone pictures upload quickly
async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`${file.name} is not an image this browser can read`);
  });
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext('2d')!;
  // JPEG has no transparency
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Could not process ${file.name}`))),
      'image/jpeg',
      0.82,
    );
  });
}

export const imageAPI = {
  upload: async (file: File) => {
    const { url } = await request<{ url: string }>('/images', 'POST', await toJpeg(file));
    return url;
  },
};

export type PropertyStatus = 'Available' | 'Sold';

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
  email: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
}

type NewProperty = Omit<Property, 'id' | 'createdAt'>;
type NewLead = Omit<Lead, 'id' | 'createdAt'>;

const PROPERTIES_KEY = 'shabach-properties';
const LEADS_KEY = 'shabach-leads';

function readList<T>(key: string): T[] {
  const value = localStorage.getItem(key);

  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as T[];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function writeList<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const propertyAPI = {
  async getAll() {
    return readList<Property>(PROPERTIES_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getById(id: string) {
    return readList<Property>(PROPERTIES_KEY).find((property) => property.id === id) ?? null;
  },

  async create(property: NewProperty) {
    const properties = readList<Property>(PROPERTIES_KEY);
    const newProperty: Property = {
      ...property,
      id: createId('property'),
      createdAt: new Date().toISOString(),
    };

    writeList(PROPERTIES_KEY, [newProperty, ...properties]);
    return newProperty;
  },

  async delete(id: string) {
    const properties = readList<Property>(PROPERTIES_KEY);
    writeList(
      PROPERTIES_KEY,
      properties.filter((property) => property.id !== id),
    );
  },
};

export const leadAPI = {
  async getAll() {
    return readList<Lead>(LEADS_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async create(lead: NewLead) {
    const leads = readList<Lead>(LEADS_KEY);
    const newLead: Lead = {
      ...lead,
      id: createId('lead'),
      createdAt: new Date().toISOString(),
    };

    writeList(LEADS_KEY, [newLead, ...leads]);
    return newLead;
  },
};

export const storageKeys = {
  leads: LEADS_KEY,
  properties: PROPERTIES_KEY,
};

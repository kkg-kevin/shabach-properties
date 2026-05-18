import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4868b0da`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Properties API
export const propertyAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/properties`, { headers });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${id}`, { headers });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  create: async (property: any) => {
    try {
      const response = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers,
        body: JSON.stringify(property),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  update: async (id: string, property: any) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(property),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },
};

// Leads API
export const leadAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/leads`, { headers });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  create: async (lead: any) => {
    try {
      const response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(lead),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },
};

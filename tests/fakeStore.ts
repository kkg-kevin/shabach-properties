import { randomUUID } from 'node:crypto';
import type { LeadChanges, LeadInput, PropertyInput } from '../api/_lib/store';

// In-memory stand-in for api/_lib/store.ts, so the API can be tested without Supabase

const IMAGE_PREFIX = 'https://project.supabase.co/storage/v1/object/public/property-images/';

export const data = {
  properties: [] as any[],
  leads: [] as any[],
  hits: [] as { key: string; createdAt: Date }[],
  images: new Set<string>(),
};

export function reset() {
  data.properties = [];
  data.leads = [];
  data.hits = [];
  data.images.clear();
}

export function isId(value: unknown): value is string {
  return typeof value === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value);
}

export async function listProperties(includeHidden = false) {
  return [...data.properties].reverse().filter((property) => includeHidden || property.status !== 'Hidden');
}

export async function getProperty(id: string) {
  return data.properties.find((property) => property.id === id) ?? null;
}

export async function createProperty(input: PropertyInput) {
  const property = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
  data.properties.push(property);
  return property;
}

export async function updateProperty(id: string, input: PropertyInput) {
  const index = data.properties.findIndex((property) => property.id === id);
  if (index < 0) return null;
  data.properties[index] = { ...data.properties[index], ...input };
  return data.properties[index];
}

export async function deleteProperty(id: string) {
  const property = await getProperty(id);
  data.properties = data.properties.filter((candidate) => candidate.id !== id);
  return property;
}

export async function listLeads() {
  return [...data.leads].reverse();
}

export async function createLead(input: LeadInput) {
  const lead = { id: randomUUID(), ...input, notes: '', status: 'New', createdAt: new Date().toISOString() };
  data.leads.push(lead);
  return lead.id;
}

export async function updateLead(id: string, changes: LeadChanges) {
  const lead = data.leads.find((candidate) => candidate.id === id);
  if (!lead) return null;
  Object.assign(lead, changes);
  return lead;
}

export async function deleteLead(id: string) {
  const before = data.leads.length;
  data.leads = data.leads.filter((lead) => lead.id !== id);
  return data.leads.length < before;
}

export async function countHits(key: string, since: Date) {
  return data.hits.filter((hit) => hit.key === key && hit.createdAt > since).length;
}

export async function recordHit(key: string) {
  data.hits.push({ key, createdAt: new Date() });
}

export async function saveImage(_data: Buffer, name = `${randomUUID()}.jpg`) {
  const url = `${IMAGE_PREFIX}${name}`;
  data.images.add(url);
  return url;
}

export async function deleteImages(urls: string[]) {
  urls.forEach((url) => {
    data.images.delete(url);
    data.images.delete(url.replace(/\.jpg$/, '-thumb.jpg'));
  });
}

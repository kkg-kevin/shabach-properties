import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// All database and file storage access goes through this file.
// Tables and the storage bucket are created by supabase/schema.sql.

const IMAGE_BUCKET = 'property-images';

export interface PropertyInput {
  title: string;
  location: string;
  price: string;
  size: string;
  description: string;
  status: string;
  images: string[];
  features: string[];
  paymentPlan: string;
  titleStatus: string;
  mapUrl: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredLocation: string;
  propertyId: string;
  propertyTitle: string;
  visitDate: string;
}

export interface LeadChanges {
  status?: string;
  notes?: string;
}

let client: SupabaseClient | null = null;

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }
  return url.replace(/\/+$/, '');
}

function db(): SupabaseClient {
  if (!client) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }
    // Server-only key: it bypasses row level security, so it must never reach the browser
    client = createClient(supabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function isId(value: unknown): value is string {
  return typeof value === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value);
}

// ==================== Properties ====================

function toProperty(row: any) {
  return {
    id: row.id as string,
    title: row.title as string,
    location: row.location as string,
    price: row.price as string,
    size: row.size as string,
    description: row.description as string,
    status: row.status as string,
    images: (row.images ?? []) as string[],
    features: (row.features ?? []) as string[],
    paymentPlan: (row.payment_plan ?? '') as string,
    titleStatus: (row.title_status ?? '') as string,
    mapUrl: (row.map_url ?? '') as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toPropertyRow(input: PropertyInput) {
  return {
    title: input.title,
    location: input.location,
    price: input.price,
    size: input.size,
    description: input.description,
    status: input.status,
    images: input.images,
    features: input.features,
    payment_plan: input.paymentPlan,
    title_status: input.titleStatus,
    map_url: input.mapUrl,
  };
}

// Hidden properties are left out unless the admin asks for them
export async function listProperties(includeHidden = false) {
  let query = db().from('properties').select('*');
  if (!includeHidden) {
    query = query.neq('status', 'Hidden');
  }
  const rows = check(await query.order('created_at', { ascending: false }));
  return (rows ?? []).map(toProperty);
}

export async function getProperty(id: string) {
  const row = check(await db().from('properties').select('*').eq('id', id).maybeSingle());
  return row ? toProperty(row) : null;
}

export async function createProperty(input: PropertyInput) {
  return toProperty(check(await db().from('properties').insert(toPropertyRow(input)).select().single()));
}

export async function updateProperty(id: string, input: PropertyInput) {
  const row = check(
    await db()
      .from('properties')
      .update({ ...toPropertyRow(input), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle(),
  );
  return row ? toProperty(row) : null;
}

export async function deleteProperty(id: string) {
  const row = check(await db().from('properties').delete().eq('id', id).select().maybeSingle());
  return row ? toProperty(row) : null;
}

// ==================== Leads ====================

function toLead(row: any) {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: row.email as string,
    message: row.message as string,
    preferredLocation: row.preferred_location as string,
    propertyId: row.property_id as string,
    propertyTitle: row.property_title as string,
    visitDate: (row.visit_date ?? '') as string,
    notes: (row.notes ?? '') as string,
    status: row.status as string,
    createdAt: row.created_at as string,
  };
}

export async function listLeads() {
  const rows = check(await db().from('leads').select('*').order('created_at', { ascending: false }));
  return (rows ?? []).map(toLead);
}

export async function createLead(input: LeadInput) {
  const row = check(
    await db()
      .from('leads')
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email,
        message: input.message,
        preferred_location: input.preferredLocation,
        property_id: input.propertyId,
        property_title: input.propertyTitle,
        visit_date: input.visitDate || null,
      })
      .select('id')
      .single(),
  );
  return (row as { id: string }).id;
}

export async function updateLead(id: string, changes: LeadChanges) {
  const row = check(
    await db()
      .from('leads')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle(),
  );
  return row ? toLead(row) : null;
}

export async function deleteLead(id: string) {
  const row = check(await db().from('leads').delete().eq('id', id).select('id').maybeSingle());
  return row !== null;
}

// ==================== Rate limits ====================

const HIT_LIFETIME_MS = 60 * 60 * 1000;

export async function countHits(key: string, since: Date) {
  const { count, error } = await db()
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gt('created_at', since.toISOString());
  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function recordHit(key: string) {
  check(await db().from('rate_limits').insert({ key }));
  // Housekeeping: entries older than the longest window are no longer needed
  const expired = new Date(Date.now() - HIT_LIFETIME_MS).toISOString();
  const { error } = await db().from('rate_limits').delete().lt('created_at', expired);
  if (error) {
    console.error('Failed to clear old rate limit entries:', error.message);
  }
}

// ==================== Images ====================

function imageUrlPrefix() {
  return `${supabaseUrl()}/storage/v1/object/public/${IMAGE_BUCKET}/`;
}

// Each photo is stored as <id>.jpg, with a smaller <id>-thumb.jpg for listing cards
export async function saveImage(data: Buffer, name = `${randomUUID()}.jpg`) {
  const { error } = await db()
    .storage.from(IMAGE_BUCKET)
    // A file never changes once uploaded, so it can be cached for a year
    .upload(name, data, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) {
    throw new Error(error.message);
  }
  return imageUrlPrefix() + name;
}

// Removes uploaded photos that a property no longer uses; pasted links are left alone
export async function deleteImages(urls: string[]) {
  try {
    const prefix = imageUrlPrefix();
    const names = urls
      .filter((url) => url.startsWith(prefix))
      .map((url) => url.slice(prefix.length))
      .flatMap((name) => [name, name.replace(/\.jpg$/, '-thumb.jpg')]);
    if (names.length === 0) return;

    const { error } = await db().storage.from(IMAGE_BUCKET).remove(names);
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to delete unused images:', error);
  }
}

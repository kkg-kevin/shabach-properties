import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as store from './fakeStore';

vi.mock('../api/_lib/store.js', () => import('./fakeStore'));

import auth from '../api/auth';
import images from '../api/images/index';
import leadById from '../api/leads/[id]';
import leads from '../api/leads/index';
import propertyById from '../api/properties/[id]';
import properties from '../api/properties/index';
import share from '../api/share';

type Handler = (req: any, res: any) => unknown;

interface CallOptions {
  body?: unknown;
  cookie?: string;
  query?: Record<string, string>;
  ip?: string;
}

async function call(handler: Handler, method: string, options: CallOptions = {}) {
  const res = {
    code: 0,
    headers: {} as Record<string, string>,
    body: undefined as any,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.code = code;
      return this;
    },
    json(value: unknown) {
      this.body = value;
      return this;
    },
    send(value: unknown) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    },
  };
  const req = {
    method,
    url: '/test',
    body: options.body,
    query: options.query ?? {},
    cookies: options.cookie ? { shabach_admin: options.cookie } : {},
    headers: { host: 'example.com', 'x-real-ip': options.ip ?? '10.0.0.1' },
  };
  await handler(req, res);
  return res;
}

async function signIn() {
  const res = await call(auth, 'POST', { body: { password: 'test-password' } });
  return res.headers['Set-Cookie'].split(';')[0].split('=')[1];
}

const plot = {
  title: 'Prime Plot',
  location: 'Kitengela, Kajiado',
  price: '1,500,000',
  size: '50x100',
  status: 'Available',
  images: ['https://example.com/a.jpg'],
  features: ['Title deed'],
};

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const unknownId = '11111111-2222-3333-4444-555555555555';

beforeEach(() => {
  store.reset();
  process.env.ADMIN_PASSWORD = 'test-password';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('auth', () => {
  it('rejects a wrong password and accepts the right one', async () => {
    const wrong = await call(auth, 'POST', { body: { password: 'nope' } });
    expect(wrong.code).toBe(401);
    expect(wrong.headers['Set-Cookie']).toBeUndefined();

    const cookie = await signIn();
    const check = await call(auth, 'GET', { cookie });
    expect(check.body.data).toEqual({ authenticated: true });
  });

  it('does not accept a forged or tampered session', async () => {
    const cookie = await signIn();
    const [, signature] = cookie.split('.');

    for (const forged of [`9999999999.${signature}`, `9999999999.${'a'.repeat(64)}`, 'garbage']) {
      const check = await call(auth, 'GET', { cookie: forged });
      expect(check.body.data).toEqual({ authenticated: false });
    }
  });

  it('locks out a visitor after five wrong passwords', async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await call(auth, 'POST', { body: { password: 'nope' } })).code).toBe(401);
    }
    expect((await call(auth, 'POST', { body: { password: 'test-password' } })).code).toBe(429);

    // Other visitors are unaffected
    expect((await call(auth, 'POST', { body: { password: 'test-password' }, ip: '10.0.0.2' })).code).toBe(201);
  });
});

describe('properties', () => {
  it('requires sign-in to create, update or delete', async () => {
    expect((await call(properties, 'POST', { body: plot })).code).toBe(401);
    expect((await call(propertyById, 'PUT', { body: plot, query: { id: unknownId } })).code).toBe(401);
    expect((await call(propertyById, 'DELETE', { query: { id: unknownId } })).code).toBe(401);
  });

  it('validates input', async () => {
    const cookie = await signIn();

    const missing = await call(properties, 'POST', { cookie, body: { ...plot, location: ' ' } });
    expect(missing.code).toBe(400);
    expect(missing.body.error).toBe('Location is required');

    const badImage = await call(properties, 'POST', { cookie, body: { ...plot, images: ['javascript:alert(1)'] } });
    expect(badImage.code).toBe(400);

    const badStatus = await call(properties, 'POST', { cookie, body: { ...plot, status: 'Maybe' } });
    expect(badStatus.code).toBe(400);
  });

  it('creates, lists, reads, updates and deletes', async () => {
    const cookie = await signIn();

    const created = await call(properties, 'POST', { cookie, body: { ...plot, hacked: true } });
    expect(created.code).toBe(201);
    const { id } = created.body.data;
    expect(created.body.data.hacked).toBeUndefined();

    const list = await call(properties, 'GET');
    expect(list.body.data).toHaveLength(1);

    const read = await call(propertyById, 'GET', { query: { id } });
    expect(read.body.data.title).toBe('Prime Plot');

    const updated = await call(propertyById, 'PUT', { cookie, query: { id }, body: { ...plot, status: 'Sold' } });
    expect(updated.body.data).toMatchObject({ id, status: 'Sold' });

    expect((await call(propertyById, 'DELETE', { cookie, query: { id } })).code).toBe(200);
    expect((await call(propertyById, 'GET', { query: { id } })).code).toBe(404);
  });

  it('returns 404 for malformed and unknown ids', async () => {
    expect((await call(propertyById, 'GET', { query: { id: 'not-an-id' } })).code).toBe(404);
    expect((await call(propertyById, 'GET', { query: { id: unknownId } })).code).toBe(404);

    const cookie = await signIn();
    expect((await call(propertyById, 'PUT', { cookie, body: plot, query: { id: unknownId } })).code).toBe(404);
    expect((await call(propertyById, 'DELETE', { cookie, query: { id: unknownId } })).code).toBe(404);
  });
});

describe('images', () => {
  it('requires sign-in and a real JPEG', async () => {
    expect((await call(images, 'POST', { body: jpeg })).code).toBe(401);

    const cookie = await signIn();
    expect((await call(images, 'POST', { cookie, body: Buffer.from('<svg></svg>') })).code).toBe(400);
    expect((await call(images, 'POST', { cookie, body: { not: 'a file' } })).code).toBe(400);
  });

  it('stores an upload and removes it when the property drops it or is deleted', async () => {
    const cookie = await signIn();
    const upload = async () => (await call(images, 'POST', { cookie, body: jpeg })).body.data.url as string;

    const first = await upload();
    const second = await upload();
    expect(store.data.images.size).toBe(2);

    const created = await call(properties, 'POST', { cookie, body: { ...plot, images: [first, second] } });
    const { id } = created.body.data;

    await call(propertyById, 'PUT', { cookie, query: { id }, body: { ...plot, images: [second] } });
    expect([...store.data.images]).toEqual([second]);

    await call(propertyById, 'DELETE', { cookie, query: { id } });
    expect(store.data.images.size).toBe(0);
  });
});

describe('leads', () => {
  const enquiry = { name: 'Jane', phone: '0727 496 461', message: 'Call me' };

  it('accepts a public enquiry but keeps the list private', async () => {
    expect((await call(leads, 'POST', { body: enquiry })).code).toBe(201);
    expect((await call(leads, 'GET')).code).toBe(401);

    const list = await call(leads, 'GET', { cookie: await signIn() });
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({ name: 'Jane', status: 'New' });
  });

  it('validates contact details', async () => {
    expect((await call(leads, 'POST', { body: { ...enquiry, phone: 'abc' } })).code).toBe(400);
    expect((await call(leads, 'POST', { body: { ...enquiry, email: 'not-an-email' } })).code).toBe(400);
    expect((await call(leads, 'POST', { body: { ...enquiry, name: '' } })).code).toBe(400);
  });

  it('silently drops submissions that fill in the hidden field', async () => {
    const res = await call(leads, 'POST', { body: { ...enquiry, website: 'http://spam.example' } });
    expect(res.code).toBe(201);
    expect(store.data.leads).toHaveLength(0);
  });

  it('limits how many enquiries one visitor can send', async () => {
    for (let count = 0; count < 10; count++) {
      expect((await call(leads, 'POST', { body: enquiry })).code).toBe(201);
    }
    expect((await call(leads, 'POST', { body: enquiry })).code).toBe(429);
  });

  it('lets the admin update status and delete', async () => {
    await call(leads, 'POST', { body: enquiry });
    const cookie = await signIn();
    const { id } = (await call(leads, 'GET', { cookie })).body.data[0];

    expect((await call(leadById, 'PATCH', { query: { id }, body: { status: 'Contacted' } })).code).toBe(401);
    expect((await call(leadById, 'PATCH', { cookie, query: { id }, body: { status: 'Bogus' } })).code).toBe(400);

    const patched = await call(leadById, 'PATCH', { cookie, query: { id }, body: { status: 'Contacted' } });
    expect(patched.body.data.status).toBe('Contacted');

    expect((await call(leadById, 'DELETE', { cookie, query: { id } })).code).toBe(200);
    expect(store.data.leads).toHaveLength(0);
  });
});

describe('share preview', () => {
  it('describes the property and escapes its text', async () => {
    const cookie = await signIn();
    const created = await call(properties, 'POST', {
      cookie,
      body: { ...plot, title: 'Plot "A" <b>', images: [] },
    });
    const { id } = created.body.data;

    const page = await call(share, 'GET', { query: { id } });
    expect(page.code).toBe(200);
    expect(page.body).toContain('Plot &quot;A&quot; &lt;b&gt; - KSh 1,500,000');
    expect(page.body).toContain(`https://example.com/properties/${id}`);
    expect(page.body).not.toContain('<b>');
  });

  it('falls back to the site description for unknown properties', async () => {
    const page = await call(share, 'GET', { query: { id: 'nope' } });
    expect(page.code).toBe(200);
    expect(page.body).toContain('Shabach Properties Ltd');
  });
});

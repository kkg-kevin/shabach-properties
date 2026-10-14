# Shabach Properties

Website for Shabach Properties Ltd: property listings, enquiry forms and an admin dashboard.

- **Frontend:** React + Vite + Tailwind (`src/`)
- **Backend:** Vercel serverless functions (`api/`)
- **Database and photo storage:** Supabase
- **Admin:** `/admin`, protected by a password

## Setting up Supabase

1. Create a project at https://supabase.com.
2. Open SQL Editor → New query, paste the contents of `supabase/schema.sql` and click Run. This creates the tables and the photo storage bucket.
3. Under Project Settings → API, copy the project URL and the service role (secret) key for the environment variables below.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Supabase project URL, e.g. `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service role (secret) key. Keep it private |
| `ADMIN_PASSWORD` | yes | Password for `/admin` |
| `RESEND_API_KEY` | no | Enables an email for each new enquiry (free account at resend.com) |
| `LEAD_NOTIFY_EMAIL` | no | Where enquiry emails go; separate several addresses with commas |
| `LEAD_NOTIFY_FROM` | no | Sender for enquiry emails, once you have verified a domain in Resend |

Copy `.env.example` to `.env.local` and fill in the values for local development.

## Running locally

```
npm install
npx vercel dev
```

`vercel dev` serves both the site and the `/api` functions. `npm run dev` starts the frontend only, so properties and forms will not load.

## Deploying to Vercel

1. Import the GitHub repository at https://vercel.com/new (the settings are read from `vercel.json`).
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` under Settings → Environment Variables.
3. Deploy, then sign in at `/admin` and add the first properties.
4. Optional: turn on Web Analytics in the Vercel project's Analytics tab to see visitor numbers.

Supabase pauses free projects that receive no requests for about a week. A paused project makes the site show no properties until it is restarted from the Supabase dashboard.

## Editing site content

Phone number, WhatsApp number, email, social media links and testimonials are all in `src/config/site.ts`.

## How it works

- **Data access** is all in `api/_lib/store.ts`. The browser never talks to Supabase directly, and the tables are locked (row level security) so only the server can read or change them.
- **Photos** uploaded in the admin are resized in the browser and stored in the `property-images` storage bucket.
- **Enquiries** are saved to the `leads` table. A visitor can send at most 10 per hour.
- **Admin sign-in** locks out a visitor for 15 minutes after five wrong passwords. Changing `ADMIN_PASSWORD` signs everyone out.
- **Link previews:** WhatsApp, Facebook and similar apps get the property's title, price and photo when a property link is shared (`api/share.ts`).

## Scripts

- `npm run build`: production build into `dist/`
- `npm run typecheck`: type-check the frontend and the API
- `npm test`: API tests

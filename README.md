# Donate the Blood — Web App

Frontend for [Donate the Blood](https://donatetheblood.pk), an emergency blood-donor
matching platform (Next.js 16 / React 19 / Tailwind CSS 4 / TypeScript).

This app is a **pure frontend**. Every `app/api/*` route is a thin proxy to a
separate Node.js backend; the frontend never talks to a database directly.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set the real values:

| Variable           | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Node.js backend that all `/api/*` routes proxy to |
| `RESEND_API_KEY`    | Resend API key used by the contact form (`/api/contact`)             |
| `CONTACT_TO_EMAIL`  | Where contact-form messages are delivered                            |
| `CONTACT_FROM_EMAIL`| Verified sender address for Resend                                   |

`.env`, `.env.local` and `.env.example` are gitignored (`.env*` rule) — treat
any key in them as a secret and never commit it.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build (also runs TypeScript checks)
npm run start    # serve the production build
npm run lint     # ESLint
```

## Architecture

- **`app/`** — pages and API proxy routes. Before Next.js proxies requests
  please read the notes in `lib/api/route-helpers.ts` and `lib/backend.ts`.
- **`components/`** — page/feature components (`auth`, `dashboard`, `home`,
  `search`, `admin`, `contact`, `ui`).
- **`lib/`** — shared logic: API client with token refresh
  (`lib/api/client.ts`), auth helpers, geolocation (`lib/geo.ts`), search
  types, and form schemas (`lib/schemas.ts`).
- **`proxy.ts`** — Next.js middleware equivalent guarding `/admin/*`.

## Authentication model

- Access token lives only in JS memory (`lib/api/token-store.ts`).
- Refresh token is stored in an httpOnly cookie (`bb_refresh`) set/cleared by
  the backend through auth proxy routes.
- The axios client transparently refreshes on 401 with single-flight
  de-duplication (see `lib/api/client.ts`).

## Deployment

Deploys on Vercel (`vercel.json`). Set the same environment variables in the
Vercel project settings. `next.config.ts` adds baseline security headers.
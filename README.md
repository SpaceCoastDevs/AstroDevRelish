# DevRel(ish) Astro integration

DevRel(ish) is packaged as an Astro integration that injects community group, gathering, RSVP, dashboard, and admin routes into an existing Astro site.

## Install in a host Astro site

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import react from "@astrojs/react";
import devRelish from "astro-devrelish";

export default defineConfig({
  site: "https://example.com",
  output: "server",
  integrations: [
    db(),
    react(),
    devRelish({
      base: "/community", // omit base to mount at /
      supportEmail: "admin@example.com",
      fromEmail: "hello@example.com",
    }),
  ],
});
```

The integration injects its pages and API endpoints under the configured `base` path. For example, `base: "/community"` mounts `/community/groups`, `/community/gatherings`, `/community/dashboard`, and `/community/api/*`.

DevRelish derives its public origin from Astro's `site` config, then falls back to the incoming request origin. `siteUrl` is still available as an integration option when the DevRelish public URL needs to differ from `site`. `supportEmail` is shown in policy/contact copy, and `fromEmail` controls the Resend sender address. `siteName` is also available if the host site wants to override the default `DevRel(ish)` label in transactional email.

## Auth model

This package does **not** ship BetterAuth or any auth routes. The host Astro site is responsible for authentication and must populate `Astro.locals.user` from its own middleware before DevRelish protected routes run.

DevRelish expects this shape:

```ts
type DevRelishUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null; // use "admin" for admin dashboard access
  groupId?: string | null; // group managers are scoped by this value
};
```

Unauthenticated dashboard/admin actions redirect to `/login`, and sign-out links point at `/logout`, so provide those routes in the host application or redirect them to your existing auth UI.

## Database

The schema lives in `db/config.ts`. It contains DevRelish application tables plus a lightweight `User` profile table for roles and group ownership. It no longer includes BetterAuth `Session`, `Account`, or `Verification` tables.

Copy or compose the exported schema into the host site's Astro DB setup, then push it with:

```sh
astro db push --remote
```

## External services

Speaker image uploads use Cloudinary. Set these variables in the host environment if you use speaker photos:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Email notifications use Resend where configured by the existing email helper.

## Local development

```sh
npm install
npm run check
npm run dev
```

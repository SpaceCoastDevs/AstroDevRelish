# DevRel(ish) Astro integration

DevRel(ish) is packaged as an Astro integration that injects community group, gathering, RSVP, dashboard, and admin routes into an existing Astro site.

## Install in a host Astro site

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import devRelish from "astro-devrelish";

export default defineConfig({
  output: "server",
  integrations: [
    react(),
    devRelish({ base: "/community" }), // omit base to mount at /
  ],
});
```

The integration injects its pages and API endpoints under the configured `base` path. For example, `base: "/community"` mounts `/community/groups`, `/community/gatherings`, `/community/dashboard`, and `/community/api/*`.

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

DevRelish uses Drizzle directly. The default `devrelish:db` module uses the libSQL adapter and reads these environment variables:

- `DEVRELISH_DATABASE_URL`, falling back to `DATABASE_URL`, then `file:./devrelish.db`
- `DEVRELISH_DATABASE_AUTH_TOKEN`, falling back to `DATABASE_AUTH_TOKEN`

The SQLite schema lives in `astro-devrelish/db/schema`. It contains DevRelish application tables plus a lightweight `User` profile table for roles and group ownership.

To use a different Drizzle adapter, pass a module that exports `db`, the DevRelish table objects, and any Drizzle query helpers used by the package:

```js
// astro.config.mjs
devRelish({
  databaseModule: "./src/devrelish-db.ts",
});
```

```ts
// src/devrelish-db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { and, asc, count, desc, eq, gt, gte, inArray, isNotNull } from "drizzle-orm";
import * as schemaModule from "astro-devrelish/db/schema";

export * from "astro-devrelish/db/schema";
export { and, asc, count, desc, eq, gt, gte, inArray, isNotNull };

export const db = drizzle(new Database("devrelish.db"), {
  schema: schemaModule.schema,
});
```

Use the Drizzle migration/push workflow for whichever adapter owns that module. For local libSQL development, the default client is enough once the schema has been pushed to `file:./devrelish.db`.


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

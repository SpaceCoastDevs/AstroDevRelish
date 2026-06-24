/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEVRELISH_DATABASE_URL?: string;
  readonly DEVRELISH_DATABASE_AUTH_TOKEN?: string;
  readonly DATABASE_URL?: string;
  readonly DATABASE_AUTH_TOKEN?: string;
}

interface ImportMetaEnv {
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
}

type DevRelishUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  groupId?: string | null;
};

declare namespace App {
  interface Locals {
    /** Supplied by the host Astro site's auth middleware. */
    user: DevRelishUser | null;
    session?: unknown;
  }
}

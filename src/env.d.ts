/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
}

type BetterAuthUser = typeof import("./lib/auth").auth.$Infer.Session.user;
type BetterAuthSession = typeof import("./lib/auth").auth.$Infer.Session.session;

declare namespace App {
  interface Locals {
    user: BetterAuthUser | null;
    session: BetterAuthSession | null;
  }
}

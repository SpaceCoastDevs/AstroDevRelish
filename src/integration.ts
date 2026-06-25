import type { AstroIntegration } from "astro";

type DevRelishOptions = {
  /** Mount path for DevRelish routes. Defaults to the site root. */
  base?: `/${string}`;
  /** Public site origin override. Defaults to Astro's site config, then the incoming request origin. */
  siteUrl?: string;
  /** Product/site name used in transactional emails. */
  siteName?: string;
  /** Public support/admin email shown in policy copy. */
  supportEmail?: string;
  /** Sender email address for transactional email. Defaults to RESEND_FROM, then supportEmail. */
  fromEmail?: string;
};

const routes = [
  { pattern: "/404", entrypoint: new URL("./src/pages/404.astro", import.meta.url) },
  { pattern: "/[customSlug]", entrypoint: new URL("./src/pages/[customSlug].astro", import.meta.url) },
  { pattern: "/admin/groups/[id]", entrypoint: new URL("./src/pages/admin/groups/[id].astro", import.meta.url) },
  { pattern: "/admin/groups", entrypoint: new URL("./src/pages/admin/groups/index.astro", import.meta.url) },
  { pattern: "/admin", entrypoint: new URL("./src/pages/admin/index.astro", import.meta.url) },
  { pattern: "/api/calendar/[gatheringId]", entrypoint: new URL("./src/pages/api/calendar/[gatheringId].ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/attendees.csv", entrypoint: new URL("./src/pages/api/gatherings/[id]/attendees.csv.ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/cancel", entrypoint: new URL("./src/pages/api/gatherings/[id]/cancel.ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/sessions/[sessionId]", entrypoint: new URL("./src/pages/api/gatherings/[id]/sessions/[sessionId].ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/sessions", entrypoint: new URL("./src/pages/api/gatherings/[id]/sessions/index.ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/speakers/[speakerId]", entrypoint: new URL("./src/pages/api/gatherings/[id]/speakers/[speakerId].ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]/speakers", entrypoint: new URL("./src/pages/api/gatherings/[id]/speakers/index.ts", import.meta.url) },
  { pattern: "/api/gatherings/[id]", entrypoint: new URL("./src/pages/api/gatherings/[id].ts", import.meta.url) },
  { pattern: "/api/gatherings", entrypoint: new URL("./src/pages/api/gatherings/index.ts", import.meta.url) },
  { pattern: "/api/groups/[id]/status", entrypoint: new URL("./src/pages/api/groups/[id]/status.ts", import.meta.url) },
  { pattern: "/api/groups/register", entrypoint: new URL("./src/pages/api/groups/register.ts", import.meta.url) },
  { pattern: "/api/health", entrypoint: new URL("./src/pages/api/health.ts", import.meta.url) },
  { pattern: "/api/import/meetup-rss", entrypoint: new URL("./src/pages/api/import/meetup-rss.ts", import.meta.url) },
  { pattern: "/api/messages/[id]/delete", entrypoint: new URL("./src/pages/api/messages/[id]/delete.ts", import.meta.url) },
  { pattern: "/api/messages/[id]/read", entrypoint: new URL("./src/pages/api/messages/[id]/read.ts", import.meta.url) },
  { pattern: "/api/rsvp/[gatheringId]", entrypoint: new URL("./src/pages/api/rsvp/[gatheringId].ts", import.meta.url) },
  { pattern: "/api/rsvp/[rsvpId]/delete", entrypoint: new URL("./src/pages/api/rsvp/[rsvpId]/delete.ts", import.meta.url) },
  { pattern: "/api/upload/speaker-image", entrypoint: new URL("./src/pages/api/upload/speaker-image.ts", import.meta.url) },
  { pattern: "/dashboard/gatherings/[id]/attendees", entrypoint: new URL("./src/pages/dashboard/gatherings/[id]/attendees.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/[id]/edit", entrypoint: new URL("./src/pages/dashboard/gatherings/[id]/edit.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/[id]/speakers", entrypoint: new URL("./src/pages/dashboard/gatherings/[id]/speakers.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/import", entrypoint: new URL("./src/pages/dashboard/gatherings/import.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings", entrypoint: new URL("./src/pages/dashboard/gatherings/index.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/new", entrypoint: new URL("./src/pages/dashboard/gatherings/new.astro", import.meta.url) },
  { pattern: "/dashboard/group", entrypoint: new URL("./src/pages/dashboard/group/index.astro", import.meta.url) },
  { pattern: "/dashboard", entrypoint: new URL("./src/pages/dashboard/index.astro", import.meta.url) },
  { pattern: "/dashboard/messages", entrypoint: new URL("./src/pages/dashboard/messages/index.astro", import.meta.url) },
  { pattern: "/dashboard/team", entrypoint: new URL("./src/pages/dashboard/team.astro", import.meta.url) },
  { pattern: "/favicon.svg", entrypoint: new URL("./src/pages/favicon.svg.ts", import.meta.url) },
  { pattern: "/follow/confirm/[token]", entrypoint: new URL("./src/pages/follow/confirm/[token].astro", import.meta.url) },
  { pattern: "/follow/unsubscribe/[token]", entrypoint: new URL("./src/pages/follow/unsubscribe/[token].astro", import.meta.url) },
  { pattern: "/gatherings/[id]/cancel/[token]", entrypoint: new URL("./src/pages/gatherings/[id]/cancel/[token].astro", import.meta.url) },
  { pattern: "/gatherings/[id]/cancel", entrypoint: new URL("./src/pages/gatherings/[id]/cancel.astro", import.meta.url) },
  { pattern: "/gatherings/[id]/rsvp", entrypoint: new URL("./src/pages/gatherings/[id]/rsvp.astro", import.meta.url) },
  { pattern: "/gatherings", entrypoint: new URL("./src/pages/gatherings/index.astro", import.meta.url) },
  { pattern: "/groups/[slug]/contact", entrypoint: new URL("./src/pages/groups/[slug]/contact.astro", import.meta.url) },
  { pattern: "/groups/[slug]/follow", entrypoint: new URL("./src/pages/groups/[slug]/follow.astro", import.meta.url) },
  { pattern: "/groups/[slug]/rss.xml", entrypoint: new URL("./src/pages/groups/[slug]/rss.xml.ts", import.meta.url) },
  { pattern: "/groups/[slug]", entrypoint: new URL("./src/pages/groups/[slug].astro", import.meta.url) },
  { pattern: "/groups", entrypoint: new URL("./src/pages/groups/index.astro", import.meta.url) },
  { pattern: "/groups/register", entrypoint: new URL("./src/pages/groups/register.astro", import.meta.url) },
  { pattern: "/how-it-works", entrypoint: new URL("./src/pages/how-it-works.astro", import.meta.url) },
  { pattern: "/", entrypoint: new URL("./src/pages/index.astro", import.meta.url) },
  { pattern: "/invite/[token]", entrypoint: new URL("./src/pages/invite/[token].astro", import.meta.url) },
  { pattern: "/og-image.svg", entrypoint: new URL("./src/pages/og-image.svg.ts", import.meta.url) },
  { pattern: "/privacy", entrypoint: new URL("./src/pages/privacy.astro", import.meta.url) },
];

function normalizeBase(base = "/") {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed === "" ? "" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizeSiteUrl(siteUrl: string | URL | undefined): string {
  if (!siteUrl) return "";
  try {
    return new URL(siteUrl).origin;
  } catch {
    return "";
  }
}

function mountPattern(base: string, pattern: string) {
  if (!base) return pattern;
  return pattern === "/" ? base : `${base}${pattern}`;
}

export default function devRelish(options: DevRelishOptions = {}): AstroIntegration {
  const base = normalizeBase(options.base);
  const siteName = options.siteName ?? "DevRel(ish)";
  const supportEmail = options.supportEmail ?? "admin@example.com";

  return {
    name: "devrelish",
    hooks: {
      "astro:db:setup"({ extendDb }: any) {
        extendDb({
          configEntrypoint: new URL("./db/config.ts", import.meta.url),
          seedEntrypoint: new URL("./db/seed.ts", import.meta.url),
        });
      },
      "astro:config:setup"({ config, injectRoute, logger, updateConfig }) {
        const siteUrl = normalizeSiteUrl(options.siteUrl ?? config.site);

        updateConfig({
          vite: {
            define: {
              "import.meta.env.DEVRELISH_BASE": JSON.stringify(base),
              "import.meta.env.DEVRELISH_SITE_URL": JSON.stringify(siteUrl),
              "import.meta.env.DEVRELISH_SITE_NAME": JSON.stringify(siteName),
              "import.meta.env.DEVRELISH_SUPPORT_EMAIL": JSON.stringify(supportEmail),
              "import.meta.env.DEVRELISH_FROM_EMAIL": JSON.stringify(options.fromEmail ?? ""),
            },
          },
        });

        for (const route of routes) {
          injectRoute({ ...route, pattern: mountPattern(base, route.pattern) });
        }
        logger.info(`Injected ${routes.length} DevRelish routes at ${base || "/"}.`);
      },
    },
  };
}

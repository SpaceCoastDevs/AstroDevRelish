// src/integration.ts
var routes = [
  { pattern: "/404", entrypoint: new URL("./pages/404.astro", import.meta.url) },
  { pattern: "/:customSlug", entrypoint: new URL("./pages/[customSlug].astro", import.meta.url) },
  { pattern: "/admin/groups/:id", entrypoint: new URL("./pages/admin/groups/[id].astro", import.meta.url) },
  { pattern: "/admin/groups", entrypoint: new URL("./pages/admin/groups/index.astro", import.meta.url) },
  { pattern: "/admin", entrypoint: new URL("./pages/admin/index.astro", import.meta.url) },
  { pattern: "/api/calendar/:gatheringId", entrypoint: new URL("./pages/api/calendar/[gatheringId].ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/attendees.csv", entrypoint: new URL("./pages/api/gatherings/[id]/attendees.csv.ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/cancel", entrypoint: new URL("./pages/api/gatherings/[id]/cancel.ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/sessions/:sessionId", entrypoint: new URL("./pages/api/gatherings/[id]/sessions/[sessionId].ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/sessions", entrypoint: new URL("./pages/api/gatherings/[id]/sessions/index.ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/speakers/:speakerId", entrypoint: new URL("./pages/api/gatherings/[id]/speakers/[speakerId].ts", import.meta.url) },
  { pattern: "/api/gatherings/:id/speakers", entrypoint: new URL("./pages/api/gatherings/[id]/speakers/index.ts", import.meta.url) },
  { pattern: "/api/gatherings/:id", entrypoint: new URL("./pages/api/gatherings/[id].ts", import.meta.url) },
  { pattern: "/api/gatherings", entrypoint: new URL("./pages/api/gatherings/index.ts", import.meta.url) },
  { pattern: "/api/groups/:id/status", entrypoint: new URL("./pages/api/groups/[id]/status.ts", import.meta.url) },
  { pattern: "/api/groups/register", entrypoint: new URL("./pages/api/groups/register.ts", import.meta.url) },
  { pattern: "/api/health", entrypoint: new URL("./pages/api/health.ts", import.meta.url) },
  { pattern: "/api/import/meetup-rss", entrypoint: new URL("./pages/api/import/meetup-rss.ts", import.meta.url) },
  { pattern: "/api/messages/:id/delete", entrypoint: new URL("./pages/api/messages/[id]/delete.ts", import.meta.url) },
  { pattern: "/api/messages/:id/read", entrypoint: new URL("./pages/api/messages/[id]/read.ts", import.meta.url) },
  { pattern: "/api/rsvp/:gatheringId", entrypoint: new URL("./pages/api/rsvp/[gatheringId].ts", import.meta.url) },
  { pattern: "/api/rsvp/:rsvpId/delete", entrypoint: new URL("./pages/api/rsvp/[rsvpId]/delete.ts", import.meta.url) },
  { pattern: "/api/upload/speaker-image", entrypoint: new URL("./pages/api/upload/speaker-image.ts", import.meta.url) },
  { pattern: "/dashboard/gatherings/:id/attendees", entrypoint: new URL("./pages/dashboard/gatherings/[id]/attendees.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/:id/edit", entrypoint: new URL("./pages/dashboard/gatherings/[id]/edit.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/:id/speakers", entrypoint: new URL("./pages/dashboard/gatherings/[id]/speakers.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/import", entrypoint: new URL("./pages/dashboard/gatherings/import.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings", entrypoint: new URL("./pages/dashboard/gatherings/index.astro", import.meta.url) },
  { pattern: "/dashboard/gatherings/new", entrypoint: new URL("./pages/dashboard/gatherings/new.astro", import.meta.url) },
  { pattern: "/dashboard/group", entrypoint: new URL("./pages/dashboard/group/index.astro", import.meta.url) },
  { pattern: "/dashboard", entrypoint: new URL("./pages/dashboard/index.astro", import.meta.url) },
  { pattern: "/dashboard/messages", entrypoint: new URL("./pages/dashboard/messages/index.astro", import.meta.url) },
  { pattern: "/dashboard/team", entrypoint: new URL("./pages/dashboard/team.astro", import.meta.url) },
  { pattern: "/follow/confirm/:token", entrypoint: new URL("./pages/follow/confirm/[token].astro", import.meta.url) },
  { pattern: "/follow/unsubscribe/:token", entrypoint: new URL("./pages/follow/unsubscribe/[token].astro", import.meta.url) },
  { pattern: "/gatherings/:id/cancel/:token", entrypoint: new URL("./pages/gatherings/[id]/cancel/[token].astro", import.meta.url) },
  { pattern: "/gatherings/:id/cancel", entrypoint: new URL("./pages/gatherings/[id]/cancel.astro", import.meta.url) },
  { pattern: "/gatherings/:id/rsvp", entrypoint: new URL("./pages/gatherings/[id]/rsvp.astro", import.meta.url) },
  { pattern: "/gatherings", entrypoint: new URL("./pages/gatherings/index.astro", import.meta.url) },
  { pattern: "/groups/:slug/contact", entrypoint: new URL("./pages/groups/[slug]/contact.astro", import.meta.url) },
  { pattern: "/groups/:slug/follow", entrypoint: new URL("./pages/groups/[slug]/follow.astro", import.meta.url) },
  { pattern: "/groups/:slug/rss.xml", entrypoint: new URL("./pages/groups/[slug]/rss.xml.ts", import.meta.url) },
  { pattern: "/groups/:slug", entrypoint: new URL("./pages/groups/[slug].astro", import.meta.url) },
  { pattern: "/groups", entrypoint: new URL("./pages/groups/index.astro", import.meta.url) },
  { pattern: "/groups/register", entrypoint: new URL("./pages/groups/register.astro", import.meta.url) },
  { pattern: "/how-it-works", entrypoint: new URL("./pages/how-it-works.astro", import.meta.url) },
  { pattern: "/", entrypoint: new URL("./pages/index.astro", import.meta.url) },
  { pattern: "/invite/:token", entrypoint: new URL("./pages/invite/[token].astro", import.meta.url) },
  { pattern: "/privacy", entrypoint: new URL("./pages/privacy.astro", import.meta.url) }
];
function normalizeBase(base = "/") {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed === "" ? "" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function mountPattern(base, pattern) {
  if (!base) return pattern;
  return pattern === "/" ? base : `${base}${pattern}`;
}
function devRelish(options = {}) {
  const base = normalizeBase(options.base);
  return {
    name: "devrelish",
    hooks: {
      "astro:config:setup"({ injectRoute, logger }) {
        for (const route of routes) {
          injectRoute({ ...route, pattern: mountPattern(base, route.pattern) });
        }
        logger.info(`Injected ${routes.length} DevRelish routes at ${base || "/"}.`);
      }
    }
  };
}
export {
  devRelish as default
};

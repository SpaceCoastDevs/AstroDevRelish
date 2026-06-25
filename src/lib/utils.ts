/** Return the best public URL for a group — custom short URL if set, canonical otherwise */
const DEVRELISH_BASE = normalizeBase(import.meta.env.DEVRELISH_BASE);
const DEVRELISH_SITE_URL = normalizeSiteUrl(import.meta.env.DEVRELISH_SITE_URL);
const DEVRELISH_SITE_NAME = import.meta.env.DEVRELISH_SITE_NAME || "DevRel(ish)";
const DEVRELISH_SUPPORT_EMAIL = import.meta.env.DEVRELISH_SUPPORT_EMAIL || "admin@example.com";

function normalizeBase(base: string | undefined): string {
  if (!base || base === "/") return "";
  const normalized = base.startsWith("/") ? base : `/${base}`;
  return normalized.replace(/\/+$/, "");
}

function normalizeSiteUrl(siteUrl: string | undefined): string {
  if (!siteUrl) return "";
  try {
    const url = new URL(siteUrl);
    return url.origin;
  } catch {
    return "";
  }
}

export function withBase(path = "/"): string {
  if (/^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(path) || path.startsWith("#") || path.startsWith("mailto:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!DEVRELISH_BASE) return normalizedPath;
  return normalizedPath === "/" ? DEVRELISH_BASE : `${DEVRELISH_BASE}${normalizedPath}`;
}

export function siteOrigin(origin: string): string {
  return DEVRELISH_SITE_URL || origin;
}

export function absoluteUrl(origin: string, path = "/"): string {
  return new URL(withBase(path), siteOrigin(origin)).href;
}

export function siteRootUrl(origin: string): string {
  return siteOrigin(origin);
}

export function displaySiteUrl(origin: string, path = "/"): string {
  const url = new URL(path === "/" ? siteRootUrl(origin) : absoluteUrl(origin, path));
  const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  return `${url.host}${pathname}`;
}

export function displayBaseUrl(origin: string): string {
  const url = new URL(absoluteUrl(origin, "/"));
  const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  return `${url.host}${pathname}`;
}

export function siteName(): string {
  return DEVRELISH_SITE_NAME;
}

export function supportEmail(): string {
  return DEVRELISH_SUPPORT_EMAIL;
}

export function groupUrl(group: { slug: string; customSlug?: string | null }): string {
  return withBase(group.customSlug ? `/${group.customSlug}` : `/groups/${group.slug}`);
}

/** Convert a group name to a URL-safe slug */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Generate a random ID */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Format a date for display. Always uses UTC so the calendar date matches what was stored. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Format time from "HH:MM" 24-hour to "h:MM AM/PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Count remaining spots */
export function spotsLeft(capacity: number, rsvpCount: number): number {
  return Math.max(0, capacity - rsvpCount);
}

/** Build an OpenStreetMap search URL for a venue + optional address */
export function osmUrl(venue: string, address?: string | null): string {
  const query = [venue, address].filter(Boolean).join(", ");
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

/**
 * Build a Google Calendar "add event" URL.
 * Uses floating (no-timezone) datetime so it matches the stored wall-clock time.
 */
export function googleCalendarUrl(opts: {
  title: string;
  date: Date;
  time: string;
  venue: string;
  address: string | null | undefined;
  description: string;
}): string {
  const { title, date, time, venue, address, description } = opts;

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  function gcalDT(d: Date, t: string): string {
    const [hh, mm] = t.split(":").map(Number);
    const y = d.getUTCFullYear();
    const mo = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    return `${y}${mo}${day}T${pad(hh)}${pad(mm)}00`;
  }

  const [hh, mm] = time.split(":").map(Number);
  const endHH = (hh + 2) % 24;
  const start = gcalDT(date, time);
  const end = gcalDT(date, `${pad(endHH)}:${pad(mm)}`);

  const location = [venue, address].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

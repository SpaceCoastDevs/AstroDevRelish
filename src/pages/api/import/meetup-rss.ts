import type { APIRoute } from "astro";

export const prerender = false;

interface RssEvent {
  title: string;
  description: string;
  link: string;
  date?: string; // YYYY-MM-DD, scraped from event page
  time?: string; // HH:MM 24-hour, scraped from event page
}

function extractCdata(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function extractText(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function parseRss(xml: string): RssEvent[] {
  const events: RssEvent[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = extractCdata(item, "title") ?? extractText(item, "title");
    const description = extractCdata(item, "description") ?? extractText(item, "description") ?? "";
    const link = extractText(item, "link") ?? extractCdata(item, "link");
    if (title && link) events.push({ title, description, link });
  }
  return events;
}

function parseDatetime(raw: string): { date: string; time: string } | null {
  // Expects ISO 8601 like "2026-05-19T18:30:00-04:00" or "2026-05-19T18:30-04:00"
  const tIdx = raw.indexOf("T");
  if (tIdx === -1) return null;
  const datePart = raw.slice(0, tIdx);
  const timePart = raw.slice(tIdx + 1, tIdx + 6); // "HH:MM"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart) || !/^\d{2}:\d{2}$/.test(timePart)) return null;
  return { date: datePart, time: timePart };
}

async function scrapeEventDatetime(url: string): Promise<{ date?: string; time?: string }> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return {};
    const html = await res.text();

    // Prefer JSON-LD structured data — most reliable
    for (const [, json] of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const ld = JSON.parse(json);
        const startDate = ld.startDate ?? ld["startDate"];
        if (typeof startDate === "string") {
          const parsed = parseDatetime(startDate);
          if (parsed) return parsed;
        }
      } catch {
        // malformed JSON-LD — continue
      }
    }

    // Fall back to <time datetime="..."> elements
    for (const [, datetime] of html.matchAll(/<time[^>]+datetime="([^"]+)"/gi)) {
      const parsed = parseDatetime(datetime);
      if (parsed) return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http")) url = "https://" + url;
  url = url.replace(/\/$/, "");
  if (url.endsWith("/rss")) return url;
  if (url.endsWith("/events")) return url + "/rss";
  return url + "/events/rss";
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);
  if (!locals.user.groupId) return json({ error: "No group associated with your account." }, 403);

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (!body.url?.trim()) return json({ error: "URL is required." }, 400);

  const rssUrl = normalizeUrl(body.url);

  let parsed: URL;
  try {
    parsed = new URL(rssUrl);
  } catch {
    return json({ error: "Invalid URL." }, 400);
  }

  if (parsed.hostname !== "www.meetup.com" && parsed.hostname !== "meetup.com") {
    return json({ error: "URL must be from meetup.com." }, 400);
  }

  let xml: string;
  try {
    const res = await fetch(rssUrl, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return json({ error: `Could not fetch the RSS feed (${msg}). Check the URL and try again.` }, 502);
  }

  const rawEvents = parseRss(xml);
  if (rawEvents.length === 0) {
    return json({ events: [], message: "No upcoming events found in this feed." });
  }

  // Scrape each event page in parallel to extract date/time
  const events = await Promise.all(
    rawEvents.map(async (ev) => {
      const dt = await scrapeEventDatetime(ev.link);
      return { ...ev, ...dt };
    })
  );

  return json({ events });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

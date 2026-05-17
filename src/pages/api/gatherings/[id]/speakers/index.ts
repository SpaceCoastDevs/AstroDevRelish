import type { APIRoute } from "astro";
import { db, Groups, Meetups, GatheringSpeakers, count } from "astro:db";
import { eq, and } from "astro:db";
import { generateId } from "../../../../../lib/utils";

export const prerender = false;

async function getOwnedMeetup(meetupId: string, groupId: string | null | undefined) {
  if (!groupId) return null;
  const [group] = await db.select().from(Groups).where(eq(Groups.id, groupId));
  if (!group) return null;
  const [meetup] = await db
    .select()
    .from(Meetups)
    .where(and(eq(Meetups.id, meetupId), eq(Meetups.groupId, group.id)));
  return meetup ?? null;
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);

  const meetup = await getOwnedMeetup(params.id!, locals.user.groupId);
  if (!meetup) return json({ error: "Gathering not found." }, 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const b = body as Record<string, unknown>;
  const speakerName = String(b.speakerName ?? "").trim();
  if (!speakerName) return json({ error: "Speaker name is required." }, 400);

  const [{ val: currentCount }] = await db
    .select({ val: count() })
    .from(GatheringSpeakers)
    .where(eq(GatheringSpeakers.gatheringId, meetup.id));

  const speaker = {
    id: generateId(),
    gatheringId: meetup.id,
    speakerName,
    speakerJobTitle: b.speakerJobTitle ? String(b.speakerJobTitle).trim() || null : null,
    speakerCompany: b.speakerCompany ? String(b.speakerCompany).trim() || null : null,
    speakerImageUrl: b.speakerImageUrl ? String(b.speakerImageUrl).trim() || null : null,
    speakerBio: b.speakerBio ? String(b.speakerBio).trim() || null : null,
    sortOrder: currentCount,
    createdAt: new Date(),
  };

  await db.insert(GatheringSpeakers).values(speaker);

  return json({ speaker }, 201);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

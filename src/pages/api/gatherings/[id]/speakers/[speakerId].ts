import type { APIRoute } from "astro";
import { db, Groups, Meetups, GatheringSpeakers, GatheringSessionSpeakers } from "astro:db";
import { eq, and } from "astro:db";

export const prerender = false;

async function getOwnedSpeaker(meetupId: string, speakerId: string, groupId: string | null | undefined) {
  if (!groupId) return null;
  const [group] = await db.select().from(Groups).where(eq(Groups.id, groupId));
  if (!group) return null;
  const [meetup] = await db
    .select()
    .from(Meetups)
    .where(and(eq(Meetups.id, meetupId), eq(Meetups.groupId, group.id)));
  if (!meetup) return null;
  const [speaker] = await db
    .select()
    .from(GatheringSpeakers)
    .where(and(eq(GatheringSpeakers.id, speakerId), eq(GatheringSpeakers.gatheringId, meetupId)));
  return speaker ?? null;
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);

  const speaker = await getOwnedSpeaker(params.id!, params.speakerId!, locals.user.groupId);
  if (!speaker) return json({ error: "Speaker not found." }, 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const b = body as Record<string, unknown>;
  const speakerName = String(b.speakerName ?? "").trim();
  if (!speakerName) return json({ error: "Speaker name is required." }, 400);

  const updates = {
    speakerName,
    speakerJobTitle: b.speakerJobTitle ? String(b.speakerJobTitle).trim() || null : null,
    speakerCompany: b.speakerCompany ? String(b.speakerCompany).trim() || null : null,
    speakerImageUrl: b.speakerImageUrl ? String(b.speakerImageUrl).trim() || null : null,
    speakerBio: b.speakerBio ? String(b.speakerBio).trim() || null : null,
  };

  await db.update(GatheringSpeakers).set(updates).where(eq(GatheringSpeakers.id, speaker.id));

  return json({ speaker: { ...speaker, ...updates } });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);

  const speaker = await getOwnedSpeaker(params.id!, params.speakerId!, locals.user.groupId);
  if (!speaker) return json({ error: "Speaker not found." }, 404);

  // Remove from any session assignments first (no cascade in AstroDB)
  await db.delete(GatheringSessionSpeakers).where(eq(GatheringSessionSpeakers.speakerId, speaker.id));
  await db.delete(GatheringSpeakers).where(eq(GatheringSpeakers.id, speaker.id));

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

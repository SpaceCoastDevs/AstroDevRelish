import type { APIRoute } from "astro";
import { db, Groups, Meetups, GatheringSessions, GatheringSessionSpeakers, count } from "devrelish:db";
import { eq, and } from "devrelish:db";
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
  const title = String(b.title ?? "").trim();
  if (!title) return json({ error: "Session title is required." }, 400);

  const speakerIds = Array.isArray(b.speakerIds) ? (b.speakerIds as string[]) : [];

  const [{ val: currentCount }] = await db
    .select({ val: count() })
    .from(GatheringSessions)
    .where(eq(GatheringSessions.gatheringId, meetup.id));

  const sessionId = generateId();
  const session = {
    id: sessionId,
    gatheringId: meetup.id,
    title,
    abstract: b.abstract ? String(b.abstract).trim() || null : null,
    startTime: b.startTime ? String(b.startTime).trim() || null : null,
    sortOrder: currentCount,
    createdAt: new Date(),
  };

  await db.insert(GatheringSessions).values(session);

  if (speakerIds.length > 0) {
    await db.insert(GatheringSessionSpeakers).values(
      speakerIds.map((speakerId, i) => ({
        id: generateId(),
        sessionId,
        speakerId,
        sortOrder: i,
      }))
    );
  }

  return json({ session: { ...session, speakerIds } }, 201);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

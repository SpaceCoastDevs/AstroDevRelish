import type { APIRoute } from "astro";
import { db, Groups, Meetups, GatheringSessions, GatheringSessionSpeakers } from "astro:db";
import { eq, and } from "astro:db";
import { generateId } from "../../../../../lib/utils";

export const prerender = false;

async function getOwnedSession(meetupId: string, sessionId: string, groupId: string | null | undefined) {
  if (!groupId) return null;
  const [group] = await db.select().from(Groups).where(eq(Groups.id, groupId));
  if (!group) return null;
  const [meetup] = await db
    .select()
    .from(Meetups)
    .where(and(eq(Meetups.id, meetupId), eq(Meetups.groupId, group.id)));
  if (!meetup) return null;
  const [session] = await db
    .select()
    .from(GatheringSessions)
    .where(and(eq(GatheringSessions.id, sessionId), eq(GatheringSessions.gatheringId, meetupId)));
  return session ?? null;
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);

  const session = await getOwnedSession(params.id!, params.sessionId!, locals.user.groupId);
  if (!session) return json({ error: "Session not found." }, 404);

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

  const updates = {
    title,
    abstract: b.abstract ? String(b.abstract).trim() || null : null,
    startTime: b.startTime ? String(b.startTime).trim() || null : null,
  };

  await db.update(GatheringSessions).set(updates).where(eq(GatheringSessions.id, session.id));

  // Replace speaker assignments
  await db.delete(GatheringSessionSpeakers).where(eq(GatheringSessionSpeakers.sessionId, session.id));
  if (speakerIds.length > 0) {
    await db.insert(GatheringSessionSpeakers).values(
      speakerIds.map((speakerId, i) => ({
        id: generateId(),
        sessionId: session.id,
        speakerId,
        sortOrder: i,
      }))
    );
  }

  return json({ session: { ...session, ...updates, speakerIds } });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized." }, 401);

  const session = await getOwnedSession(params.id!, params.sessionId!, locals.user.groupId);
  if (!session) return json({ error: "Session not found." }, 404);

  await db.delete(GatheringSessionSpeakers).where(eq(GatheringSessionSpeakers.sessionId, session.id));
  await db.delete(GatheringSessions).where(eq(GatheringSessions.id, session.id));

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

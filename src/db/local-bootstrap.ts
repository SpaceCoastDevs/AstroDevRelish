import type { Client } from "@libsql/client";

const schemaSql = `
CREATE TABLE IF NOT EXISTS "Groups" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL UNIQUE,
  "slug" text NOT NULL UNIQUE,
  "customSlug" text UNIQUE,
  "city" text,
  "region" text,
  "country" text,
  "tagline" text,
  "tags" text,
  "category" text,
  "website" text,
  "blueskyHandle" text,
  "linkedinUrl" text,
  "description" text NOT NULL,
  "contactEmail" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "managerId" text,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "Meetups" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "date" integer NOT NULL,
  "time" text NOT NULL,
  "venue" text NOT NULL,
  "address" text,
  "city" text,
  "country" text,
  "eventContext" text,
  "tags" text,
  "capacity" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "RSVPs" (
  "id" text PRIMARY KEY NOT NULL,
  "meetupId" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "jobTitle" text NOT NULL,
  "company" text NOT NULL,
  "cancelToken" text UNIQUE,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "GroupInvites" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL,
  "createdAt" integer NOT NULL,
  "expiresAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "ContactMessages" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "message" text NOT NULL,
  "read" integer NOT NULL DEFAULT 0,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "GatheringSpeakers" (
  "id" text PRIMARY KEY NOT NULL,
  "gatheringId" text NOT NULL,
  "speakerName" text NOT NULL,
  "speakerJobTitle" text,
  "speakerCompany" text,
  "speakerImageUrl" text,
  "speakerBio" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "GatheringSessions" (
  "id" text PRIMARY KEY NOT NULL,
  "gatheringId" text NOT NULL,
  "title" text NOT NULL,
  "abstract" text,
  "startTime" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "GatheringSessionSpeakers" (
  "id" text PRIMARY KEY NOT NULL,
  "sessionId" text NOT NULL,
  "speakerId" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Followers" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "confirmed" integer NOT NULL DEFAULT 0,
  "token" text NOT NULL UNIQUE,
  "createdAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" integer NOT NULL DEFAULT 0,
  "image" text,
  "createdAt" integer NOT NULL,
  "updatedAt" integer NOT NULL,
  "role" text,
  "banned" integer,
  "banReason" text,
  "banExpires" integer,
  "groupId" text
);
`;

function addMonths(date: Date, months: number, day: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  next.setDate(day);
  next.setHours(18, 0, 0, 0);
  return next.getTime();
}

export async function bootstrapLocalDatabase(client: Client, seed = true) {
  await client.executeMultiple(schemaSql);

  if (!seed) return;

  const groups = await client.execute(`select count(*) as "count" from "Groups"`);
  if (Number(groups.rows[0]?.count ?? 0) > 0) return;

  const now = Date.now();
  const nextMonth = addMonths(new Date(), 1, 15);
  const twoMonths = addMonths(new Date(), 2, 8);

  await client.batch([
    {
      sql: `insert into "User" ("id", "name", "email", "emailVerified", "role", "groupId", "createdAt", "updatedAt") values (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ["admin-001", "Site Admin", "admin@devrelish.tech", 1, "admin", null, now, now],
    },
    {
      sql: `insert into "User" ("id", "name", "email", "emailVerified", "role", "groupId", "createdAt", "updatedAt") values (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ["manager-001", "Alex Chen", "alex@example.com", 1, "user", "group-sf", now, now],
    },
    {
      sql: `insert into "User" ("id", "name", "email", "emailVerified", "role", "groupId", "createdAt", "updatedAt") values (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ["manager-002", "Sam Rivera", "sam@example.com", 1, "user", "group-nyc", now, now],
    },
    {
      sql: `insert into "Groups" ("id", "name", "slug", "customSlug", "category", "tagline", "city", "region", "country", "description", "contactEmail", "status", "managerId", "createdAt") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "group-sf",
        "DevRel(ish) San Francisco",
        "san-francisco",
        "devrel-sf",
        "devrel",
        "Putting faces to the names you see in Slack",
        "San Francisco",
        "CA",
        "USA",
        "A cozy gathering for DevRel folks, developer advocates, community managers, and anyone who finds themselves doing the job without the title.",
        "alex@example.com",
        "approved",
        "manager-001",
        now,
      ],
    },
    {
      sql: `insert into "Groups" ("id", "name", "slug", "customSlug", "category", "tagline", "city", "region", "country", "description", "contactEmail", "status", "managerId", "createdAt") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "group-nyc",
        "Cloud Native NYC",
        "cloud-native-nyc",
        "cloud-native-nyc",
        "cloud-native",
        "Kubernetes, containers, and good company in New York",
        "New York",
        "NY",
        "USA",
        "Where the cloud-native people of NYC come to breathe, laugh, and talk shop away from the keyboard.",
        "sam@example.com",
        "approved",
        "manager-002",
        now,
      ],
    },
    {
      sql: `insert into "Meetups" ("id", "groupId", "title", "description", "date", "time", "venue", "address", "city", "country", "capacity", "status", "createdAt") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "meetup-001",
        "group-sf",
        "Spring Social Gathering",
        "Kick off spring with fellow DevRel humans. Good drinks, better conversation, and zero conference talk.",
        nextMonth,
        "18:30",
        "The Interval at Long Now",
        "2 Marina Blvd, San Francisco, CA 94123",
        "San Francisco",
        "USA",
        40,
        "active",
        now,
      ],
    },
    {
      sql: `insert into "Meetups" ("id", "groupId", "title", "description", "date", "time", "venue", "address", "city", "country", "capacity", "status", "createdAt") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "meetup-002",
        "group-nyc",
        "Rooftop Mixer",
        "Views of the skyline, good vibes, and great company with other cloud-native folks.",
        twoMonths,
        "18:00",
        "230 Fifth Rooftop Bar",
        "230 5th Ave, New York, NY 10001",
        "New York",
        "USA",
        50,
        "active",
        now,
      ],
    },
  ]);
}

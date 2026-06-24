import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) =>
  integer(name, { mode: "timestamp" }).notNull().$defaultFn(() => new Date());

export const Groups = sqliteTable("Groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  customSlug: text("customSlug").unique(),
  city: text("city"),
  region: text("region"),
  country: text("country"),
  tagline: text("tagline"),
  tags: text("tags"),
  category: text("category"),
  website: text("website"),
  blueskyHandle: text("blueskyHandle"),
  linkedinUrl: text("linkedinUrl"),
  description: text("description").notNull(),
  contactEmail: text("contactEmail").notNull(),
  status: text("status").notNull().default("pending"),
  managerId: text("managerId"),
  createdAt: timestamp("createdAt"),
});

export const Meetups = sqliteTable("Meetups", {
  id: text("id").primaryKey(),
  groupId: text("groupId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  eventContext: text("eventContext"),
  tags: text("tags"),
  capacity: integer("capacity").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("createdAt"),
});

export const RSVPs = sqliteTable("RSVPs", {
  id: text("id").primaryKey(),
  meetupId: text("meetupId").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  jobTitle: text("jobTitle").notNull(),
  company: text("company").notNull(),
  cancelToken: text("cancelToken").unique(),
  createdAt: timestamp("createdAt"),
});

export const GroupInvites = sqliteTable("GroupInvites", {
  id: text("id").primaryKey(),
  groupId: text("groupId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export const ContactMessages = sqliteTable("ContactMessages", {
  id: text("id").primaryKey(),
  groupId: text("groupId").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: timestamp("createdAt"),
});

export const GatheringSpeakers = sqliteTable("GatheringSpeakers", {
  id: text("id").primaryKey(),
  gatheringId: text("gatheringId").notNull(),
  speakerName: text("speakerName").notNull(),
  speakerJobTitle: text("speakerJobTitle"),
  speakerCompany: text("speakerCompany"),
  speakerImageUrl: text("speakerImageUrl"),
  speakerBio: text("speakerBio"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt"),
});

export const GatheringSessions = sqliteTable("GatheringSessions", {
  id: text("id").primaryKey(),
  gatheringId: text("gatheringId").notNull(),
  title: text("title").notNull(),
  abstract: text("abstract"),
  startTime: text("startTime"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt"),
});

export const GatheringSessionSpeakers = sqliteTable("GatheringSessionSpeakers", {
  id: text("id").primaryKey(),
  sessionId: text("sessionId").notNull(),
  speakerId: text("speakerId").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
});

export const Followers = sqliteTable("Followers", {
  id: text("id").primaryKey(),
  groupId: text("groupId").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt"),
});

export const User = sqliteTable("User", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("banReason"),
  banExpires: integer("banExpires", { mode: "timestamp" }),
  groupId: text("groupId"),
});

export const schema = {
  Groups,
  Meetups,
  RSVPs,
  GatheringSpeakers,
  GatheringSessions,
  GatheringSessionSpeakers,
  GroupInvites,
  ContactMessages,
  Followers,
  User,
};

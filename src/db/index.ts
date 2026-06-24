import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, asc, count, desc, eq, gt, gte, inArray, isNotNull } from "drizzle-orm";

import { bootstrapLocalDatabase } from "./local-bootstrap";
import * as schemaModule from "./schema";

export * from "./schema";
export { and, asc, count, desc, eq, gt, gte, inArray, isNotNull };

const url = import.meta.env.DEVRELISH_DATABASE_URL ?? import.meta.env.DATABASE_URL ?? "file:./devrelish.db";
const authToken = import.meta.env.DEVRELISH_DATABASE_AUTH_TOKEN ?? import.meta.env.DATABASE_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

if (import.meta.env.DEV && url.startsWith("file:")) {
  await bootstrapLocalDatabase(client, import.meta.env.DEVRELISH_SEED !== "false");
}

export const db = drizzle(client, { schema: schemaModule.schema });

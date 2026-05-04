import { resolveMigrationConnection } from "../packages/db/src/migration-runtime.js";
import { createDb } from "../packages/db/src/client.js";
import { agents } from "../packages/db/src/schema/index.js";
import { sql } from "drizzle-orm";

async function cleanup() {
  const connection = await resolveMigrationConnection();
  const db = createDb(connection.connectionString);
  try {
    const result = await db.delete(agents).where(sql`metadata->>'is_bmad' = 'true'`);
    console.log("Deleted BMad agents.");
  } finally {
    await connection.stop();
  }
}
cleanup().catch(console.error);

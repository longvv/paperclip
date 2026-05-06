import { createDb } from "./client.js";
import { heartbeatRuns } from "./schema/index.js";
import { desc, eq } from "drizzle-orm";

async function main() {
  const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/paperclip";
  const db = createDb(url);
  
  const runs = await db.select()
    .from(heartbeatRuns)
    .orderBy(desc(heartbeatRuns.createdAt))
    .limit(5);
    
  console.log(JSON.stringify(runs, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

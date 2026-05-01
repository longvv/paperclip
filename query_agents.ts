import { createDb } from "./packages/db/src/client.js";
import { agents } from "./packages/db/src/schema/index.js";

const db = createDb(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres");

async function run() {
  const allAgents = await db.select().from(agents);
  console.log(JSON.stringify(allAgents, null, 2));
  process.exit(0);
}
run();

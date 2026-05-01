import { createDb } from "./src/client.js";
import { agents } from "./src/schema/index.js";
import { PGlite } from "@electric-sql/pglite/dist/index.cjs";
import { drizzle as drizzlePg } from "drizzle-orm/pglite";

const sql = new PGlite("../../data/pglite");
const db = drizzlePg(sql);

async function run() {
  const allAgents = await db.select().from(agents);
  console.log(JSON.stringify(allAgents, null, 2));
  process.exit(0);
}
run();

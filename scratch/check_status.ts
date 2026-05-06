
import { createDb } from "../packages/db/src/client.js";
import { heartbeatRuns, agents } from "../packages/db/src/schema/index.js";
import { eq, and, inArray } from "drizzle-orm";

const db = createDb(process.env.DATABASE_URL || "postgres://paperclip:paperclip@127.0.0.1:54329/paperclip");

async function run() {
  try {
    const activeRuns = await db
      .select({
        id: heartbeatRuns.id,
        agentId: heartbeatRuns.agentId,
        status: heartbeatRuns.status,
        invocationSource: heartbeatRuns.invocationSource,
        triggerDetail: heartbeatRuns.triggerDetail,
        createdAt: heartbeatRuns.createdAt,
      })
      .from(heartbeatRuns)
      .where(inArray(heartbeatRuns.status, ["running", "queued"]))
      .orderBy(heartbeatRuns.createdAt);

    console.log("Active Runs:");
    console.log(JSON.stringify(activeRuns, null, 2));

    const allAgents = await db.select().from(agents);
    console.log("\nAgents Status:");
    console.log(JSON.stringify(allAgents.map(a => ({ id: a.id, name: a.name, status: a.status })), null, 2));

  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    process.exit(0);
  }
}

run();

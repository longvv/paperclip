import { db } from "./src/db";
import { agents } from "./src/schema/agents";

async function run() {
  const res = await db.select({ id: agents.id, name: agents.name, adapterConfig: agents.adapterConfig }).from(agents);
  console.log(JSON.stringify(res, null, 2));
}
run();

import { createDb, assets } from "@paperclipai/db";
import { loadConfig } from "../config.js";

async function main() {
  const config = await loadConfig();
  if (!config.databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const db = createDb(config.databaseUrl);
  const rows = await db.select().from(assets).limit(10);

  console.log("Recent assets:");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

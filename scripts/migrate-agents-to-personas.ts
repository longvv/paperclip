import { createDb, agents } from "../packages/db/src/index.ts";
import { eq, sql } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "postgres://paperclip:paperclip@db:5432/paperclip";
  console.log(`Connecting to ${dbUrl}...`);
  const db = createDb(dbUrl);
  
  const mappingPath = join(process.cwd(), "scratch/bmad-persona-mapping.json");
  if (!existsSync(mappingPath)) {
    console.error(`Mapping file not found at ${mappingPath}`);
    process.exit(1);
  }
  
  const mapping = JSON.parse(readFileSync(mappingPath, "utf-8"));
  
  const allAgents = await db.select().from(agents);
  console.log(`Checking ${allAgents.length} agents...`);

  let count = 0;
  for (const agent of allAgents) {
    if (agent.bmadPersona) {
      console.log(`Agent "${agent.name}" already has persona "${agent.bmadPersona}", skipping.`);
      continue;
    }

    let matchedPersona: string | null = null;
    const name = agent.name.toLowerCase();
    const title = (agent.title || "").toLowerCase();
    const role = (agent.role || "").toLowerCase();

    for (const [persona, keywords] of Object.entries(mapping)) {
      const keywordList = (keywords as string).split(",").map(k => k.trim().toLowerCase());
      
      const match = keywordList.some(k => 
        name.includes(k) || title.includes(k) || role.includes(k)
      );

      if (match) {
        matchedPersona = persona;
        break;
      }
    }

    if (matchedPersona) {
      console.log(`Linking agent "${agent.name}" (${agent.id}) -> "${matchedPersona}"`);
      // Use raw SQL to avoid any schema mismatch issues in the script
      await db.execute(sql`UPDATE agents SET bmad_persona = ${matchedPersona} WHERE id = ${agent.id}`);
      count++;
    }
  }

  console.log(`Migration complete. Linked ${count} agents.`);
}

main().catch(console.error);

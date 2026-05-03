import { resolve } from "node:path";
import { execSync } from "node:child_process";
// @ts-ignore
import { resolveMigrationConnection } from "../packages/db/src/migration-runtime.js";
// @ts-ignore
import { createDb } from "../packages/db/src/client.js";
// @ts-ignore
import { agents, companies } from "../packages/db/src/schema/index.js";
import { eq } from "drizzle-orm";

async function syncAgents() {
  const projectRoot = process.cwd();
  
  console.log("Connecting to database...");
  const connection = await resolveMigrationConnection();
  const db = createDb(connection.connectionString);

  try {
    const companyList = await db.select().from(companies).limit(1);
    if (companyList.length === 0) {
      console.error("No companies found in database.");
      return;
    }
    const companyId = companyList[0].id;

    const resolverPath = resolve(projectRoot, "_bmad/scripts/resolve_config.py");
    const output = execSync(`python3 ${resolverPath} -p ${projectRoot} --key agents`).toString();
    const bmadAgents = JSON.parse(output).agents;

    for (const [key, bmadAgent] of Object.entries(bmadAgents) as [string, any][]) {
      console.log(`Syncing agent: ${key}...`);
      
      const loaderCmd = `tsx scripts/bmad-loader.ts ${key}`;
      const loaderOutput = execSync(loaderCmd).toString();
      const resolved = JSON.parse(loaderOutput);

      const existing = await db.select().from(agents).where(eq(agents.name, bmadAgent.name)).limit(1);
      
      const agentData = {
        companyId,
        name: bmadAgent.name,
        role: key,
        title: bmadAgent.title,
        icon: bmadAgent.icon,
        capabilities: resolved.capabilities,
        adapterType: "opencode_local",
        adapterConfig: {
          model: "anthropic/claude-3-5-sonnet",
          promptTemplate: `${resolved.systemPrompt}\n\n{{context.paperclipSessionHandoffMarkdown}}\n\n{{prompt}}`,
          bmad_role: key
        },
        metadata: {
          bmad_grounding: resolved.systemPrompt,
          module: bmadAgent.module,
          team: bmadAgent.team,
          is_bmad: true
        }
      };

      if (existing.length > 0) {
        await db.update(agents).set(agentData).where(eq(agents.id, existing[0].id));
      } else {
        await db.insert(agents).values(agentData);
      }
    }
    console.log("Sync complete!");
  } finally {
    await connection.stop();
  }
}

syncAgents().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});

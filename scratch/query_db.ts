import { createDb } from "../packages/db/src/client.js";
import { companies, agents, agentApiKeys } from "../packages/db/src/schema/index.js";
import path from "node:path";
import os from "node:os";

async function main() {
  const dbPath = path.resolve(os.homedir(), ".paperclip/instances/default/db");
  console.log(`Connecting to local DB at ${dbPath}`);
  
  const db = createDb(`pglite://${dbPath}`);
  
  const allCompanies = await db.select().from(companies);
  console.log("Companies:", JSON.stringify(allCompanies, null, 2));
  
  const lonCompany = allCompanies.find(c => c.id === 'LON' || c.name.includes('LON'));
  if (lonCompany) {
    console.log(`Found LON company: ${lonCompany.id}`);
    const lonAgents = await db.select().from(agents).where({ companyId: lonCompany.id });
    console.log("Agents for LON:", JSON.stringify(lonAgents, null, 2));
    
    for (const agent of lonAgents) {
      // @ts-ignore
      const keys = await db.select().from(agentApiKeys).where({ agentId: agent.id });
      console.log(`Keys for agent ${agent.name}:`, JSON.stringify(keys, null, 2));
    }
  } else {
    console.log("LON company not found in local DB.");
  }
}

main().catch(console.error);

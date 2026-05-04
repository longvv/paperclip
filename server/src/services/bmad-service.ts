import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { logger } from "../middleware/logger.js";

export interface BMadPersona {
  key: string;
  name?: string;
  role: string;
  capabilities: string;
  systemPrompt: string;
}

export function bmadService() {
  const projectRoot = process.cwd();
  const bmadDir = resolve(projectRoot, "_bmad");
  const resolverPath = resolve(bmadDir, "scripts/resolve_config.py");
  const custResolverPath = resolve(bmadDir, "scripts/resolve_customization.py");

  function isAvailable() {
    return existsSync(bmadDir) && existsSync(resolverPath);
  }

  async function listRoles(): Promise<string[]> {
    if (!isAvailable()) return [];
    
    try {
      const cmd = `python3 ${resolverPath} -p ${projectRoot} --key agents`;
      const output = execSync(cmd).toString();
      const config = JSON.parse(output);
      const agents = config.agents || {};
      return Object.keys(agents);
    } catch (err) {
      logger.error({ err }, "Failed to list BMad roles");
      return [];
    }
  }

  async function resolvePersona(agentKey: string): Promise<BMadPersona | null> {
    if (!isAvailable()) return null;

    try {
      // 1. Resolve agent config
      const cmd = `python3 ${resolverPath} -p ${projectRoot} --key agents.${agentKey}`;
      const output = execSync(cmd).toString();
      const fullConfig = JSON.parse(output);
      const agentConfig = fullConfig[`agents.${agentKey}`];

      if (!agentConfig) return null;

      // 2. Resolve customization
      const skillPath = resolve(projectRoot, `.agent/skills/${agentKey}`);
      let customization: any = {};
      if (existsSync(skillPath)) {
        try {
          const custCmd = `python3 ${custResolverPath} --skill ${skillPath}`;
          const custOutput = execSync(custCmd).toString();
          customization = JSON.parse(custOutput);
        } catch (e) {
          logger.warn({ e, agentKey }, "Failed to resolve BMad customization for agent");
        }
      }

      const name = customization.agent?.name || agentConfig.name;
      const title = customization.agent?.title || agentConfig.title;
      const description = customization.agent?.identity || agentConfig.description;
      const menu = customization.agent?.menu || [];

      const identitySeed = `You are ${name}, the ${title}. ${description}`;
      const grounding = `
## Sacred Truth
Every session is a rebirth. Your mission is to serve the Paperclip Company Goal.
Ground every action in the project context and existing artifacts.

## BMad Methodology
You follow the BMad Outcome-Driven approach. 
Define what you achieve, not how you do it.
Use your specialized skills as tools when appropriate.
`;

      const capabilities = menu
        .map((m: any) => `${m.skill || m.code}: ${m.description || "No description provided"}`)
        .join("\n");

      const systemPrompt = `${identitySeed}\n${grounding}\n## Capabilities\n${menu.map((m: any) => `- **${m.skill || m.code}**: ${m.description || "No description provided"}`).join("\n")}`;

      return {
        key: agentKey,
        name,
        role: title,
        capabilities,
        systemPrompt,
      };
    } catch (err) {
      logger.error({ err, agentKey }, "Failed to resolve BMad persona");
      return null;
    }
  }

  return {
    isAvailable,
    listRoles,
    resolvePersona,
  };
}

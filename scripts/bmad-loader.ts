import { execSync } from "node:child_process";
import { resolve } from "node:path";

async function loadBmadAgent(agentKey: string) {
  const projectRoot = process.cwd();
  const resolverPath = resolve(projectRoot, "_bmad/scripts/resolve_config.py");
  
  const cmd = `python3 ${resolverPath} -p ${projectRoot} --key agents.${agentKey}`;
  const output = execSync(cmd).toString();
  const fullConfig = JSON.parse(output);
  const agentConfig = fullConfig[`agents.${agentKey}`];

  if (!agentConfig) {
    throw new Error(`Agent ${agentKey} not found in BMad config`);
  }

  const custResolverPath = resolve(projectRoot, "_bmad/scripts/resolve_customization.py");
  const skillPath = resolve(projectRoot, `.agent/skills/${agentKey}`);
  
  let customization: any = {};
  try {
    const custCmd = `python3 ${custResolverPath} --skill ${skillPath}`;
    const custOutput = execSync(custCmd).toString();
    customization = JSON.parse(custOutput);
  } catch (e) {}

  const name = customization.agent?.name || agentConfig.name;
  const title = customization.agent?.title || agentConfig.title;
  const description = customization.agent?.identity || agentConfig.description;
  
  const identitySeed = `You are ${name}, the ${title}. ${description}`;
  const menu = customization.agent?.menu || [];

  const grounding = `
## Sacred Truth
Every session is a rebirth. Your mission is to serve the Paperclip Company Goal.
Ground every action in the project context and existing artifacts.

## BMad Methodology
You follow the BMad Outcome-Driven approach. 
Define what you achieve, not how you do it.
Use your specialized skills as tools when appropriate.
`;

  return {
    role: title,
    capabilities: menu.map((m: any) => `${m.skill || m.code}: ${m.description || "No description provided"}`).join("\n"),
    systemPrompt: `${identitySeed}\n${grounding}\n## Capabilities\n${menu.map((m: any) => `- **${m.skill || m.code}**: ${m.description || "No description provided"}`).join("\n")}`
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const agentKey = process.argv[2] || "bmad-agent-dev";
  loadBmadAgent(agentKey).then(res => {
    console.log(JSON.stringify(res, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

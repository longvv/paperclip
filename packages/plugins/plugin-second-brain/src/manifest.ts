import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const PLUGIN_ID = "paperclip.second-brain";
const PLUGIN_VERSION = "0.1.0";

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Second Brain",
  description: "Knowledge Graph Brain for indexing and linking company context.",
  author: "Antigravity",
  categories: ["automation"],
  tools: [
    {
      name: "query_knowledge",
      displayName: "Query Knowledge",
      description: "Queries the Second Brain knowledge graph for relevant context on a topic, project, or issue.",
      parametersSchema: { type: "object", properties: { query: { type: "string" } } }
    },
    {
      name: "get_entity_relationships",
      displayName: "Get Entity Relationships",
      description: "Retrieves the linked entities (parent/child/related) for a specific entity.",
      parametersSchema: { type: "object", properties: { entityType: { type: "string" }, entityId: { type: "string" } } }
    },
    {
      name: "suggest_related_context",
      displayName: "Suggest Related Context",
      description: "Suggests potentially relevant entities based on keywords or content analysis.",
      parametersSchema: { type: "object", properties: { content: { type: "string" } } }
    }
  ],
  capabilities: [
    "events.subscribe",
    "agent.tools.register",
    "plugin.state.read",
    "plugin.state.write",
  ],
  entrypoints: {
    worker: "./dist/worker.js"
  }
};

export default manifest;

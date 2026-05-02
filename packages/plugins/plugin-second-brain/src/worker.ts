import { 
  definePlugin, 
  PluginContext, 
  PluginEvent,
  ToolRunContext,
  ToolResult
} from "@paperclipai/plugin-sdk";

/**
 * Second Brain Plugin
 * 
 * Indexes system entities (issues, documents, goals) into a searchable context graph
 * for agents to use as long-term memory.
 */
export default definePlugin({
  async setup(ctx: PluginContext) {
    ctx.logger.info("Second Brain plugin starting up");

    // 1. Subscribe to events to index data
    
    // Index issues
    ctx.events.on("issue.created", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "issue", event.entityId!, event.companyId, event.payload);
    });

    ctx.events.on("issue.updated", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "issue", event.entityId!, event.companyId, event.payload);
    });

    // Index goals
    ctx.events.on("goal.created", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "goal", event.entityId!, event.companyId, event.payload);
    });

    ctx.events.on("goal.updated", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "goal", event.entityId!, event.companyId, event.payload);
    });

    // Index documents
    ctx.events.on("issue.document_created", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "document", event.payload.documentId, event.companyId, event.payload);
    });

    ctx.events.on("issue.document_updated", async (event: PluginEvent<any>) => {
      await indexEntity(ctx, "document", event.payload.documentId, event.companyId, event.payload);
    });

    // 2. Register Agent Tools

    ctx.tools.register(
      "query_knowledge",
      {
        displayName: "Query Knowledge",
        description: "Queries the Second Brain knowledge graph for relevant context on a topic, project, or issue.",
        parametersSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or keywords" },
            limit: { type: "number", description: "Max results to return", default: 5 }
          },
          required: ["query"]
        }
      },
      async (args: any, runCtx: ToolRunContext): Promise<ToolResult> => {
        const results = await searchKnowledge(ctx, args.query, args.limit, runCtx.companyId);
        return { data: { results } };
      }
    );

    ctx.tools.register(
      "get_entity_relationships",
      {
        displayName: "Get Entity Relationships",
        description: "Retrieves the linked entities (parent/child/related) for a specific entity.",
        parametersSchema: {
          type: "object",
          properties: {
            entityType: { type: "string", enum: ["issue", "goal", "project", "document"] },
            entityId: { type: "string", description: "UUID or identifier of the entity" }
          },
          required: ["entityType", "entityId"]
        }
      },
      async (args: any, runCtx: ToolRunContext): Promise<ToolResult> => {
        const relations = await getRelationships(ctx, args.entityType, args.entityId, runCtx.companyId);
        return { data: { relations } };
      }
    );

    ctx.tools.register(
      "suggest_related_context",
      {
        displayName: "Suggest Related Context",
        description: "Suggests potentially relevant entities based on keywords or content analysis.",
        parametersSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Text content to find related entities for" },
            limit: { type: "number", description: "Max suggestions to return", default: 3 }
          },
          required: ["content"]
        }
      },
      async (args: any, runCtx: ToolRunContext): Promise<ToolResult> => {
        // Simple keyword-based suggestion
        const suggestions = await searchKnowledge(ctx, args.content, args.limit, runCtx.companyId);
        return { data: { suggestions } };
      }
    );

    ctx.logger.info("Second Brain plugin setup complete");
  },

  async onHealth() {
    return { status: "ok" };
  }
});

// Helper: Search indexed knowledge in plugin_entities
async function searchKnowledge(ctx: PluginContext, query: string, limit: number, companyId: string) {
  // Since we don't have a content search in ctx.entities.list, we fetch all for the company and filter
  // In a real production app, we would use a more efficient search strategy.
  const entities = await ctx.entities.list({
    scopeKind: "company",
    scopeId: companyId,
    limit: 100 // Reasonable limit for now
  });

  const queryLower = query.toLowerCase();
  
  return entities
    .filter((e) => {
      const searchableText = `${e.title || ""} ${JSON.stringify(e.data)}`.toLowerCase();
      return searchableText.includes(queryLower);
    })
    .slice(0, limit);
}

// Helper: Get relationships for an entity
async function getRelationships(ctx: PluginContext, type: string, id: string, companyId: string) {
  const stateKey = `links:${type}:${id}`;
  
  const value = await ctx.state.get({
    scopeKind: "company",
    scopeId: companyId,
    stateKey
  }) as { links: any[] } | null;

  return value?.links || [];
}

// Helper: Index an entity into plugin_entities
async function indexEntity(ctx: PluginContext, type: string, id: string, companyId: string, data: any) {
  // Store entity data
  await ctx.entities.upsert({
    entityType: type,
    scopeKind: "company",
    scopeId: companyId,
    externalId: id,
    title: data.title || data.name || `${type} ${id}`,
    data: {
      ...data,
      indexedAt: new Date().toISOString()
    }
  });

  // Extract and store links
  const links = [];
  if (data.parentId) links.push({ type, id: data.parentId, relation: "parent" });
  if (data.projectId) links.push({ type: "project", id: data.projectId, relation: "project" });
  if (data.goalId) links.push({ type: "goal", id: data.goalId, relation: "goal" });
  if (data.issueId) links.push({ type: "issue", id: data.issueId, relation: "issue" });

  if (links.length > 0) {
    const stateKey = `links:${type}:${id}`;
    await ctx.state.set({
      scopeKind: "company",
      scopeId: companyId,
      stateKey
    }, { links });

    // Also index reverse links for discoverability
    for (const link of links) {
      const revKey = `links:${link.type}:${link.id}`;
      const revValue = await ctx.state.get({
        scopeKind: "company",
        scopeId: companyId,
        stateKey: revKey
      }) as { links: any[] } | null;
      
      const revLinks = revValue?.links || [];
      if (!revLinks.some((l: any) => l.type === type && l.id === id)) {
        revLinks.push({ type, id, relation: link.relation === "parent" ? "child" : "related" });
        await ctx.state.set({
          scopeKind: "company",
          scopeId: companyId,
          stateKey: revKey
        }, { links: revLinks });
      }
    }
  }
}

import "dotenv/config";
import { createDb } from "./client.js";
import { heartbeatRuns, issues, agentWakeupRequests } from "./schema/index.js";
import { inArray, isNotNull, notInArray, and } from "drizzle-orm";

async function main() {
  const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/paperclip";
  const db = createDb(url);

  console.log("Stopping all running and queued runs...");
  const stoppedRuns = await db.update(heartbeatRuns)
    .set({
      status: "cancelled",
      error: "Manually stopped by admin request",
      finishedAt: new Date()
    })
    .where(inArray(heartbeatRuns.status, ["running", "queued"]))
    .returning({ id: heartbeatRuns.id });
    
  console.log(`Stopped ${stoppedRuns.length} runs.`);

  console.log("Releasing issue execution locks...");
  const updatedIssues = await db.update(issues)
    .set({
      executionRunId: null,
      executionAgentNameKey: null,
      executionLockedAt: null,
      updatedAt: new Date()
    })
    .where(isNotNull(issues.executionRunId))
    .returning({ id: issues.id });
    
  console.log(`Released ${updatedIssues.length} issues.`);

  console.log("Finding issues assigned to agents...");
  const assignedIssues = await db.select()
    .from(issues)
    .where(
      and(
        isNotNull(issues.assigneeAgentId),
        notInArray(issues.status, ["done", "cancelled", "closed"])
      )
    );

  console.log(`Found ${assignedIssues.length} assigned issues. Re-enqueuing wakeups...`);

  let count = 0;
  for (const issue of assignedIssues) {
    if (!issue.assigneeAgentId) continue;
    await db.insert(agentWakeupRequests).values({
      companyId: issue.companyId,
      agentId: issue.assigneeAgentId,
      source: "issue_assigned",
      triggerDetail: issue.id,
      reason: "Manual restart of assigned issues",
      payload: { issueId: issue.id },
      status: "pending"
    });
    count++;
  }
  
  console.log(`Enqueued ${count} wakeups. Done!`);
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error", err);
  process.exit(1);
});

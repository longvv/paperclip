import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveDefaultLogsDir } from "../home-paths.js";
import { subscribeGlobalLiveEvents } from "./live-events.js";
import type { LiveEvent } from "@paperclipai/shared";

class MasterTraceService {
  private logFilePath: string;
  private initialized = false;

  constructor() {
    this.logFilePath = path.resolve(resolveDefaultLogsDir(), "master-trace.ndjson");
  }

  async initialize() {
    if (this.initialized) return;
    
    const logsDir = resolveDefaultLogsDir();
    await fs.mkdir(logsDir, { recursive: true });
    
    // Ensure file exists
    try {
      await fs.access(this.logFilePath);
    } catch {
      await fs.writeFile(this.logFilePath, "", "utf8");
    }

    // Subscribe to all global events
    subscribeGlobalLiveEvents((event: LiveEvent) => {
      this.appendEvent(event).catch((err) => {
        console.error("Failed to append event to master-trace:", err);
      });
    });

    this.initialized = true;
  }

  private async appendEvent(event: LiveEvent) {
    const line = JSON.stringify(event);
    await fs.appendFile(this.logFilePath, `${line}\n`, "utf8");
  }

  async getLogs(offset = 0, limit = 1000): Promise<LiveEvent[]> {
    try {
      const content = await fs.readFile(this.logFilePath, "utf8");
      const lines = content.trim().split("\n").filter(Boolean);
      const events = lines.map((line) => JSON.parse(line) as LiveEvent);
      
      // Return the most recent logs if offset/limit are default, or slice accordingly
      // For Master Trace, we usually want the latest logs first in UI, 
      // but standard log viewing often reads from start.
      // Let's return latest first or let the UI handle it.
      return events.reverse().slice(offset, offset + limit);
    } catch (err) {
      console.error("Failed to read master-trace logs:", err);
      return [];
    }
  }
}

export const masterTraceService = new MasterTraceService();

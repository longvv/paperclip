import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Db } from "@paperclipai/db";
import type { StorageService } from "../storage/types.js";
import { assetService } from "./assets.js";
import { logger } from "../middleware/logger.js";

const ARTIFACT_DIRS = ["_bmad-output", "research", "artifacts"];

function lookupContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".md": return "text/markdown";
    case ".txt": return "text/plain";
    case ".json": return "application/json";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".pdf": return "application/pdf";
    case ".html": return "text/html";
    case ".csv": return "text/csv";
    default: return "application/octet-stream";
  }
}

async function directoryExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export function artifactRegistrationService(db: Db, storage: StorageService) {
  const assetsSvc = assetService(db);

  async function registerArtifacts(params: {
    companyId: string;
    agentId: string;
    runId: string;
    workspaceCwd: string;
  }) {
    const { companyId, agentId, runId, workspaceCwd } = params;

    for (const dirName of ARTIFACT_DIRS) {
      const fullDir = path.resolve(workspaceCwd, dirName);
      if (await directoryExists(fullDir)) {
        await scanAndRegister(fullDir, dirName);
      }
    }

    async function scanAndRegister(currentDir: string, relativePrefix: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const objectKeyPrefix = `agent-artifacts/${agentId}/${runId}`;
        const relPathInOutput = path.join(relativePrefix, entry.name);

        if (entry.isDirectory()) {
          await scanAndRegister(fullPath, relPathInOutput);
        } else if (entry.isFile()) {
          try {
            const buffer = await fs.readFile(fullPath);
            if (buffer.length === 0) continue;

            const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
            const contentType = lookupContentType(entry.name);

            // Register with storage service (copies to managed storage)
            const stored = await storage.putFile({
              companyId,
              namespace: objectKeyPrefix,
              originalFilename: entry.name,
              contentType,
              body: buffer,
            });

            // Register in database
            await assetsSvc.create(companyId, {
              provider: stored.provider,
              objectKey: stored.objectKey,
              contentType: stored.contentType,
              byteSize: stored.byteSize,
              sha256: stored.sha256,
              originalFilename: stored.originalFilename,
              createdByAgentId: agentId,
            });

            logger.info(
              { companyId, agentId, runId, filename: entry.name, objectKey: stored.objectKey },
              "Registered agent artifact"
            );
          } catch (err) {
            logger.error(
              { err, companyId, agentId, runId, filePath: fullPath },
              "Failed to register agent artifact"
            );
          }
        }
      }
    }
  }

  return {
    registerArtifacts,
  };
}

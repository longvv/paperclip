import fs from "node:fs/promises";
import fsSync from "node:fs";
import { afterAll } from "vitest";

const tempDirs = new Set<string>();

const originalMkdtemp = fs.mkdtemp;
(fs as any).mkdtemp = async function (...args: any[]) {
  const result = await originalMkdtemp.apply(this, args as any);
  if (typeof result === "string" && result.includes("paperclip-")) {
    tempDirs.add(result);
  }
  return result;
};

const originalMkdtempSync = fsSync.mkdtempSync;
(fsSync as any).mkdtempSync = function (...args: any[]) {
  const result = originalMkdtempSync.apply(this, args as any);
  if (typeof result === "string" && result.includes("paperclip-")) {
    tempDirs.add(result);
  }
  return result;
};

afterAll(async () => {
  for (const dir of tempDirs) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    tempDirs.delete(dir);
  }
});

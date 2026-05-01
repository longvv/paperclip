import { eq, desc } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { assets } from "@paperclipai/db";

export function assetService(db: Db) {
  return {
    create: (companyId: string, data: Omit<typeof assets.$inferInsert, "companyId">) =>
      db
        .insert(assets)
        .values({ ...data, companyId })
        .returning()
        .then((rows) => rows[0]),

    getById: (id: string) =>
      db
        .select()
        .from(assets)
        .where(eq(assets.id, id))
        .then((rows) => rows[0] ?? null),

    list: (companyId: string, limit = 100) =>
      db
        .select()
        .from(assets)
        .where(eq(assets.companyId, companyId))
        .orderBy(desc(assets.createdAt))
        .limit(limit),
  };
}



import { cache } from "react";
import db from "@/lib/db";
import type { Business } from "@/types";

// cache() deduplicates DB calls within a single render tree (layout + page share one query)
export const getBusinessBySlug = cache(async (slug: string): Promise<Business | undefined> => {
  return db<Business>("businesses").where({ slug, status: "active" }).first();
});

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { BusinessesClient } from "./businesses-client";
import type { Business } from "@/types";

export default async function IsletmelerPage() {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") redirect("/admin");

  const businesses = await db<Business>("businesses").orderBy("created_at", "desc");

  return (
    <div className="p-6">
      <BusinessesClient initialBusinesses={businesses} />
    </div>
  );
}

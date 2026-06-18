import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { MusaitlikClient } from "./musaitlik-client";
import type { WorkingHour, ClosedDate } from "@/types";

export default async function MusaitlikPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const [workingHours, closedDates] = await Promise.all([
    db<WorkingHour>("working_hours")
      .where({ business_id: bId })
      .whereNull("staff_id")
      .orderBy("weekday"),
    db<ClosedDate>("closed_dates")
      .where({ business_id: bId })
      .orderBy("date"),
  ]);

  return (
    <div className="p-6">
      <MusaitlikClient businessId={bId} initialHours={workingHours} initialClosedDates={closedDates} />
    </div>
  );
}

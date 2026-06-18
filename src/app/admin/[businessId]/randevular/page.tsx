import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { RandevularClient, type EnrichedAppointment } from "./randevular-client";
import type { AppointmentStatus, Service, StaffOrResource, Business } from "@/types";

const PER_PAGE = 20;
const VALID_STATUSES: AppointmentStatus[] = ["pending", "approved", "rejected", "cancelled", "cancel_requested"];
const DEFAULT_STATUSES: AppointmentStatus[] = ["pending", "approved", "rejected"];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOf(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(d);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

const SELECT_COLS = [
  "appointments.id",
  "appointments.business_id",
  "appointments.service_id",
  "appointments.staff_id",
  "appointments.customer_id",
  "appointments.customer_name",
  "appointments.customer_phone",
  "appointments.appointment_date",
  "appointments.start_time",
  "appointments.end_time",
  "appointments.status",
  "appointments.reject_reason",
  "appointments.booking_code",
  "appointments.checked_in",
  "appointments.created_at",
  "services.name as service_name",
  "staff_or_resources.name as staff_name",
];

export default async function RandevularPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getSession();
  const [{ businessId }, sp] = await Promise.all([params, searchParams]);
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const view = (["list", "week", "month"].includes(sp.view ?? "") ? sp.view : "week") as "list" | "week" | "month";

  const rawStatuses = (sp.statuses ?? "")
    .split(",")
    .filter((s): s is AppointmentStatus => VALID_STATUSES.includes(s as AppointmentStatus));
  const selectedStatuses: AppointmentStatus[] = rawStatuses.length > 0 ? rawStatuses : DEFAULT_STATUSES;

  const page = Math.max(1, Number(sp.page) || 1);

  const today = new Date();
  const todayStr = toDateKey(today);

  const weekStart = sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week) ? sp.week : todayStr;
  const weekEnd = addDays(weekStart, 6);

  const calYear = Number(sp.year) || today.getFullYear();
  const calMonth = sp.month !== undefined ? Math.max(0, Math.min(11, Number(sp.month))) : today.getMonth();

  const [services, staff, business] = await Promise.all([
    db<Service>("services").where({ business_id: bId, is_active: true }).orderBy("name"),
    db<StaffOrResource>("staff_or_resources").where({ business_id: bId, is_active: true }).orderBy("name"),
    db<Business>("businesses").where({ id: bId }).first(),
  ]);

  // Status counts (always all statuses, unfiltered)
  const countRows = await db("appointments")
    .where({ business_id: bId })
    .select("status")
    .count("id as n")
    .groupBy("status") as Array<{ status: string; n: string | number }>;

  const counts: Record<string, number> = { all: 0 };
  for (const s of VALID_STATUSES) counts[s] = 0;
  for (const row of countRows) {
    const n = Number(row.n);
    counts[row.status] = n;
    counts.all += n;
  }

  const buildQuery = () =>
    db("appointments")
      .join("services", "appointments.service_id", "services.id")
      .leftJoin("staff_or_resources", "appointments.staff_id", "staff_or_resources.id")
      .where("appointments.business_id", bId)
      .whereIn("appointments.status", selectedStatuses)
      .select<EnrichedAppointment[]>(SELECT_COLS);

  let appointments: EnrichedAppointment[] = [];
  let totalPages = 1;

  if (view === "week") {
    appointments = await buildQuery()
      .where("appointments.appointment_date", ">=", weekStart)
      .where("appointments.appointment_date", "<=", weekEnd)
      .orderBy("appointments.appointment_date")
      .orderBy("appointments.start_time");
  } else if (view === "month") {
    const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
    appointments = await buildQuery()
      .whereLike("appointments.appointment_date", `${monthPrefix}-%`)
      .orderBy("appointments.appointment_date")
      .orderBy("appointments.start_time");
  } else {
    const countRow = await db("appointments")
      .where({ business_id: bId })
      .whereIn("status", selectedStatuses)
      .count("id as total")
      .first<{ total: number }>();
    const total = Number(countRow?.total ?? 0);
    totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    appointments = await buildQuery()
      .orderBy("appointments.appointment_date", "desc")
      .orderBy("appointments.start_time", "desc")
      .limit(PER_PAGE)
      .offset((safePage - 1) * PER_PAGE);
  }

  return (
    <RandevularClient
      businessId={bId}
      appointments={appointments}
      view={view}
      selectedStatuses={selectedStatuses}
      page={page}
      totalPages={totalPages}
      counts={counts}
      weekStart={weekStart}
      calYear={calYear}
      calMonth={calMonth}
      services={services}
      staff={staff}
      businessSlug={business?.slug ?? ""}
    />
  );
}

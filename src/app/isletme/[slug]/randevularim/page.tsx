import { redirect } from "next/navigation";
import { bizPath } from "@/lib/url";
import { getCustomerSession } from "@/lib/customer-auth";
import db from "@/lib/db";
import { AppointmentsContent, type Row, type FilterKey } from "@/app/randevularim/_components/appointments-content";

const PER_PAGE = 8;
const ACTIVE_STATUSES = ["pending", "approved", "cancel_requested"];
const PAST_STATUSES   = ["cancelled"];

function statusList(filter: FilterKey) {
  if (filter === "active") return ACTIVE_STATUSES;
  if (filter === "past")   return PAST_STATUSES;
  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; page?: string }>;
}

export default async function IsletmeRandevularimPage({ params, searchParams }: Props) {
  const [session, { slug }, sp] = await Promise.all([
    getCustomerSession(),
    params,
    searchParams,
  ]);
  if (!session) redirect(`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(bizPath(slug, "/randevularim"))}`);

  const filter = (["active", "past", "all"].includes(sp.filter ?? "") ? sp.filter : "active") as FilterKey;
  const page   = Math.max(1, Number(sp.page) || 1);

  const baseWhere = (q: ReturnType<typeof db>) => {
    q.join("businesses",           "appointments.business_id", "businesses.id")
     .join("services",             "appointments.service_id",  "services.id")
     .leftJoin("staff_or_resources", "appointments.staff_id",  "staff_or_resources.id")
     .where("appointments.customer_id", session.customerId)
     .where("businesses.slug", slug);
    const list = statusList(filter);
    if (list) q.whereIn("appointments.status", list);
  };

  const [countRow, activeCount, pastCount, allCount, rows] = await Promise.all([
    db("appointments").modify(baseWhere).count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
      .where("businesses.slug", slug)
      .whereIn("appointments.status", ACTIVE_STATUSES)
      .count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
      .where("businesses.slug", slug)
      .whereIn("appointments.status", PAST_STATUSES)
      .count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
      .where("businesses.slug", slug)
      .count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .modify(baseWhere)
      .orderBy("appointments.appointment_date", "desc")
      .orderBy("appointments.start_time", "desc")
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE)
      .select<Row[]>(
        "appointments.id",
        "appointments.appointment_date",
        "appointments.start_time",
        "appointments.end_time",
        "appointments.status",
        "appointments.booking_code",
        "appointments.created_at",
        "businesses.name as business_name",
        "businesses.slug as business_slug",
        "businesses.phone as business_phone",
        "services.name as service_name",
        "staff_or_resources.name as staff_name"
      ),
  ]);

  const total      = Number(countRow?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AppointmentsContent
      rows={rows}
      customerName={session.name}
      filter={filter}
      page={Math.min(page, totalPages)}
      totalPages={totalPages}
      counts={{ active: Number(activeCount?.total ?? 0), past: Number(pastCount?.total ?? 0), all: Number(allCount?.total ?? 0) }}
      hideHeader
      className=""
    />
  );
}

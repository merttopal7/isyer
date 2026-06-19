import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { getBusinessBySlug } from "@/lib/get-business";
import db from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { BusinessNavbar } from "@/components/isletme/business-navbar";
import { AppointmentsContent, type Row, type FilterKey } from "./_components/appointments-content";

const PER_PAGE = 8;
const ACTIVE_STATUSES = ["pending", "approved", "cancel_requested"];
const PAST_STATUSES   = ["cancelled"];

function statusList(filter: FilterKey) {
  if (filter === "active") return ACTIVE_STATUSES;
  if (filter === "past")   return PAST_STATUSES;
  return null;
}

export default async function RandevularimPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string; from?: string }>;
}) {
  const [session, params] = await Promise.all([getCustomerSession(), searchParams]);
  if (!session) redirect("/giris?redirect=/randevularim");

  const filter = (["active", "past", "all"].includes(params.filter ?? "") ? params.filter : "active") as FilterKey;
  const page   = Math.max(1, Number(params.page) || 1);
  const from   = params.from;

  const fromBusiness = from ? await getBusinessBySlug(from) : null;

  const baseWhere = (q: ReturnType<typeof db>) => {
    q.join("businesses",           "appointments.business_id", "businesses.id")
     .join("services",             "appointments.service_id",  "services.id")
     .leftJoin("staff_or_resources", "appointments.staff_id",  "staff_or_resources.id")
     .where("appointments.customer_id", session.customerId);
    const list = statusList(filter);
    if (list) q.whereIn("appointments.status", list);
  };

  const [countRow, activeCount, pastCount, allCount, rows] = await Promise.all([
    db("appointments").modify(baseWhere).count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
      .whereIn("appointments.status", ACTIVE_STATUSES)
      .count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
      .whereIn("appointments.status", PAST_STATUSES)
      .count("appointments.id as total").first<{ total: number }>(),
    db("appointments")
      .join("businesses", "appointments.business_id", "businesses.id")
      .where("appointments.customer_id", session.customerId)
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
    <>
      {fromBusiness ? (
        <BusinessNavbar
          slug={fromBusiness.slug}
          businessName={fromBusiness.name}
          hasMap={!!fromBusiness.map_embed}
          announcementsEnabled={!!(fromBusiness.announcements_enabled ?? true)}
          menuEnabled={!!(fromBusiness.menu_enabled ?? true)}
          bookingEnabled={!!(fromBusiness.booking_enabled ?? true)}
        />
      ) : (
        <Navbar />
      )}
      <AppointmentsContent
        rows={rows}
        customerName={session.name}
        filter={filter}
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        counts={{ active: Number(activeCount?.total ?? 0), past: Number(pastCount?.total ?? 0), all: Number(allCount?.total ?? 0) }}
        from={from}
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { getBusinessBySlug } from "@/lib/get-business";
import type { Appointment, Business, Service, StaffOrResource } from "@/types";
import { ClaimButton } from "./claim-button";
import { bizPath } from "@/lib/url";
import {
  CheckCircle2, Clock, XCircle, Ban, AlertCircle,
  Calendar, Scissors, User, BookmarkCheck,
} from "lucide-react";
import type { AppointmentStatus } from "@/types";

const STATUS_META: Record<AppointmentStatus, {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  pending:          { label: "Onay Bekliyor", className: "bg-amber-100 text-amber-700 border-amber-300",    icon: Clock        },
  approved:         { label: "Onaylandı",     className: "bg-green-100 text-green-700 border-green-300",    icon: CheckCircle2 },
  rejected:         { label: "Reddedildi",    className: "bg-red-100 text-red-700 border-red-300",          icon: XCircle      },
  cancelled:        { label: "İptal Edildi",  className: "bg-muted text-muted-foreground border-border",    icon: Ban          },
  cancel_requested: { label: "İptal Talebi", className: "bg-orange-100 text-orange-700 border-orange-300", icon: AlertCircle  },
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; booking_code: string }>;
}): Promise<Metadata> {
  const { slug, booking_code } = await params;

  const appointment = await db<Appointment>("appointments")
    .where({ booking_code: booking_code.toUpperCase() })
    .first();

  if (!appointment) return {};

  const business = await getBusinessBySlug(slug);
  if (!business || business.id !== appointment.business_id) return {};

  const service = await db<Service>("services")
    .where({ id: appointment.service_id })
    .first();

  const serviceName = service?.name ?? "Randevu";
  const dateStr = formatDate(appointment.appointment_date);
  const statusLabel = STATUS_META[appointment.status]?.label ?? "";

  const title = `${serviceName} — ${business.name}`;
  const description = `${dateStr}, Saat ${appointment.start_time} | ${statusLabel}`;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const logoAbsUrl = business.logo_url ? `${APP_URL}${business.logo_url}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: logoAbsUrl
        ? [{ url: logoAbsUrl, width: 400, height: 400, alt: business.name }]
        : undefined,
    },
  };
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; booking_code: string }>;
}) {
  const { slug, booking_code } = await params;

  const appointment = await db<Appointment>("appointments")
    .where({ booking_code: booking_code.toUpperCase() })
    .first();

  if (!appointment) notFound();

  // Randevunun bu işletmeye ait olduğunu doğrula
  const business = await db<Business>("businesses")
    .where({ id: appointment.business_id, slug })
    .first();

  if (!business) notFound();

  const [service, staff, customerSession] = await Promise.all([
    db<Service>("services").where({ id: appointment.service_id }).first(),
    appointment.staff_id
      ? db<StaffOrResource>("staff_or_resources").where({ id: appointment.staff_id }).first()
      : Promise.resolve(null),
    getCustomerSession(),
  ]);

  const meta = STATUS_META[appointment.status];
  const StatusIcon = meta.icon;

  const canClaim = customerSession !== null && appointment.customer_id === null;
  const alreadyOwned = customerSession !== null && appointment.customer_id === customerSession.customerId;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">Randevu Detayı</h1>
        <p className="text-sm text-muted-foreground font-mono">{appointment.booking_code}</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Status bar */}
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${meta.className}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="font-semibold text-sm">{meta.label}</span>
        </div>

        <div className="p-4 space-y-3 text-sm">
          {service && (
            <div className="flex items-start gap-3">
              <Scissors className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Hizmet</p>
                <p className="font-medium">{service.name}</p>
              </div>
            </div>
          )}

          {staff && (
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Personel</p>
                <p className="font-medium">{staff.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Tarih & Saat</p>
              <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
              <p className="text-muted-foreground">{appointment.start_time} – {appointment.end_time}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Ad Soyad</p>
              <p className="font-medium">{appointment.customer_name}</p>
            </div>
          </div>

          {appointment.status === "rejected" && appointment.reject_reason && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
              <span className="font-medium">Red sebebi:</span> {appointment.reject_reason}
            </div>
          )}
        </div>
      </div>

      {alreadyOwned && (
        <div className="rounded-xl border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4 flex items-center gap-3">
          <BookmarkCheck className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            Bu randevu hesabınıza kayıtlı.
          </p>
        </div>
      )}

      {canClaim && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div>
            <p className="font-semibold text-sm">Bu randevuyu hesabınıza kaydedin</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hesabınıza kaydederek randevunuzu takip edebilir ve yönetebilirsiniz.
            </p>
          </div>
          <ClaimButton appointmentId={appointment.id} />
        </div>
      )}

      {!customerSession && appointment.customer_id === null && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div>
            <p className="font-semibold text-sm">Bu randevuyu hesabınıza kaydedin</p>
            <p className="text-xs text-muted-foreground mt-1">
              Giriş yaparak bu randevuyu sahiplenebilirsiniz.
            </p>
          </div>
          <a
            href={`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(bizPath(slug, `/randevu/${appointment.booking_code}`))}`}
            className="block w-full text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Giriş Yap
          </a>
        </div>
      )}
    </div>
  );
}

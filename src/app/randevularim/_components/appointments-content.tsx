"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar, CheckCircle2, Clock, XCircle, Ban,
  Building2, Scissors, User, ArrowRight, CalendarOff, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

type Row = {
  id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  booking_code: string;
  created_at: string;
  business_name: string;
  business_slug: string;
  business_phone: string | null;
  service_name: string;
  staff_name: string | null;
};

export type { Row };
export type FilterKey = "active" | "past" | "all";

const PROD   = process.env.NEXT_PUBLIC_PRODUCTION === "true";
const DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "";

function bookingUrl(slug: string, bookingCode: string): string {
  return PROD && DOMAIN
    ? `https://${slug}.${DOMAIN}/randevu/${bookingCode}`
    : `${window.location.origin}/isletme/${slug}/randevu/${bookingCode}`;
}

function copyBookingLink(slug: string, bookingCode: string) {
  navigator.clipboard.writeText(bookingUrl(slug, bookingCode));
  toast.success("Randevu linki kopyalandı!");
}

function whatsappUrl(phone: string, slug: string, bookingCode: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("0") ? `90${digits.slice(1)}` : digits;
  const text = encodeURIComponent(bookingUrl(slug, bookingCode));
  return `https://wa.me/${number}?text=${text}`;
}

const STATUS_META: Record<AppointmentStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
}> = {
  pending:          { label: "Bekliyor",      icon: Clock,        badgeClass: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300" },
  approved:         { label: "Onaylandı",     icon: CheckCircle2, badgeClass: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300" },
  cancelled:        { label: "İptal Edildi",  icon: Ban,          badgeClass: "bg-muted text-muted-foreground border-border" },
  cancel_requested: { label: "İptal Talebi", icon: AlertCircle,  badgeClass: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300" },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "active", label: "Aktif" },
  { key: "past",   label: "Geçmiş" },
  { key: "all",    label: "Tümü" },
];

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
  });
}

function isFuture(date: string, startTime: string) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (date > today) return true;
  if (date < today) return false;
  const [h, m] = startTime.split(":").map(Number);
  return h * 60 + m > now.getHours() * 60 + now.getMinutes();
}

function buildQuery(filter: FilterKey, page: number, from?: string) {
  const params = new URLSearchParams();
  params.set("filter", filter);
  params.set("page", String(page));
  if (from) params.set("from", from);
  return `?${params.toString()}`;
}

export function AppointmentsContent({
  rows,
  customerName,
  filter,
  page,
  totalPages,
  counts,
  from,
  hideHeader,
  className,
}: {
  rows: Row[];
  customerName: string;
  filter: FilterKey;
  page: number;
  totalPages: number;
  counts: Record<FilterKey, number>;
  from?: string;
  hideHeader?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [retractingId, setRetractingId] = useState<number | null>(null);
  const [localRows, setLocalRows] = useState(rows);

  // Sync when server sends new rows (navigation)
  if (rows !== localRows && rows.length !== localRows.length) {
    setLocalRows(rows);
  }

  async function handleCancel(row: Row) {
    setCancellingId(row.id);
    try {
      const res = await fetch(`/api/appointments/${row.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İşlem başarısız."); return; }
      if (data.status === "cancelled") toast.success("Randevunuz iptal edildi.");
      else toast.success("İptal talebiniz iletildi. İşletme onaylayacak.");
      router.refresh();
    } finally {
      setCancellingId(null);
    }
  }

  async function handleRetract(row: Row) {
    setRetractingId(row.id);
    try {
      const res = await fetch(`/api/appointments/${row.id}/cancel`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İşlem başarısız."); return; }
      toast.success("İptal talebiniz geri alındı.");
      router.refresh();
    } finally {
      setRetractingId(null);
    }
  }

  return (
    <div className={className ?? "container mx-auto max-w-2xl px-4 py-10"}>
      {!hideHeader && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Randevularım</h1>
            <p className="text-sm text-muted-foreground">{customerName}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-muted/40 p-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={buildQuery(f.key, 1, from)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              filter === f.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {counts[f.key]}
            </span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <CalendarOff className="mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Bu kategoride randevu yok.</p>
        </div>
      ) : (
        <>
          <div className={cn("space-y-3", filter === "past" && "opacity-75")}>
            {rows.map((r) => (
              <AppointmentCard
                key={r.id}
                row={r}
                cancelling={cancellingId === r.id}
                retracting={retractingId === r.id}
                onCancel={() => handleCancel(r)}
                onRetract={() => handleRetract(r)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} asChild>
                <Link href={buildQuery(filter, page - 1, from)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Önceki
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} asChild>
                <Link href={buildQuery(filter, page + 1, from)}>
                  Sonraki
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentCard({ row, cancelling, retracting, onCancel, onRetract }: {
  row: Row;
  cancelling: boolean;
  retracting: boolean;
  onCancel: () => void;
  onRetract: () => void;
}) {
  const meta = STATUS_META[row.status];
  const Icon = meta.icon;
  const canAct = isFuture(row.appointment_date, row.start_time);

  return (
    <article className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Link
            href={`/isletme/${row.business_slug}`}
            className="group inline-flex items-center gap-1.5 font-semibold hover:text-primary"
          >
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            {row.business_name}
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" />
              {row.service_name}
            </span>
            {row.staff_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {row.staff_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDate(row.appointment_date)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium">{row.start_time}–{row.end_time}</span>
          </div>

          {row.status === "cancel_requested" && (
            <p className="rounded-md bg-orange-50 px-3 py-1.5 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
              İptal talebiniz işletme tarafından değerlendiriliyor.
            </p>
          )}
        </div>

        <Badge className={cn("shrink-0 gap-1 border", meta.badgeClass)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </Badge>
      </div>

      {canAct && (row.status === "pending" || row.status === "approved") && (
        <div className="border-t px-4 py-2.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-muted-foreground hover:text-destructive hover:border-destructive"
            disabled={cancelling}
            onClick={onCancel}
          >
            {cancelling
              ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              : <Ban className="mr-1.5 h-3 w-3" />}
            {row.status === "pending" ? "Randevuyu İptal Et" : "İptal Talebi Oluştur"}
          </Button>
        </div>
      )}
      {canAct && row.status === "cancel_requested" && (
        <div className="border-t px-4 py-2.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-muted-foreground hover:text-foreground hover:border-foreground"
            disabled={retracting}
            onClick={onRetract}
          >
            {retracting
              ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              : <XCircle className="mr-1.5 h-3 w-3" />}
            İptal Talebini Geri Al
          </Button>
        </div>
      )}

      <div className={cn("flex items-center justify-between gap-2 px-4 py-2 text-xs text-muted-foreground", (canAct && (row.status === "pending" || row.status === "approved")) ? "" : "border-t")}>
        <span>Randevu kodu: <span className="font-mono font-medium text-foreground">{row.booking_code}</span></span>
        <div className="flex items-center gap-1">
          {row.business_phone && row.status === "pending" && (
            <a
              href={whatsappUrl(row.business_phone, row.business_slug, row.booking_code)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted transition-colors text-green-600"
              title="WhatsApp ile işletmeye bildir"
            >
              <MessageCircle className="h-3 w-3" />
              İşletmeye Bildir
            </a>
          )}
          <Link
            href={PROD && DOMAIN
              ? `/randevu/${row.booking_code}`
              : `/isletme/${row.business_slug}/randevu/${row.booking_code}`}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            Detay Göster
          </Link>
        </div>
      </div>
    </article>
  );
}

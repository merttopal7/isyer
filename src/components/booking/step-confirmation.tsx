"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, CalendarSearch } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { BookingState } from "./booking-flow";
import type { Business } from "@/types";
import { bizPath } from "@/lib/url";

interface Props {
  booking: BookingState;
  business: Business;
}

export function StepConfirmation({ booking, business }: Props) {
  const { bookingCode, service, date, time, customerName } = booking;

  function formatDate(d: string) {
    const [y, m, day] = d.split("-");
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric", weekday: "long",
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(bookingCode);
    toast.success("Randevu kodu kopyalandı!");
  }

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="mb-2 text-2xl font-bold">Randevu Talebiniz Alındı!</h2>
      <p className="mb-6 text-muted-foreground">
        Merhaba <strong>{customerName}</strong>, {business.name} randevu talebiniz işleme alındı.
        İşletme onayladığında bildirim alacaksınız.
      </p>

      {/* Booking code */}
      <div className="mb-6 w-full max-w-sm rounded-xl border bg-muted/30 p-5">
        <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Randevu Kodunuz</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-3xl font-bold tracking-widest">{bookingCode}</span>
          <button
            onClick={copyCode}
            className="rounded-md p-1.5 hover:bg-muted transition-colors"
            title="Kopyala"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Detail grid */}
      <div className="mb-8 w-full max-w-sm rounded-xl border p-4 text-sm text-left">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground">
          <span>İşletme</span>    <span className="text-foreground font-medium">{business.name}</span>
          <span>Hizmet</span>     <span className="text-foreground font-medium">{service?.name}</span>
          <span>Tarih</span>      <span className="text-foreground font-medium">{formatDate(date)}</span>
          <span>Saat</span>       <span className="text-foreground font-medium">{time}</span>
          <span>Durum</span>      <span className="font-medium text-amber-600">Onay Bekliyor</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={bizPath(business.slug, "/randevularim")}>
            <CalendarSearch className="mr-2 h-4 w-4" /> Randevumu Takip Et
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={bizPath(business.slug)}>İşletmeye Dön</Link>
        </Button>
      </div>
    </div>
  );
}

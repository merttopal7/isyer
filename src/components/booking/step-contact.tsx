"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CalendarCheck, User, Phone } from "lucide-react";
import type { BookingState } from "./booking-flow";
import type { CustomerJwtPayload } from "@/types";

interface Props {
  booking: BookingState;
  customer: CustomerJwtPayload | null;
  onChange: (field: keyof BookingState, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function StepContact({ booking, customer, onSubmit, onBack, submitting }: Props) {
  const { service, staff, date, time, customerName, customerPhone } = booking;

  function formatDateDisplay(d: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric", weekday: "long",
    });
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">Randevu Onayı</h2>
      <p className="mb-6 text-sm text-muted-foreground">Lütfen randevu bilgilerinizi kontrol edip onaylayın.</p>

      {/* Summary */}
      <div className="mb-6 rounded-xl border bg-card/60 p-5 shadow-sm backdrop-blur-sm">
        <p className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Randevu Detayları
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <span className="text-muted-foreground">Hizmet</span>
          <span className="text-foreground font-semibold text-right sm:text-left">{service?.name}</span>
          {staff && (
            <>
              <span className="text-muted-foreground">Personel</span>
              <span className="text-foreground font-semibold text-right sm:text-left">{staff.name}</span>
            </>
          )}
          <span className="text-muted-foreground">Tarih</span>
          <span className="text-foreground font-semibold text-right sm:text-left">{formatDateDisplay(date)}</span>
          <span className="text-muted-foreground">Saat</span>
          <span className="text-foreground font-semibold text-right sm:text-left">{time}</span>
          {service?.price && (
            <>
              <span className="text-muted-foreground">Ücret</span>
              <span className="text-foreground font-extrabold text-indigo-600 dark:text-indigo-400 text-right sm:text-left">{service.price} ₺</span>
            </>
          )}
        </div>
      </div>

      {/* Customer Info (Read-only) */}
      <div className="mb-6 rounded-xl border bg-indigo-500/5 border-indigo-500/10 p-5 shadow-sm">
        <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <User className="h-5 w-5" />
          Kişisel Bilgileriniz
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-4 w-4 text-muted-foreground/60" /> Ad Soyad</span>
          <span className="text-foreground font-semibold text-right sm:text-left">{customerName}</span>
          <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-4 w-4 text-muted-foreground/60" /> Telefon</span>
          <span className="text-foreground font-semibold text-right sm:text-left">{customerPhone}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-4">
        <Button variant="outline" className="rounded-xl h-11 px-5" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
        <Button 
          onClick={onSubmit} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 shadow-md shadow-indigo-600/10"
          disabled={submitting}
        >
          {submitting
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <CalendarCheck className="mr-2 h-4 w-4" />}
          Randevuyu Onayla ve Oluştur
        </Button>
      </div>
    </div>
  );
}

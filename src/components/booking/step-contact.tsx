"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CalendarCheck, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { validatePhone } from "@/lib/slots";
import { PhoneInput } from "@/components/shared/phone-input";
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

export function StepContact({ booking, customer, onChange, onSubmit, onBack, submitting }: Props) {
  const { service, staff, date, time, customerName, customerPhone } = booking;
  const [phoneTouched, setPhoneTouched] = useState(false);
  // Phone is readonly only when customer has a registered phone number
  const phoneReadonly = !!(customer?.phone);

  function formatDateDisplay(d: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric", weekday: "long",
    });
  }

  const phoneValid = validatePhone(customerPhone);
  const nameValid  = customerName.trim().length >= 2;
  const canSubmit  = nameValid && phoneValid;

  const showPhoneError = phoneTouched && customerPhone.length > 0 && !phoneValid;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">İletişim Bilgileri</h2>
      <p className="mb-6 text-sm text-muted-foreground">Ad ve telefon numaranızı girin.</p>

      {/* Summary */}
      <div className="mb-6 rounded-xl border bg-muted/30 p-4 text-sm">
        <p className="font-medium mb-2">Randevu Özeti</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <span>Hizmet</span>
          <span className="text-foreground font-medium">{service?.name}</span>
          {staff && (
            <>
              <span>Personel</span>
              <span className="text-foreground font-medium">{staff.name}</span>
            </>
          )}
          <span>Tarih</span>
          <span className="text-foreground font-medium">{formatDateDisplay(date)}</span>
          <span>Saat</span>
          <span className="text-foreground font-medium">{time}</span>
          {service?.price && (
            <>
              <span>Ücret</span>
              <span className="text-foreground font-medium">{service.price} ₺</span>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Ad Soyad *</Label>
          <Input
            id="name"
            placeholder="Ahmet Yılmaz"
            value={customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            autoComplete="name"
            className={cn(nameValid && customerName.length > 0 && "border-green-500 focus-visible:ring-green-500/20")}
          />
          {nameValid && customerName.length > 0 && (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Geçerli
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon Numarası *</Label>
          <div className="relative">
            <PhoneInput
              id="phone"
              value={customerPhone}
              onValueChange={(raw) => {
                if (!phoneReadonly) {
                  onChange("customerPhone", raw);
                  setPhoneTouched(true);
                }
              }}
              onBlur={() => !phoneReadonly && setPhoneTouched(true)}
              readOnly={phoneReadonly}
              autoComplete="tel"
              className={cn(
                phoneReadonly && "cursor-not-allowed bg-muted pr-9 text-muted-foreground",
                !phoneReadonly && showPhoneError && "border-destructive focus-visible:ring-destructive/20",
                !phoneReadonly && phoneValid && customerPhone.length > 0 && "border-green-500 focus-visible:ring-green-500/20"
              )}
            />
            {phoneReadonly && (
              <Lock className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
          {phoneReadonly ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-600" /> Hesabınıza kayıtlı numara
            </p>
          ) : showPhoneError ? (
            <p className="text-xs text-destructive">Format: 0 (5XX) XXX XXXX</p>
          ) : phoneValid && customerPhone.length > 0 ? (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Geçerli
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Randevu durumunuzu bu numarayla sorgulayabilirsiniz.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <CalendarCheck className="mr-2 h-4 w-4" />}
          Randevu Oluştur
        </Button>
      </div>
    </div>
  );
}

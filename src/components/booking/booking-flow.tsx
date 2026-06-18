"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepService } from "./step-service";
import { StepStaff } from "./step-staff";
import { StepDateTime } from "./step-datetime";
import { StepContact } from "./step-contact";
import { StepConfirmation } from "./step-confirmation";
import { StepAuth } from "./step-auth";
import type { Business, Service, StaffOrResource, CustomerJwtPayload } from "@/types";

export type BookingStep = "auth" | "service" | "staff" | "datetime" | "contact" | "done";

export interface BookingState {
  service: Service | null;
  staff: StaffOrResource | null;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  bookingCode: string;
  appointmentId: number | null;
}

const initial: BookingState = {
  service: null, staff: null, date: "", time: "",
  customerName: "", customerPhone: "", bookingCode: "", appointmentId: null,
};

interface Props {
  business: Business;
  services: Service[];
  staff: StaffOrResource[];
  initialCustomer: CustomerJwtPayload | null;
}

const STEP_LABELS: Record<Exclude<BookingStep, "auth" | "done">, string> = {
  service: "Hizmet",
  staff: "Personel",
  datetime: "Tarih & Saat",
  contact: "İletişim",
};

export function BookingFlow({ business, services, staff, initialCustomer }: Props) {
  const [customer, setCustomer] = useState<CustomerJwtPayload | null>(initialCustomer);
  const [step, setStep] = useState<BookingStep>(initialCustomer ? "service" : "auth");
  const [booking, setBooking] = useState<BookingState>(
    initialCustomer
      ? { ...initial, customerName: initialCustomer.name, customerPhone: initialCustomer.phone ?? "" }
      : initial
  );
  const [submitting, setSubmitting] = useState(false);

  const hasStaff = staff.length > 0;

  function handleAuthenticated(c: CustomerJwtPayload) {
    setCustomer(c);
    setBooking((b) => ({ ...b, customerName: c.name, customerPhone: c.phone ?? "" }));
    setStep("service");
    window.dispatchEvent(new CustomEvent("customer-auth-changed", { detail: c }));
  }

  function goNext() {
    if (step === "service") setStep(hasStaff ? "staff" : "datetime");
    else if (step === "staff") setStep("datetime");
    else if (step === "datetime") setStep("contact");
  }

  function goBack() {
    if (step === "staff") setStep("service");
    else if (step === "datetime") setStep(hasStaff ? "staff" : "service");
    else if (step === "contact") setStep("datetime");
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          service_id: booking.service!.id,
          staff_id: booking.staff?.id ?? null,
          customer_name: booking.customerName,
          customer_phone: booking.customerPhone,
          appointment_date: booking.date,
          start_time: booking.time,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Randevu oluşturulamadı."); return; }
      setBooking((b) => ({ ...b, bookingCode: data.booking_code, appointmentId: data.id }));
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  const visibleSteps: Exclude<BookingStep, "auth" | "done">[] = hasStaff
    ? ["service", "staff", "datetime", "contact"]
    : ["service", "datetime", "contact"];

  const currentIdx = step !== "auth" && step !== "done" ? visibleSteps.indexOf(step as never) : -1;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator — only show after auth and before done */}
      {step !== "auth" && step !== "done" && (
        <div className="mb-8 flex items-center gap-1">
          {visibleSteps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < currentIdx
                    ? "bg-primary/20 text-primary"
                    : i === currentIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentIdx ? "✓" : i + 1}
              </div>
              <span className={`hidden text-xs sm:block ${i === currentIdx ? "font-medium" : "text-muted-foreground"}`}>
                {STEP_LABELS[s]}
              </span>
              {i < visibleSteps.length - 1 && <div className="mx-1 h-px w-6 bg-border" />}
            </div>
          ))}
        </div>
      )}

      {step === "auth" && <StepAuth onAuthenticated={handleAuthenticated} />}

      {step === "service" && (
        <StepService
          services={services}
          selected={booking.service}
          onSelect={(s) => setBooking((b) => ({ ...b, service: s, staff: null, date: "", time: "" }))}
          onNext={goNext}
        />
      )}
      {step === "staff" && (
        <StepStaff
          staff={staff}
          selected={booking.staff}
          onSelect={(s) => setBooking((b) => ({ ...b, staff: s, date: "", time: "" }))}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === "datetime" && (
        <StepDateTime
          business={business}
          service={booking.service!}
          staffId={booking.staff?.id ?? null}
          selectedDate={booking.date}
          selectedTime={booking.time}
          onSelect={(date, time) => setBooking((b) => ({ ...b, date, time }))}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === "contact" && (
        <StepContact
          booking={booking}
          customer={customer}
          onChange={(field, value) => setBooking((b) => ({ ...b, [field]: value }))}
          onSubmit={handleSubmit}
          onBack={goBack}
          submitting={submitting}
        />
      )}
      {step === "done" && <StepConfirmation booking={booking} business={business} />}
    </div>
  );
}

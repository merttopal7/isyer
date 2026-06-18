"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Business, Service, TimeSlot } from "@/types";
import { tr } from "date-fns/locale";

interface Props {
  business: Business;
  service: Service;
  staffId: number | null;
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StepDateTime({ business, service, staffId, selectedDate, selectedTime, onSelect, onNext, onBack }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (business.booking_advance_days ?? 7));

  const [pickedDate, setPickedDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate + "T00:00:00") : undefined
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setSlots([]);
    try {
      const dateStr = toDateStr(date);
      const params = new URLSearchParams({
        businessId: String(business.id),
        serviceId: String(service.id),
        date: dateStr,
        ...(staffId != null ? { staffId: String(staffId) } : {}),
      });
      const res = await fetch(`/api/slots?${params}`);
      if (res.ok) setSlots(await res.json());
    } finally {
      setLoading(false);
    }
  }, [business.id, service.id, staffId]);

  useEffect(() => {
    if (pickedDate) fetchSlots(pickedDate);
  }, [pickedDate, fetchSlots]);

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    setPickedDate(day);
    onSelect(toDateStr(day), "");
  }

  function handleTimeSelect(slot: TimeSlot) {
    if (!slot.available || !pickedDate) return;
    onSelect(toDateStr(pickedDate), slot.start);
  }

  const currentTime = selectedDate && pickedDate && toDateStr(pickedDate) === selectedDate ? selectedTime : "";
  const canContinue = !!selectedDate && !!selectedTime;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">Tarih ve Saat Seçin</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Hizmet: <strong>{service.name}</strong> ({service.duration_minutes} dk)
      </p>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar */}
        <div className="flex justify-center lg:justify-start">
          <Calendar
            mode="single"
            selected={pickedDate}
            onSelect={handleDaySelect}
            disabled={(d) => d < today || d > maxDate}
            locale={tr}
            className="rounded-xl border p-3"
          />
        </div>

        {/* Slots */}
        <div className="flex-1">
          {!pickedDate ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Lütfen bir tarih seçin
            </div>
          ) : loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : slots.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Bu tarihte müsait saat yok
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {pickedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot)}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-medium transition-all",
                      !slot.available
                        ? "cursor-not-allowed border-transparent bg-muted/30 text-muted-foreground/40 line-through"
                        : currentTime === slot.start
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {slot.start}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Devam Et <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

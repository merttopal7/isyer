"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Plus } from "lucide-react";
import type { WorkingHour, ClosedDate } from "@/types";

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

type DayState = { enabled: boolean; start_time: string; end_time: string };

function buildDayMap(hours: WorkingHour[]): Record<number, DayState> {
  const map: Record<number, DayState> = {};
  for (let i = 0; i <= 6; i++) {
    const h = hours.find((x) => x.weekday === i);
    map[i] = h
      ? { enabled: true, start_time: h.start_time, end_time: h.end_time }
      : { enabled: false, start_time: "09:00", end_time: "18:00" };
  }
  return map;
}

interface Props {
  businessId: number;
  initialHours: WorkingHour[];
  initialClosedDates: ClosedDate[];
}

export function MusaitlikClient({ businessId, initialHours, initialClosedDates }: Props) {
  const [days, setDays] = useState<Record<number, DayState>>(buildDayMap(initialHours));
  const [saving, setSaving] = useState(false);
  const [closedDates, setClosedDates] = useState(initialClosedDates);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [addingDate, setAddingDate] = useState(false);

  function toggleDay(weekday: number, enabled: boolean) {
    setDays((d) => ({ ...d, [weekday]: { ...d[weekday], enabled } }));
  }

  function setTime(weekday: number, field: "start_time" | "end_time", value: string) {
    setDays((d) => ({ ...d, [weekday]: { ...d[weekday], [field]: value } }));
  }

  async function saveHours() {
    setSaving(true);
    try {
      const hours = Object.entries(days)
        .filter(([, v]) => v.enabled)
        .map(([weekday, v]) => ({
          weekday: Number(weekday),
          start_time: v.start_time,
          end_time: v.end_time,
        }));

      const res = await fetch("/api/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, hours }),
      });

      if (res.ok) {
        toast.success("Çalışma saatleri kaydedildi.");
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Kaydedilemedi.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function addClosedDate() {
    if (!newDate) { toast.error("Tarih seçin."); return; }
    setAddingDate(true);
    try {
      const res = await fetch("/api/closed-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, date: newDate, reason: newReason || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setClosedDates((p) => [...p, data].sort((a, b) => a.date.localeCompare(b.date)));
      setNewDate("");
      setNewReason("");
      toast.success("Kapalı gün eklendi.");
    } finally {
      setAddingDate(false);
    }
  }

  async function removeClosedDate(id: number) {
    const res = await fetch(`/api/closed-dates?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setClosedDates((p) => p.filter((x) => x.id !== id));
      toast.success("Kapalı gün silindi.");
    }
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Müsaitlik Yönetimi</h1>

      {/* Working Hours */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Haftalık Çalışma Saatleri</h2>
        <div className="rounded-lg border divide-y">
          {DAYS.map((dayName, idx) => {
            const d = days[idx];
            return (
              <div key={idx} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <div className="flex w-36 items-center gap-3">
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={(v) => toggleDay(idx, v)}
                    id={`day-${idx}`}
                  />
                  <Label htmlFor={`day-${idx}`} className="cursor-pointer font-medium">
                    {dayName}
                  </Label>
                </div>
                {d.enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={d.start_time}
                      onChange={(e) => setTime(idx, "start_time", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={d.end_time}
                      onChange={(e) => setTime(idx, "end_time", e.target.value)}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Kapalı</span>
                )}
              </div>
            );
          })}
        </div>

        <Button className="mt-4" onClick={saveHours} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Çalışma Saatlerini Kaydet
        </Button>
      </section>

      <Separator />

      {/* Closed Dates */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Tatil / Özel Kapalı Günler</h2>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Tarih *</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-44"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sebep (opsiyonel)</Label>
            <Input
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Bayram, bakım..."
              className="w-52"
            />
          </div>
          <Button onClick={addClosedDate} disabled={addingDate} size="sm">
            {addingDate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Ekle
          </Button>
        </div>

        {closedDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tanımlı kapalı gün yok.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {closedDates.map((cd) => (
              <Badge key={cd.id} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="font-mono text-xs">{cd.date}</span>
                {cd.reason && <span className="text-muted-foreground">· {cd.reason}</span>}
                <button
                  onClick={() => removeClosedDate(cd.id)}
                  className="ml-1 rounded hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

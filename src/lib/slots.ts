import type { WorkingHour, ClosedDate, Appointment, TimeSlot } from "@/types";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const min = (m % 60).toString().padStart(2, "0");
  return `${h}:${min}`;
}

export interface GenerateSlotsParams {
  date: string;            // "YYYY-MM-DD"
  durationMinutes: number;
  slotIntervalMinutes?: number | null;
  nowMinutes?: number;     // if provided, slots starting before this are unavailable
  workingHours: WorkingHour[];
  closedDates: ClosedDate[];
  existingAppointments: Appointment[];
  staffId?: number | null;
  allStaffIds?: number[] | null; // when set and staffId is null: slot available if any staff is free
}

export function generateSlots({
  date,
  durationMinutes,
  slotIntervalMinutes,
  nowMinutes,
  workingHours,
  closedDates,
  existingAppointments,
  staffId,
  allStaffIds,
}: GenerateSlotsParams): TimeSlot[] {
  const step = slotIntervalMinutes && slotIntervalMinutes > 0 ? slotIntervalMinutes : durationMinutes;
  // Closed check
  if (closedDates.some((cd) => cd.date === date)) return [];

  // Weekday (0=Sun…6=Sat)
  const [y, mo, d] = date.split("-").map(Number);
  const weekday = new Date(y, mo - 1, d).getDay();

  // Prefer staff-specific hours; fall back to business-level (staff_id = null)
  const wh =
    workingHours.find(
      (w) => w.weekday === weekday && (staffId != null ? w.staff_id === staffId : w.staff_id == null)
    ) ??
    (staffId != null
      ? workingHours.find((w) => w.weekday === weekday && w.staff_id == null)
      : undefined);
  if (!wh) return [];

  const startMin = timeToMinutes(wh.start_time);
  const endMin   = timeToMinutes(wh.end_time);

  // Onaylı randevular — tarih+durum filtreli
  const approved = existingAppointments.filter(
    (a) => a.appointment_date === date && a.status === "approved"
  );

  // "Fark etmez" modunda: en az bir personel müsaitse slot açık
  const anyStaffMode = staffId == null && allStaffIds && allStaffIds.length > 0;

  // Belirli personel veya atamasız randevular için bloklar
  const blockedRanges = anyStaffMode
    ? []
    : approved
        .filter((a) => staffId == null || a.staff_id == null || a.staff_id === staffId)
        .map((a) => ({ start: timeToMinutes(a.start_time), end: timeToMinutes(a.end_time) }));

  const slots: TimeSlot[] = [];
  let cursor = startMin;

  while (cursor + durationMinutes <= endMin) {
    const slotEnd = cursor + durationMinutes;
    const isPast = nowMinutes !== undefined && cursor < nowMinutes;

    let available: boolean;
    if (isPast) {
      available = false;
    } else if (anyStaffMode) {
      // Slot açık ⟺ en az bir personelin çakışan onaylı randevusu yok
      available = allStaffIds!.some(
        (sid) => !approved.some(
          (a) => a.staff_id === sid && timeToMinutes(a.start_time) < slotEnd && timeToMinutes(a.end_time) > cursor
        )
      );
    } else {
      available = !blockedRanges.some((r) => cursor < r.end && slotEnd > r.start);
    }

    slots.push({ start: minutesToTime(cursor), end: minutesToTime(slotEnd), available });
    cursor += step;
  }

  return slots;
}

export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Ham rakamları → "0 (5XX) XXX XXXX" görsel formatına çevirir */
export function formatPhoneDisplay(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  let out = "";
  for (let i = 0; i < d.length; i++) {
    if (i === 1) out += " (";
    else if (i === 4) out += ") ";
    else if (i === 7) out += " ";
    out += d[i];
  }
  return out;
}

/** Ham rakamlar çıkarır (state / API'ye gönderim için) */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Türk mobil numarası mı? Hem raw hem formatlanmış değer kabul eder */
export function validatePhone(phone: string): boolean {
  return /^05\d{9}$/.test(phone.replace(/\D/g, ""));
}

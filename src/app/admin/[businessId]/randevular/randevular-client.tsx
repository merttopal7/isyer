"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2, XCircle, Clock, Ban, CalendarDays, List, ChevronLeft, ChevronRight,
  Loader2, LayoutGrid, CalendarRange, Trash2, AlertCircle, MessageCircle, Plus, Copy, ExternalLink, RefreshCw,
} from "lucide-react";
import type { AppointmentStatus, Service, StaffOrResource, TimeSlot } from "@/types";
import { bizUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { validatePhone } from "@/lib/slots";
import { PhoneInput } from "@/components/shared/phone-input";

export type EnrichedAppointment = {
  id: number;
  customer_id: number | null;
  service_name: string;
  staff_name: string | null;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  reject_reason: string | null;
  booking_code: string;
  checked_in: boolean | null;
  created_at: string;
};

const STATUS_META: Record<AppointmentStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "secondary" | "destructive" | "outline";
}> = {
  pending:          { label: "Bekliyor",      icon: Clock,        variant: "secondary"   },
  approved:         { label: "Onaylandı",     icon: CheckCircle2, variant: "default"     },
  rejected:         { label: "Reddedildi",    icon: XCircle,      variant: "destructive" },
  cancelled:        { label: "İptal Edildi",  icon: Ban,          variant: "outline"     },
  cancel_requested: { label: "İptal Talebi", icon: AlertCircle,  variant: "outline"     },
};

const STATUS_BLOCK: Record<AppointmentStatus, string> = {
  pending:          "border-l-amber-400  bg-amber-50   text-amber-900  dark:bg-amber-900/30  dark:text-amber-200  dark:border-l-amber-500",
  approved:         "border-l-green-500  bg-green-50   text-green-900  dark:bg-green-900/30  dark:text-green-200  dark:border-l-green-400",
  rejected:         "border-l-red-400    bg-red-50     text-red-900    dark:bg-red-900/20    dark:text-red-300    dark:border-l-red-500",
  cancelled:        "border-l-border     bg-muted/50   text-muted-foreground",
  cancel_requested: "border-l-orange-400 bg-orange-50  text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 dark:border-l-orange-500",
};

const ALL_STATUSES: AppointmentStatus[] = ["pending", "approved", "rejected", "cancelled", "cancel_requested"];
const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const HOUR_START = 7;
const HOUR_END = 21;
const HOUR_HEIGHT = 64; // px per hour
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(anchor: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    return d;
  });
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Union-find: group appointments that overlap (transitively)
function groupOverlapping(appts: EnrichedAppointment[]): EnrichedAppointment[][] {
  const n = appts.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(i: number): number {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
    return i;
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (timeToMin(appts[i].start_time) < timeToMin(appts[j].end_time) &&
          timeToMin(appts[i].end_time) > timeToMin(appts[j].start_time)) {
        parent[find(i)] = find(j);
      }
    }
  }
  const map = new Map<number, EnrichedAppointment[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!map.has(root)) map.set(root, []);
    map.get(root)!.push(appts[i]);
  }
  return [...map.values()];
}

// Assign side-by-side columns within a single overlap group
function layoutGroup(group: EnrichedAppointment[]) {
  const sorted = [...group].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const cols: EnrichedAppointment[][] = [];
  const layout: { appt: EnrichedAppointment; col: number; totalCols: number }[] = [];
  for (const appt of sorted) {
    let c = cols.findIndex(
      (col) => col.length === 0 || timeToMin(col[col.length - 1].end_time) <= timeToMin(appt.start_time)
    );
    if (c === -1) { c = cols.length; cols.push([]); }
    cols[c].push(appt);
    layout.push({ appt, col: c, totalCols: 0 });
  }
  const totalCols = Math.max(1, cols.length);
  return layout.map((item) => ({ ...item, totalCols }));
}

function isFuture(date: string, startTime: string, todayKey: string) {
  if (date > todayKey) return true;
  if (date < todayKey) return false;
  // Bugünse saate bak
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [h, m] = startTime.split(":").map(Number);
  return h * 60 + m > nowMin;
}

function toWaPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("90")) return `+${d}`;
  if (d.startsWith("0")) return `+90${d.slice(1)}`;
  return `+90${d}`;
}

function waLink(appt: EnrichedAppointment, businessSlug: string): string {
  const phone = toWaPhone(appt.customer_phone);
  const date = formatDateDisplay(appt.appointment_date);
  const apptUrl = `\nRandevu detaylarınız: ${bizUrl(businessSlug, `/randevu/${appt.booking_code}`, typeof window !== "undefined" ? window.location.origin : "")}`;
  const greeting = appt.customer_id !== null ? `Merhaba ${appt.customer_name}, ` : "";
  const texts: Record<AppointmentStatus, string> = {
    pending:          `${greeting}${appt.service_name} randevunuz (${date} ${appt.start_time}) alındı ve onay bekleniyor. Randevu kodunuz: ${appt.booking_code}${apptUrl}`,
    approved:         `${greeting}${appt.service_name} randevunuz ${date} ${appt.start_time} için onaylanmıştır. Randevu kodunuz: ${appt.booking_code}${apptUrl}`,
    rejected:         `${greeting}${appt.service_name} randevunuz maalesef uygun değildir.${appt.reject_reason ? ` Sebep: ${appt.reject_reason}` : ""}`,
    cancelled:        `${greeting}${appt.service_name} randevunuz (${date} ${appt.start_time}) iptal edilmiştir.`,
    cancel_requested: `${greeting}iptal talebiniz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.`,
  };
  return `https://wa.me/${phone}?text=${encodeURIComponent(texts[appt.status])}`;
}

const WA_STATUSES: AppointmentStatus[] = ["pending", "approved", "cancel_requested", "cancelled"];

function WaButton({ appt, size = "sm", businessSlug }: { appt: EnrichedAppointment; size?: "sm" | "xs"; businessSlug: string }) {
  if (!WA_STATUSES.includes(appt.status)) return null;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (!isFuture(appt.appointment_date, appt.start_time, todayStr)) return null;
  return (
    <a
      href={waLink(appt, businessSlug)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-green-500 bg-green-500 font-medium text-white transition-colors hover:bg-green-600 hover:border-green-600 dark:bg-green-600 dark:border-green-600 dark:hover:bg-green-700",
        size === "xs" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
      )}
    >
      <MessageCircle className={size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      WhatsApp
    </a>
  );
}

type ActionType = "approve" | "reject" | "cancel" | "approve_cancel" | "deny_cancel";

function ApptCard({
  appt,
  todayKey,
  deletingId,
  onOpen,
  onDelete,
  onCheckIn,
  onClose,
  businessSlug,
}: {
  appt: EnrichedAppointment;
  todayKey: string;
  deletingId: number | null;
  onOpen: (appt: EnrichedAppointment, type: ActionType) => void;
  onDelete: (id: number) => void;
  onCheckIn: (id: number, value: boolean | null) => void;
  onClose?: () => void;
  businessSlug: string;
}) {
  const s = STATUS_META[appt.status];
  const future = isFuture(appt.appointment_date, appt.start_time, todayKey);
  const act = (type: ActionType) => { onClose?.(); onOpen(appt, type); };

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{appt.start_time} · {appt.customer_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {appt.service_name}{appt.staff_name ? ` · ${appt.staff_name}` : ""}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">{appt.booking_code}</span>
            <WaButton appt={appt} size="xs" businessSlug={businessSlug} />
          </div>
        </div>
        <Badge variant={s.variant} className="shrink-0 text-xs">{s.label}</Badge>
      </div>

      {appt.status === "pending" && future && (
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => act("approve")}>
            <CheckCircle2 className="mr-1 h-3 w-3" /> Onayla
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => act("reject")}>
            <XCircle className="mr-1 h-3 w-3" /> Reddet
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => act("cancel")}>
            <Ban className="mr-1 h-3 w-3" /> İptal
          </Button>
        </div>
      )}
      {appt.status === "approved" && future && (
        <Button size="sm" variant="outline" className="mt-2 h-7 w-full text-xs" onClick={() => act("cancel")}>
          <Ban className="mr-1 h-3 w-3" /> İptal Et
        </Button>
      )}
      {appt.status === "cancel_requested" && (
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => act("deny_cancel")}>
            <XCircle className="mr-1 h-3 w-3" /> Reddet
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => act("approve_cancel")}>
            <CheckCircle2 className="mr-1 h-3 w-3" /> İptali Onayla
          </Button>
        </div>
      )}
      {appt.status === "approved" && !future && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Geldi mi?</span>
          <button
            onClick={() => onCheckIn(appt.id, appt.checked_in === true ? null : true)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors",
              appt.checked_in === true
                ? "bg-green-500 text-white"
                : "border border-green-400 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
            )}
          >
            <CheckCircle2 className="h-3 w-3" /> Geldi
          </button>
          <button
            onClick={() => onCheckIn(appt.id, appt.checked_in === false ? null : false)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors",
              appt.checked_in === false
                ? "bg-red-500 text-white"
                : "border border-red-400 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            )}
          >
            <XCircle className="h-3 w-3" /> Gelmedi
          </button>
        </div>
      )}
      {appt.status === "cancelled" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 h-7 w-full text-xs text-destructive hover:text-destructive"
          disabled={deletingId === appt.id}
          onClick={() => { onClose?.(); onDelete(appt.id); }}
        >
          {deletingId === appt.id
            ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            : <Trash2 className="mr-1 h-3 w-3" />}
          Sil
        </Button>
      )}
    </div>
  );
}

function padDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateDisplay(d: string) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("tr-TR", {
    day: "numeric", month: "short", weekday: "short",
  });
}

interface Props {
  businessId: number;
  appointments: EnrichedAppointment[];
  view: "list" | "week" | "month";
  selectedStatuses: AppointmentStatus[];
  page: number;
  totalPages: number;
  counts: Record<string, number>;
  weekStart: string;
  calYear: number;
  calMonth: number;
  services: Service[];
  staff: StaffOrResource[];
  businessSlug: string;
}

export function RandevularClient({
  businessId,
  appointments,
  view,
  selectedStatuses,
  page,
  totalPages,
  counts,
  weekStart,
  calYear,
  calMonth,
  services,
  staff,
  businessSlug,
}: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Auto-refresh — localStorage'dan başlat
  const [refreshInterval, setRefreshIntervalState] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("admin_refresh_interval") ?? 0);
  });
  const [countdown, setCountdown] = useState(0);

  function setRefreshInterval(val: number) {
    setRefreshIntervalState(val);
    localStorage.setItem("admin_refresh_interval", String(val));
  }

  useEffect(() => {
    if (refreshInterval === 0) { setCountdown(0); return; }
    setCountdown(refreshInterval);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { router.refresh(); return refreshInterval; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, router]);

  const today = new Date();
  const todayKey = toDateKey(today);

  const selectedStatusSet = useMemo(() => new Set(selectedStatuses), [selectedStatuses]);

  // Hafta günleri weekStart'tan hesaplanır
  const weekDays = useMemo(() => {
    const start = new Date(weekStart + "T00:00:00");
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekLabel = (() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()]} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  })();

  function addDaysStr(dateStr: string, n: number) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n);
    return toDateKey(d);
  }

  function getMondayOf(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return toDateKey(d);
  }

  function buildUrl(overrides: {
    view?: "list" | "week" | "month";
    statuses?: AppointmentStatus[];
    page?: number;
    week?: string;
    year?: number;
    month?: number;
  }) {
    const v = overrides.view ?? view;
    const p = new URLSearchParams();
    p.set("view", v);
    const s = overrides.statuses ?? selectedStatuses;
    if (s.length > 0) p.set("statuses", s.join(","));
    if (v === "list") p.set("page", String(overrides.page ?? (overrides.view ? 1 : page)));
    if (v === "week") p.set("week", overrides.week ?? weekStart);
    if (v === "month") {
      p.set("year", String(overrides.year ?? calYear));
      p.set("month", String(overrides.month ?? calMonth));
    }
    return `?${p.toString()}`;
  }

  // Action dialog
  const [actionTarget, setActionTarget] = useState<EnrichedAppointment | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actioning, setActioning] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // ── Create appointment dialog ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [cPhone, setCPhone] = useState("");
  const [cPhoneTouched, setCPhoneTouched] = useState(false);
  const [cName, setCName] = useState("");
  const [cServiceId, setCServiceId] = useState<number | "">("");
  const [cStaffId, setCStaffId] = useState<number | "">("");
  const [cDate, setCDate] = useState("");
  const [cSlots, setCSlots] = useState<TimeSlot[]>([]);
  const [cSlotsLoading, setCSlotLoading] = useState(false);
  const [cTime, setCTime] = useState("");
  const [cCreating, setCCreating] = useState(false);
  const [cResult, setCResult] = useState<{ booking_code: string; id: number } | null>(null);

  function resetCreate() {
    setCreateStep(1);
    setCPhone(""); setCPhoneTouched(false); setCName(""); setCServiceId(""); setCStaffId("");
    setCDate(""); setCSlots([]); setCTime(""); setCResult(null);
  }

  useEffect(() => {
    if (!cServiceId || !cDate) { setCSlots([]); setCTime(""); return; }
    setCSlotLoading(true);
    const url = `/api/admin/${businessId}/slots?service_id=${cServiceId}&date=${cDate}${cStaffId ? `&staff_id=${cStaffId}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: TimeSlot[]) => { setCSlots(data); setCTime(""); })
      .catch(() => setCSlots([]))
      .finally(() => setCSlotLoading(false));
  }, [cServiceId, cDate, cStaffId, businessId]);

  async function submitCreate() {
    if (!cServiceId || !cDate || !cTime || !cPhone || !cName) return;
    setCCreating(true);
    try {
      const res = await fetch(`/api/admin/${businessId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: cServiceId,
          staff_id: cStaffId || undefined,
          customer_name: cName,
          customer_phone: cPhone,
          appointment_date: cDate,
          start_time: cTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Randevu oluşturulamadı."); return; }
      setCResult({ booking_code: data.booking_code, id: data.id });
      setCreateStep(4);
      router.refresh();
    } finally {
      setCCreating(false);
    }
  }

  const [checkInOverrides, setCheckInOverrides] = useState<Record<number, boolean | null>>({});

  useEffect(() => { setCheckInOverrides({}); }, [appointments]);

  function resolveCheckedIn(appt: EnrichedAppointment): EnrichedAppointment {
    const base = appt.id in checkInOverrides ? { ...appt, checked_in: checkInOverrides[appt.id] } : appt;
    const ci = base.checked_in;
    return { ...base, checked_in: ci === null || ci === undefined ? null : !!ci };
  }

  // Detail popover for week view
  const [detailAppt, setDetailAppt] = useState<EnrichedAppointment | null>(null);
  // Group popup for 3+ overlapping appointments
  const [groupPopup, setGroupPopup] = useState<EnrichedAppointment[] | null>(null);

  // Selected day in week view
  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(todayKey);

  // Resizable month panel
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const monthContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  function handleDividerMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = rightPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !monthContainerRef.current) return;
      const delta = dragStartX.current - e.clientX;
      const containerWidth = monthContainerRef.current.offsetWidth;
      const newWidth = Math.max(200, Math.min(Math.round(containerWidth * 0.55), dragStartWidth.current + delta));
      setRightPanelWidth(newWidth);
    }
    function onMouseUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Scroll week view to first appointment or 08:00
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (view !== "week" || !gridRef.current) return;
    gridRef.current.scrollTop = (8 - HOUR_START) * HOUR_HEIGHT;
  }, [view]);

  // Server zaten status filtreli gönderdi; takvim için date map
  const calendarMap = useMemo(() => {
    const map: Record<string, EnrichedAppointment[]> = {};
    for (const a of appointments) {
      if (!map[a.appointment_date]) map[a.appointment_date] = [];
      map[a.appointment_date].push(a);
    }
    return map;
  }, [appointments]);

  const weekCalendarMap = calendarMap;

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter((a) =>
      a.customer_name.toLowerCase().includes(q) ||
      a.customer_phone.includes(q) ||
      a.booking_code.toLowerCase().includes(q) ||
      a.service_name.toLowerCase().includes(q)
    );
  }, [appointments, searchQuery]);

  function openAction(a: EnrichedAppointment, type: ActionType) {
    setDetailAppt(null);
    setActionTarget(a);
    setActionType(type);
    setRejectReason("");
  }

  async function confirmAction() {
    if (!actionTarget || !actionType) return;
    setActioning(true);
    try {
      const statusMap: Record<string, string> = {
        approve: "approved", reject: "rejected", cancel: "cancelled",
        approve_cancel: "cancelled", deny_cancel: "approved",
      };
      const body: Record<string, unknown> = { status: statusMap[actionType] };
      if (actionType === "reject") body.reject_reason = rejectReason || null;
      const res = await fetch(`/api/appointments/${actionTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İşlem başarısız."); return; }
      toast.success(
        actionType === "approve"         ? "Randevu onaylandı." :
        actionType === "reject"          ? "Randevu reddedildi." :
        actionType === "approve_cancel"  ? "İptal talebi onaylandı, randevu iptal edildi." :
        actionType === "deny_cancel"     ? "İptal talebi reddedildi, randevu onaylı kaldı." :
                                           "Randevu iptal edildi."
      );
      setActionTarget(null);
      setActionType(null);
      router.refresh();
    } finally {
      setActioning(false);
    }
  }

  async function setCheckIn(id: number, value: boolean | null) {
    setCheckInOverrides(prev => ({ ...prev, [id]: value }));
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked_in: value }),
    });
    if (!res.ok) {
      setCheckInOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
      try { const d = await res.json(); toast.error(d.error ?? "İşlem başarısız."); }
      catch { toast.error("İşlem başarısız."); }
      return;
    }
    router.refresh();
  }

  async function deleteAppointment(id: number) {
    if (!confirm("Bu iptal edilmiş randevu kalıcı olarak silinecek. Emin misiniz?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Silinemedi."); return; }
      toast.success("Randevu silindi.");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  // Month view data
  const calDays = getCalendarDays(calYear, calMonth);
  const selectedDateKey = selectedDay ? padDate(calYear, calMonth, selectedDay) : null;
  const selectedDayAppts = selectedDateKey ? (calendarMap[selectedDateKey] ?? []) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <h1 className="text-base font-bold sm:text-xl">Randevular</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{counts.all} toplam randevu</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Randevu Oluştur */}
          <Button size="sm" className="h-8 px-2 sm:px-3" onClick={() => { resetCreate(); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Randevu Oluştur</span>
          </Button>

          {/* View switcher */}
          <div className="flex items-center rounded-lg border p-0.5">
            <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" className="h-7 px-1.5 sm:px-2" onClick={() => router.push(buildUrl({ view: "list" }))}>
              <List className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Liste</span>
            </Button>
            <Button variant={view === "week" ? "secondary" : "ghost"} size="sm" className="h-7 px-1.5 sm:px-2" onClick={() => router.push(buildUrl({ view: "week" }))}>
              <CalendarRange className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Hafta</span>
            </Button>
            <Button variant={view === "month" ? "secondary" : "ghost"} size="sm" className="h-7 px-1.5 sm:px-2" onClick={() => router.push(buildUrl({ view: "month" }))}>
              <LayoutGrid className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Ay</span>
            </Button>
          </div>

          {/* Yenile + Auto-refresh */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => router.refresh()} title="Yenile">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            {refreshInterval > 0 && countdown > 0 && (
              <span className="hidden w-6 text-right text-xs font-mono tabular-nums text-muted-foreground sm:inline">{countdown}s</span>
            )}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="h-8 rounded border bg-background px-1 text-xs cursor-pointer"
            >
              <option value={0}>Kapalı</option>
              <option value={30}>30s</option>
              <option value={60}>1dk</option>
              <option value={120}>2dk</option>
              <option value={300}>5dk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status checkboxes */}
      <div className="border-b overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-0 px-2 py-1 w-max">
          {/* Tümü */}
          <label className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-muted transition-colors select-none whitespace-nowrap">
            <input
              type="checkbox"
              className="h-3 w-3 accent-primary cursor-pointer"
              ref={(el) => {
                if (el) el.indeterminate = selectedStatusSet.size > 0 && selectedStatusSet.size < ALL_STATUSES.length;
              }}
              checked={selectedStatusSet.size === ALL_STATUSES.length}
              onChange={() => {
                router.push(buildUrl({
                  statuses: selectedStatusSet.size === ALL_STATUSES.length ? [] : [...ALL_STATUSES],
                  page: 1,
                }));
              }}
            />
            Tümü ({counts.all})
          </label>
          <div className="mx-0.5 h-3.5 w-px bg-border shrink-0" />
          {ALL_STATUSES.map((s) => {
            const m = STATUS_META[s];
            const checked = selectedStatusSet.has(s);
            return (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted transition-colors select-none whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  className="h-3 w-3 accent-primary cursor-pointer"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selectedStatuses.filter((x) => x !== s)
                      : [...selectedStatuses, s];
                    router.push(buildUrl({ statuses: next, page: 1 }));
                  }}
                />
                {m.label} ({counts[s]})
              </label>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ LIST VIEW ═══════════════ */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-3 py-3 sm:px-4">
            <Input
              placeholder="Müşteri adı, telefon veya randevu kodu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 px-3 pb-3 sm:px-4">
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">Randevu bulunamadı.</p>
            )}
            {filtered.map((a) => {
              const s = STATUS_META[a.status];
              const Icon = s.icon;
              return (
                <div key={a.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{a.customer_phone}</p>
                    </div>
                    <Badge variant={s.variant} className="shrink-0 gap-1 text-xs">
                      <Icon className="h-3 w-3" />{s.label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{a.service_name}{a.staff_name ? ` · ${a.staff_name}` : ""}</span>
                    <span>{formatDateDisplay(a.appointment_date)} · {a.start_time}–{a.end_time}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-xs text-muted-foreground">{a.booking_code}</p>
                    <WaButton appt={a} size="xs" businessSlug={businessSlug} />
                  </div>
                  {a.status === "rejected" && a.reject_reason && (
                    <p className="mt-1 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{a.reject_reason}</p>
                  )}
                  {a.status === "pending" && isFuture(a.appointment_date, a.start_time, todayKey) && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => openAction(a, "approve")}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Onayla
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openAction(a, "reject")}>
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openAction(a, "cancel")}>
                        <Ban className="mr-1 h-3.5 w-3.5" /> İptal
                      </Button>
                    </div>
                  )}
                  {a.status === "approved" && isFuture(a.appointment_date, a.start_time, todayKey) && (
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="w-full" onClick={() => openAction(a, "cancel")}>
                        <Ban className="mr-1 h-3.5 w-3.5" /> Randevuyu İptal Et
                      </Button>
                    </div>
                  )}
                  {a.status === "cancel_requested" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => openAction(a, "deny_cancel")}>
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openAction(a, "approve_cancel")}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> İptali Onayla
                      </Button>
                    </div>
                  )}
                  {a.status === "cancelled" && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => deleteAppointment(a.id)}
                        disabled={deletingId === a.id}
                      >
                        {deletingId === a.id
                          ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="mr-1 h-3.5 w-3.5" />}
                        Sil
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Hizmet</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Randevu bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => {
                  const s = STATUS_META[a.status];
                  const Icon = s.icon;
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-medium">{a.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{a.customer_phone}</p>
                      </TableCell>
                      <TableCell>
                        <p>{a.service_name}</p>
                        {a.staff_name && <p className="text-xs text-muted-foreground">{a.staff_name}</p>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateDisplay(a.appointment_date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{a.start_time}–{a.end_time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">{a.booking_code}</span>
                          <WaButton appt={a} size="xs" businessSlug={businessSlug} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant} className="gap-1">
                          <Icon className="h-3 w-3" />{s.label}
                        </Badge>
                        {a.status === "rejected" && a.reject_reason && (
                          <p className="mt-1 max-w-[140px] truncate text-xs text-muted-foreground" title={a.reject_reason}>
                            {a.reject_reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === "pending" && isFuture(a.appointment_date, a.start_time, todayKey) && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" onClick={() => openAction(a, "approve")}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Onayla
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openAction(a, "reject")}>
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openAction(a, "cancel")}>
                              <Ban className="mr-1 h-3.5 w-3.5" /> İptal
                            </Button>
                          </div>
                        )}
                        {a.status === "approved" && isFuture(a.appointment_date, a.start_time, todayKey) && (
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => openAction(a, "cancel")}>
                              <Ban className="mr-1 h-3.5 w-3.5" /> İptal Et
                            </Button>
                          </div>
                        )}
                        {a.status === "cancel_requested" && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" onClick={() => openAction(a, "deny_cancel")}>
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openAction(a, "approve_cancel")}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> İptali Onayla
                            </Button>
                          </div>
                        )}
                        {a.status === "cancelled" && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteAppointment(a.id)}
                              disabled={deletingId === a.id}
                            >
                              {deletingId === a.id
                                ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                : <Trash2 className="mr-1 h-3.5 w-3.5" />}
                              Sil
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => router.push(buildUrl({ page: page - 1 }))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => router.push(buildUrl({ page: page + 1 }))}
              >
                Sonraki
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ WEEK VIEW ═══════════════ */}
      {view === "week" && (
        <div className="flex flex-col flex-1 min-h-0 border-t overflow-hidden">
          {/* Week navigation */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ week: todayKey }))}>
                Bugün
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ week: addDaysStr(weekStart, -7) }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ week: addDaysStr(weekStart, 7) }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm font-semibold">{weekLabel}</span>
            <div className="w-[88px] sm:w-[120px]" />
          </div>

          {/* ── MOBILE: horizontal day strip + single-day grid ── */}
          <div className="md:hidden flex flex-col flex-1 min-h-0">
            {/* Equal-width day strip */}
            <div className="flex border-b bg-muted/20">
              {weekDays.map((day, i) => {
                const isToday = toDateKey(day) === todayKey;
                const dateKey = toDateKey(day);
                const isActive = (selectedWeekDay ?? todayKey) === dateKey;
                const count = (weekCalendarMap[dateKey] ?? []).length;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedWeekDay(dateKey)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center py-2 transition-colors",
                      isActive ? "border-b-2 border-primary" : "border-b-2 border-transparent"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {DAY_NAMES[(day.getDay() + 6) % 7]} {count > 0 && (
                      <span className="absolute h-[5px] w-[5px] rounded-full bg-primary right-1 top-3" />
                    )}
                    </span>
                    <span className={cn(
                      "mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                      isToday ? "bg-primary text-primary-foreground" : isActive ? "text-primary" : "text-foreground"
                    )}>
                      {day.getDate()}
                    </span>

                  </button>
                );
              })}
            </div>

            {/* Single-day time grid */}
            {(() => {
              const activeDateKey = selectedWeekDay ?? todayKey;
              const groups = groupOverlapping(weekCalendarMap[activeDateKey] ?? []);
              return (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="flex" style={{ height: TOTAL_HEIGHT }}>
                    <div className="relative w-12 shrink-0 border-r">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="absolute right-1 text-[10px] text-muted-foreground select-none"
                          style={{ top: (hour - HOUR_START) * HOUR_HEIGHT - 7 }}
                        >
                          {String(hour).padStart(2, "0")}:00
                        </div>
                      ))}
                    </div>
                    <div className="relative flex-1">
                      {HOURS.map((hour) => (
                        <div key={hour} className="pointer-events-none absolute inset-x-0 border-t border-border/40" style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }} />
                      ))}
                      {HOURS.map((hour) => (
                        <div key={`h${hour}`} className="pointer-events-none absolute inset-x-0 border-t border-border/20 border-dashed" style={{ top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                      ))}
                      {groups.flatMap((group) => {
                        if (group.length > 2) {
                          const sorted = [...group].sort((a, b) => a.start_time.localeCompare(b.start_time));
                          const shown = sorted.slice(0, 2);
                          const remaining = group.length - 2;
                          const startMin = Math.min(...group.map((a) => timeToMin(a.start_time)));
                          const endMin = Math.max(...group.map((a) => timeToMin(a.end_time)));
                          const top = (startMin - HOUR_START * 60) * HOUR_HEIGHT / 60;
                          const height = Math.max((endMin - startMin) * HOUR_HEIGHT / 60, 28);
                          if (top < 0 || top >= TOTAL_HEIGHT) return [];
                          return [
                            ...shown.map((appt, i) => (
                              <button
                                key={appt.id}
                                onClick={() => setDetailAppt(appt)}
                                className={cn(
                                  "absolute rounded border-l-[3px] px-2 text-left text-xs overflow-hidden transition-all hover:brightness-95",
                                  STATUS_BLOCK[appt.status]
                                )}
                                style={{ top: top + 1, height: height - 2, left: `calc(${i * 33.33}% + 4px)`, width: "calc(33.33% - 8px)", zIndex: 1 }}
                              >
                                <p className="font-semibold leading-tight truncate">{appt.start_time} · {appt.customer_name}</p>
                                {height > 36 && <p className="truncate opacity-75">{appt.service_name}</p>}
                              </button>
                            )),
                            <button
                              key={`more-${group[0].id}`}
                              onClick={() => setGroupPopup(group)}
                              className="absolute flex flex-col items-center justify-center rounded border border-dashed border-primary/50 bg-primary/5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                              style={{ top: top + 1, height: height - 2, left: "calc(66.66% + 4px)", width: "calc(33.33% - 8px)", zIndex: 1 }}
                            >
                              +{remaining}
                            </button>,
                          ];
                        }
                        return layoutGroup(group).map(({ appt, col, totalCols }: { appt: EnrichedAppointment; col: number; totalCols: number }) => {
                          const startMin = timeToMin(appt.start_time);
                          const endMin = timeToMin(appt.end_time);
                          const top = (startMin - HOUR_START * 60) * HOUR_HEIGHT / 60;
                          const height = Math.max((endMin - startMin) * HOUR_HEIGHT / 60, 28);
                          if (top < 0 || top >= TOTAL_HEIGHT) return null;
                          const colW = 100 / totalCols;
                          return (
                            <button
                              key={appt.id}
                              onClick={() => setDetailAppt(appt)}
                              className={cn(
                                "absolute rounded border-l-[3px] px-2 text-left text-xs overflow-hidden transition-all hover:brightness-95",
                                STATUS_BLOCK[appt.status]
                              )}
                              style={{
                                top: top + 1,
                                height: height - 2,
                                left: `calc(${col * colW}% + 4px)`,
                                width: `calc(${colW}% - 8px)`,
                                zIndex: 1,
                              }}
                            >
                              <p className="font-semibold leading-tight truncate">
                                {appt.start_time} · {appt.customer_name}
                              </p>
                              {height > 36 && <p className="truncate opacity-75">{appt.service_name}</p>}
                            </button>
                          );
                        }).filter(Boolean);
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── DESKTOP: full 7-column time grid ── */}
          <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
            {/* Single scroll container — header inside so widths always match */}
            <div ref={gridRef} className="flex-1 overflow-y-auto min-h-0">
              {/* Sticky day header row */}
              <div className="sticky top-0 z-10 flex border-b bg-muted/20">
                <div className="w-14 shrink-0 border-r" />
                {weekDays.map((day, i) => {
                  const isToday = toDateKey(day) === todayKey;
                  const dateKey = toDateKey(day);
                  const count = (weekCalendarMap[dateKey] ?? []).length;
                  return (
                    <div
                      key={i}
                      style={{ flex: "1 1 0", minWidth: 0 }}
                      className="border-r last:border-r-0 py-2 text-center"
                    >
                      <p className="text-xs relative font-medium text-muted-foreground uppercase tracking-wide truncate px-1">
                        {DAY_NAMES[(day.getDay() + 6) % 7]}
                        {count > 0 && (
                          <span className="ml-1 absolute right-[5px] top-0"><b className="text-black text-xs">{count} randevu</b></span>
                        )}
                      </p>
                      <div className={cn(
                        "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}>
                        {day.getDate()}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="flex" style={{ height: TOTAL_HEIGHT }}>
                {/* Hour labels */}
                <div className="relative w-14 shrink-0 border-r">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute right-2 text-xs text-muted-foreground select-none"
                      style={{ top: (hour - HOUR_START) * HOUR_HEIGHT - 8 }}
                    >
                      {String(hour).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDays.map((day, di) => {
                  const dateKey = toDateKey(day);
                  const groups = groupOverlapping(weekCalendarMap[dateKey] ?? []);
                  const isToday = dateKey === todayKey;

                  return (
                    <div
                      key={di}
                      style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden" }}
                      className={cn(
                        "relative border-r last:border-r-0",
                        isToday ? "bg-primary/[0.02]" : ""
                      )}
                    >
                      {HOURS.map((hour) => (
                        <div key={hour} className="pointer-events-none absolute inset-x-0 border-t border-border/40" style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }} />
                      ))}
                      {HOURS.map((hour) => (
                        <div key={`h${hour}`} className="pointer-events-none absolute inset-x-0 border-t border-border/20 border-dashed" style={{ top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                      ))}

                      {groups.flatMap((group) => {
                        if (group.length > 2) {
                          const sorted = [...group].sort((a, b) => a.start_time.localeCompare(b.start_time));
                          const shown = sorted.slice(0, 2);
                          const remaining = group.length - 2;
                          const startMin = Math.min(...group.map((a) => timeToMin(a.start_time)));
                          const endMin = Math.max(...group.map((a) => timeToMin(a.end_time)));
                          const top = (startMin - HOUR_START * 60) * HOUR_HEIGHT / 60;
                          const height = Math.max((endMin - startMin) * HOUR_HEIGHT / 60, 22);
                          if (top < 0 || top >= TOTAL_HEIGHT) return [];
                          return [
                            ...shown.map((appt, i) => (
                              <button
                                key={appt.id}
                                onClick={() => setDetailAppt(appt)}
                                className={cn(
                                  "absolute rounded border-l-[3px] px-1.5 text-left text-xs overflow-hidden transition-all hover:brightness-95 hover:shadow-sm",
                                  STATUS_BLOCK[appt.status]
                                )}
                                style={{ top: top + 1, height: height - 2, left: `calc(${i * 33.33}% + 2px)`, width: "calc(33.33% - 4px)", zIndex: 1 }}
                              >
                                <p className="font-semibold leading-tight truncate">{appt.start_time} · {appt.customer_name}</p>
                                {height > 30 && <p className="truncate opacity-75">{appt.service_name}</p>}
                                {height > 46 && appt.staff_name && <p className="truncate opacity-60">{appt.staff_name}</p>}
                              </button>
                            )),
                            <button
                              key={`more-${group[0].id}`}
                              onClick={() => setGroupPopup(group)}
                              className="absolute flex flex-col items-center justify-center rounded border border-dashed border-primary/50 bg-primary/5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                              style={{ top: top + 1, height: height - 2, left: "calc(66.66% + 2px)", width: "calc(33.33% - 4px)", zIndex: 1 }}
                            >
                              +{remaining}
                            </button>,
                          ];
                        }
                        return layoutGroup(group).map(({ appt, col, totalCols }: { appt: EnrichedAppointment; col: number; totalCols: number }) => {
                          const startMin = timeToMin(appt.start_time);
                          const endMin = timeToMin(appt.end_time);
                          const top = (startMin - HOUR_START * 60) * HOUR_HEIGHT / 60;
                          const height = Math.max((endMin - startMin) * HOUR_HEIGHT / 60, 22);
                          if (top < 0 || top >= TOTAL_HEIGHT) return null;
                          const colW = 100 / totalCols;
                          return (
                            <button
                              key={appt.id}
                              onClick={() => setDetailAppt(appt)}
                              className={cn(
                                "absolute rounded border-l-[3px] px-1.5 text-left text-xs overflow-hidden transition-all hover:brightness-95 hover:shadow-sm",
                                STATUS_BLOCK[appt.status]
                              )}
                              style={{
                                top: top + 1,
                                height: height - 2,
                                left: `calc(${col * colW}% + 2px)`,
                                width: `calc(${colW}% - 4px)`,
                                zIndex: 1,
                              }}
                            >
                              <p className="font-semibold leading-tight truncate">
                                {appt.start_time} · {appt.customer_name}
                              </p>
                              {height > 30 && <p className="truncate opacity-75">{appt.service_name}</p>}
                              {height > 46 && appt.staff_name && <p className="truncate opacity-60">{appt.staff_name}</p>}
                            </button>
                          );
                        }).filter(Boolean);
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MONTH VIEW ═══════════════ */}
      {view === "month" && (
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4">
          <div ref={monthContainerRef} className="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:items-start">
            <div className="rounded-xl border overflow-hidden flex-1 min-w-0 lg:sticky lg:top-0 lg:self-start">
              {/* Month nav */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  const y = calMonth === 0 ? calYear - 1 : calYear;
                  const m = calMonth === 0 ? 11 : calMonth - 1;
                  setSelectedDay(null);
                  router.push(buildUrl({ year: y, month: m }));
                }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{MONTH_NAMES[calMonth]} {calYear}</span>
                <Button variant="ghost" size="icon" onClick={() => {
                  const y = calMonth === 11 ? calYear + 1 : calYear;
                  const m = calMonth === 11 ? 0 : calMonth + 1;
                  setSelectedDay(null);
                  router.push(buildUrl({ year: y, month: m }));
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Day name headers */}
              <div className="grid grid-cols-7 border-b">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{d.slice(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="border-b border-r last:border-r-0 min-h-[44px] sm:min-h-[80px]" />;
                  const dateKey = padDate(calYear, calMonth, day);
                  const dayApps = calendarMap[dateKey] ?? [];
                  const isToday = dateKey === todayKey;
                  const isSelected = selectedDay === day;
                  const MAX_VISIBLE = 3;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                      className={cn(
                        "relative flex flex-col border-b border-r last:border-r-0 min-h-[44px] sm:min-h-[80px] p-1 text-left transition-colors hover:bg-muted/40",
                        isSelected && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                      )}
                    >
                      <span className={cn(
                        "mb-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center self-end rounded-full text-xs font-semibold",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {day}
                      </span>
                      {/* Desktop: text mini-blocks */}
                      <div className="hidden sm:flex flex-col w-full">
                        {dayApps.slice(0, MAX_VISIBLE).map((a) => (
                          <span
                            key={a.id}
                            className={cn(
                              "mb-0.5 truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight border-l-2",
                              STATUS_BLOCK[a.status]
                            )}
                          >
                            {a.start_time} {a.customer_name}
                          </span>
                        ))}
                        {dayApps.length > MAX_VISIBLE && (
                          <span className="text-[10px] text-muted-foreground pl-1">+{dayApps.length - MAX_VISIBLE} daha</span>
                        )}
                      </div>
                      {/* Mobile: colored dots */}
                      {dayApps.length > 0 && (
                        <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                          {dayApps.slice(0, 4).map((a) => (
                            <span key={a.id} className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              a.status === "pending" ? "bg-amber-400" :
                                a.status === "approved" ? "bg-green-500" :
                                  a.status === "rejected" ? "bg-red-400" : "bg-muted-foreground"
                            )} />
                          ))}
                          {dayApps.length > 4 && <span className="text-[8px] text-muted-foreground">+{dayApps.length - 4}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resizable divider — only on lg+ */}
            <div
              onMouseDown={handleDividerMouseDown}
              className="hidden lg:flex w-3 shrink-0 cursor-col-resize items-center justify-center group self-stretch"
            >
              <div className="h-12 w-0.5 rounded-full bg-border transition-colors group-hover:bg-primary/50 group-active:bg-primary" />
            </div>

            {/* Day detail panel */}
            <div
              className="rounded-xl border p-4 overflow-y-auto shrink-0"
              style={{ width: rightPanelWidth, maxWidth: "100%" }}
            >
              {!selectedDay ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Bir gün seçin</p>
                </div>
              ) : (
                <>
                  <p className="mb-3 font-semibold">
                    {selectedDay} {MONTH_NAMES[calMonth]} — {selectedDayAppts.length} randevu
                  </p>
                  {selectedDayAppts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Bu gün randevu yok.</p>
                  ) : (
                    <div className="space-y-2">
                      {[...selectedDayAppts]
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((a) => (
                          <ApptCard
                            key={a.id}
                            appt={resolveCheckedIn(a)}
                            todayKey={todayKey}
                            deletingId={deletingId}
                            onOpen={openAction}
                            onDelete={deleteAppointment}
                            onCheckIn={setCheckIn}
                            businessSlug={businessSlug}
                          />
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREATE APPOINTMENT DIALOG ═══════════════ */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); if (cResult) router.refresh(); } }}>
        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {createStep === 4 ? "Randevu Oluşturuldu" : "Randevu Oluştur"}
            </DialogTitle>
            {createStep < 4 && (
              <DialogDescription>Adım {createStep} / 3</DialogDescription>
            )}
          </DialogHeader>

          {/* Step 1: Customer info */}
          {createStep === 1 && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Telefon Numarası *</Label>
                <PhoneInput
                  value={cPhone}
                  onValueChange={(raw) => { setCPhone(raw); setCPhoneTouched(true); }}
                  onBlur={() => setCPhoneTouched(true)}
                  autoComplete="tel"
                  className={cn(
                    cPhoneTouched && cPhone.length > 0 && !validatePhone(cPhone) && "border-destructive focus-visible:ring-destructive/20",
                    validatePhone(cPhone) && "border-green-500 focus-visible:ring-green-500/20"
                  )}
                />
                {cPhoneTouched && cPhone.length > 0 && !validatePhone(cPhone) ? (
                  <p className="text-xs text-destructive">Format: 0 (5XX) XXX XXXX</p>
                ) : validatePhone(cPhone) ? (
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Geçerli
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label>Ad Soyad *</Label>
                <Input
                  placeholder="Müşteri adı"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Service + Staff */}
          {createStep === 2 && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Hizmet *</Label>
                <select
                  value={cServiceId}
                  onChange={(e) => setCServiceId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Hizmet seçin</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.duration_minutes ? ` (${s.duration_minutes} dk)` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {staff.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Personel</Label>
                  <select
                    value={cStaffId}
                    onChange={(e) => setCStaffId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Fark etmez (otomatik)</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date + Time */}
          {createStep === 3 && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={cDate}
                  onChange={(e) => setCDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Saat *</Label>
                {cSlotsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saatler yükleniyor...
                  </div>
                ) : !cDate || !cServiceId ? (
                  <p className="text-sm text-muted-foreground py-2">Önce tarih seçin</p>
                ) : cSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Bu tarihte müsait saat yok</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                    {cSlots.map((slot) => (
                      <button
                        key={slot.start}
                        disabled={!slot.available}
                        onClick={() => setCTime(slot.start)}
                        className={cn(
                          "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                          !slot.available && "opacity-40 cursor-not-allowed bg-muted text-muted-foreground",
                          slot.available && cTime === slot.start && "bg-primary text-primary-foreground border-primary",
                          slot.available && cTime !== slot.start && "hover:bg-muted"
                        )}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {createStep === 4 && cResult && (() => {
            const apptUrl = bizUrl(businessSlug, `/randevu/${cResult.booking_code}`, typeof window !== "undefined" ? window.location.origin : "");
            const serviceName = services.find((s) => s.id === cServiceId)?.name ?? "";
            const dateLabel = cDate ? new Date(cDate + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }) : "";
            const waText = `Merhaba ${cName}, ${serviceName} randevunuz oluşturuldu.\n📅 ${dateLabel} saat ${cTime}\nRandevu kodunuz: ${cResult.booking_code}\nDetaylar için: ${apptUrl}`;
            const waUrl = `https://wa.me/${toWaPhone(cPhone)}?text=${encodeURIComponent(waText)}`;
            return (
              <div className="w-full min-w-0 space-y-3 py-1">
                {/* Success badge */}
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-green-700 dark:text-green-300">Randevu oluşturuldu</p>
                    <p className="truncate text-xs text-green-600 dark:text-green-400">{serviceName} · {dateLabel} {cTime}</p>
                  </div>
                </div>

                {/* Booking code */}
                <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Randevu Kodu</p>
                    <p className="font-mono font-bold tracking-widest">{cResult.booking_code}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 w-7 shrink-0 p-0"
                    onClick={() => { navigator.clipboard.writeText(cResult.booking_code); toast.success("Kopyalandı"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Link */}
                <div className="flex min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-3 py-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{apptUrl}</p>
                  <Button size="sm" variant="outline" className="h-7 w-7 shrink-0 p-0"
                    onClick={() => { navigator.clipboard.writeText(apptUrl); toast.success("Link kopyalandı"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 shrink-0 p-0"
                    onClick={() => window.open(apptUrl, "_blank")}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp ile Gönder
                </a>
              </div>
            );
          })()}

          <DialogFooter>
            {createStep < 4 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (createStep === 1) { setCreateOpen(false); }
                    else setCreateStep((s) => s - 1);
                  }}
                >
                  {createStep === 1 ? "İptal" : "Geri"}
                </Button>
                {createStep < 3 && (
                  <Button
                    disabled={
                      (createStep === 1 && (!validatePhone(cPhone) || !cName.trim())) ||
                      (createStep === 2 && !cServiceId)
                    }
                    onClick={() => setCreateStep((s) => s + 1)}
                  >
                    İleri
                  </Button>
                )}
                {createStep === 3 && (
                  <Button
                    disabled={!cDate || !cTime || cCreating}
                    onClick={submitCreate}
                  >
                    {cCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Oluştur
                  </Button>
                )}
              </>
            )}
            {createStep === 4 && (
              <Button onClick={() => { resetCreate(); setCreateOpen(false); }}>
                Kapat
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ GROUP POPUP ═══════════════ */}
      <Dialog open={!!groupPopup} onOpenChange={(o) => { if (!o) setGroupPopup(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {groupPopup?.[0]?.start_time} · {groupPopup?.length} Randevu
            </DialogTitle>
            <DialogDescription>
              Aynı saatte birden fazla randevu var.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto py-1">
            {(groupPopup ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time)).map((a) => (
              <ApptCard
                key={a.id}
                appt={resolveCheckedIn(appointments.find(x => x.id === a.id) ?? a)}
                todayKey={todayKey}
                deletingId={deletingId}
                onOpen={openAction}
                onDelete={deleteAppointment}
                onCheckIn={setCheckIn}
                onClose={() => setGroupPopup(null)}
                businessSlug={businessSlug}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ WEEK DETAIL DIALOG ═══════════════ */}
      <Dialog open={!!detailAppt} onOpenChange={(o) => { if (!o) setDetailAppt(null); }}>
        <DialogContent className="max-w-sm">
          {detailAppt && (() => {
            const freshDetailAppt = appointments.find(a => a.id === detailAppt.id) ?? detailAppt;
            const detailResolved = resolveCheckedIn(freshDetailAppt);
            const s = STATUS_META[detailAppt.status];
            const Icon = s.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Badge variant={s.variant} className="gap-1">
                      <Icon className="h-3 w-3" />{s.label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="space-y-1 pt-1 text-sm">
                    <span className="block font-semibold text-foreground">{detailAppt.customer_name}</span>
                    <span className="block">{detailAppt.customer_phone}</span>
                    <span className="block">{detailAppt.service_name}{detailAppt.staff_name ? ` · ${detailAppt.staff_name}` : ""}</span>
                    <span className="block">{formatDateDisplay(detailAppt.appointment_date)} · {detailAppt.start_time}–{detailAppt.end_time}</span>
                    <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      {detailAppt.booking_code}
                      <WaButton appt={detailAppt} size="xs" businessSlug={businessSlug} />
                    </span>
                    {detailAppt.status === "rejected" && detailAppt.reject_reason && (
                      <span className="block rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{detailAppt.reject_reason}</span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                {(detailAppt.status === "pending" || detailAppt.status === "approved") && isFuture(detailAppt.appointment_date, detailAppt.start_time, todayKey) && (
                  <DialogFooter className="gap-2">
                    {detailAppt.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openAction(detailAppt, "reject")}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                        </Button>
                        <Button size="sm" onClick={() => openAction(detailAppt, "approve")}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Onayla
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openAction(detailAppt, "cancel")}>
                      <Ban className="mr-1 h-3.5 w-3.5" /> İptal Et
                    </Button>
                  </DialogFooter>
                )}
                {detailAppt.status === "approved" && !isFuture(detailAppt.appointment_date, detailAppt.start_time, todayKey) && (
                  <DialogFooter className="justify-start gap-2">
                    <span className="text-xs text-muted-foreground self-center">Geldi mi?</span>
                    <Button
                      size="sm"
                      variant={detailResolved.checked_in === true ? "default" : "outline"}
                      className={detailResolved.checked_in === true ? "bg-green-500 hover:bg-green-600 border-green-500" : "border-green-400 text-green-700"}
                      onClick={() => setCheckIn(detailAppt.id, detailResolved.checked_in === true ? null : true)}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Geldi
                    </Button>
                    <Button
                      size="sm"
                      variant={detailResolved.checked_in === false ? "default" : "outline"}
                      className={detailResolved.checked_in === false ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-red-400 text-red-700"}
                      onClick={() => setCheckIn(detailAppt.id, detailResolved.checked_in === false ? null : false)}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Gelmedi
                    </Button>
                  </DialogFooter>
                )}
                {detailAppt.status === "cancel_requested" && (
                  <DialogFooter className="gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAction(detailAppt, "deny_cancel")}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Reddet
                    </Button>
                    <Button size="sm" onClick={() => openAction(detailAppt, "approve_cancel")}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> İptali Onayla
                    </Button>
                  </DialogFooter>
                )}
                {detailAppt.status === "cancelled" && (
                  <DialogFooter>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === detailAppt.id}
                      onClick={() => { setDetailAppt(null); deleteAppointment(detailAppt.id); }}
                    >
                      {deletingId === detailAppt.id
                        ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="mr-1 h-3.5 w-3.5" />}
                      Sil
                    </Button>
                  </DialogFooter>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══════════════ APPROVE / REJECT DIALOG ═══════════════ */}
      <Dialog open={!!actionTarget} onOpenChange={(o) => { if (!o) { setActionTarget(null); setActionType(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"        ? "Randevuyu Onayla" :
               actionType === "reject"         ? "Randevuyu Reddet" :
               actionType === "approve_cancel" ? "İptal Talebini Onayla" :
               actionType === "deny_cancel"    ? "İptal Talebini Reddet" :
                                                 "Randevuyu İptal Et"}
            </DialogTitle>
            {actionTarget && (
              <DialogDescription>
                <strong>{actionTarget.customer_name}</strong> — {actionTarget.service_name}
                <br />
                {formatDateDisplay(actionTarget.appointment_date)} · {actionTarget.start_time}
              </DialogDescription>
            )}
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-1.5 py-2">
              <Label>Red Sebebi (opsiyonel)</Label>
              <Textarea
                placeholder="Müşteriye gösterilecek red sebebi..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          {actionType === "approve" && (
            <p className="py-2 text-sm text-muted-foreground">
              Bu randevuyu onayladığınızda aynı saat dilimi başka randevular için dolu hale gelecektir.
            </p>
          )}
          {actionType === "cancel" && (
            <p className="py-2 text-sm text-muted-foreground">
              Bu randevu iptal edilecek. Bu işlem geri alınamaz.
            </p>
          )}
          {actionType === "approve_cancel" && (
            <p className="py-2 text-sm text-muted-foreground">
              Müşterinin iptal talebini onaylıyorsunuz. Randevu iptal edilecek.
            </p>
          )}
          {actionType === "deny_cancel" && (
            <p className="py-2 text-sm text-muted-foreground">
              İptal talebi reddedilecek ve randevu onaylı durumuna dönecek.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionType(null); }}>
              Vazgeç
            </Button>
            <Button
              variant={actionType === "approve" || actionType === "deny_cancel" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={actioning}
            >
              {actioning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve"        ? "Onayla" :
               actionType === "reject"         ? "Reddet" :
               actionType === "approve_cancel" ? "İptali Onayla" :
               actionType === "deny_cancel"    ? "Talebi Reddet" :
                                                 "İptal Et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

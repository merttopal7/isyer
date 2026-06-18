"use client";

import { useState } from "react";
import { Megaphone, CalendarPlus, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookingFlow } from "./booking-flow";
import type { Business, Service, StaffOrResource, Announcement, CustomerJwtPayload } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  business: Business;
  services: Service[];
  staff: StaffOrResource[];
  announcements: Announcement[];
  initialCustomer: CustomerJwtPayload | null;
  initialTab: "duyurular" | "randevu";
}

export function BusinessTabs({ business, services, staff, announcements, initialCustomer, initialTab }: Props) {
  const [tab, setTab] = useState<"duyurular" | "randevu">(initialTab);

  return (
    <>
      {/* Tab bar */}
      <div className="mb-8 flex gap-1 rounded-xl border bg-muted/40 p-1">
        <TabButton active={tab === "duyurular"} onClick={() => setTab("duyurular")}>
          <Megaphone className="h-4 w-4" />
          Duyurular
          {announcements.length > 0 && (
            <span className={cn(
              "ml-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
              tab === "duyurular" ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
            )}>
              {announcements.length}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "randevu"} onClick={() => setTab("randevu")}>
          <CalendarPlus className="h-4 w-4" />
          Randevu Al
        </TabButton>
      </div>

      {tab === "duyurular" && (
        <AnnouncementList announcements={announcements} onBooking={() => setTab("randevu")} />
      )}
      {tab === "randevu" && (
        <BookingFlow
          business={business}
          services={services}
          staff={staff}
          initialCustomer={initialCustomer}
        />
      )}
    </>
  );
}

function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function AnnouncementList({
  announcements,
  onBooking,
}: {
  announcements: Announcement[];
  onBooking: () => void;
}) {
  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">Henüz duyuru yok</p>
        <button
          type="button"
          onClick={onBooking}
          className="mt-4 text-sm text-primary underline-offset-2 hover:underline"
        >
          Randevu almak için tıklayın →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann) => (
        <AnnouncementCard key={ann.id} ann={ann} />
      ))}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onBooking}
          className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
        >
          <CalendarPlus className="h-4 w-4" />
          Randevu almak için tıklayın
        </button>
      </div>
    </div>
  );
}

function AnnouncementCard({ ann }: { ann: Announcement }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = ann.content.length > 280;
  const displayContent = isLong && !expanded ? ann.content.slice(0, 280) + "…" : ann.content;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <article className={cn(
      "rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
      ann.is_pinned && "border-amber-300/60 bg-amber-50/30 dark:bg-amber-950/10"
    )}>
      <div className="mb-3 flex items-start gap-2">
        {ann.is_pinned && (
          <Pin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-snug">{ann.title}</h3>
            {ann.is_pinned && (
              <Badge variant="outline" className="border-amber-400 text-xs text-amber-600">Sabitli</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(ann.created_at)}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
        {displayContent}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}
    </article>
  );
}

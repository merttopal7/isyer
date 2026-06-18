import Link from "next/link";
import { getBusinessBySlug } from "@/lib/get-business";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { CalendarDays, CalendarPlus, Megaphone, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";
import { bizPath } from "@/lib/url";

export default async function DuyurularPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const announcements = await db<Announcement>("announcements")
    .where({ business_id: business.id, is_published: true })
    .orderByRaw("is_pinned DESC, created_at DESC");

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">Henüz duyuru yok</p>
        <Link
          href={bizPath(slug, "/randevu")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <CalendarPlus className="h-5 w-5" />
          Randevu Al
        </Link>
      </div>
    );
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann) => (
        <AnnouncementCard key={ann.id} ann={ann} formatDate={formatDate} />
      ))}
      <div className="pt-4 text-center">
        <Link
          href={bizPath(slug, "/randevu")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <CalendarPlus className="h-5 w-5" />
          Randevu Al
        </Link>
      </div>
    </div>
  );
}

function AnnouncementCard({
  ann,
  formatDate,
}: {
  ann: Announcement;
  formatDate: (d: string) => string;
}) {
  const pinned = Boolean(ann.is_pinned);

  return (
    <article className={cn(
      "relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
      pinned
        ? "border-amber-300/70 dark:border-amber-700/50"
        : "border-border"
    )}>
      {/* Pinned accent bar */}
      {pinned && (
        <div className="absolute inset-y-0 left-0 w-1 bg-amber-400 dark:bg-amber-500" />
      )}

      <div className={cn("flex gap-4 p-5", pinned && "pl-6")}>
        {/* Icon badge */}
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          pinned
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            : "bg-primary/10 text-primary"
        )}>
          {pinned
            ? <Pin className="h-5 w-5" />
            : <Megaphone className="h-5 w-5" />
          }
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold leading-snug">{ann.title}</h2>
            {pinned && (
              <Badge className="h-5 border-amber-400 bg-amber-100 px-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <Pin className="mr-1 h-2.5 w-2.5" />
                Sabitli
              </Badge>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
            {ann.content}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDate(ann.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

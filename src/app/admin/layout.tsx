import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LayoutDashboard } from "lucide-react";
import type { Business, Appointment, Announcement } from "@/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let businessName: string | undefined;
  let phone: string | null = null;
  let pendingCount: number = 0;
  let announcementCount: number = 0;
  let features = { bookingEnabled: true, announcementsEnabled: true, menuEnabled: true };

  if (session.businessId) {
    const biz = await db<Business>("businesses").where({ id: session.businessId }).first();
    businessName = biz?.name;
    phone = biz?.phone ?? null;
    features = {
      bookingEnabled:       !!(biz?.booking_enabled       ?? true),
      announcementsEnabled: !!(biz?.announcements_enabled ?? true),
      menuEnabled:          !!(biz?.menu_enabled          ?? true),
    };

    const [pending, announcements] = await Promise.all([
      db<Appointment>("appointments")
        .where({ business_id: session.businessId, status: "pending" })
        .count("id as count")
        .first(),
      db<Announcement>("announcements")
        .where({ business_id: session.businessId, is_published: true })
        .count("id as count")
        .first(),
    ]);
    pendingCount     = Number((pending     as { count: number } | undefined)?.count ?? 0);
    announcementCount = Number((announcements as { count: number } | undefined)?.count ?? 0);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:shrink-0">
        <AdminSidebar
          session={session}
          businessName={businessName}
          phone={phone}
          pendingCount={pendingCount}
          announcementCount={announcementCount}
          features={features}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
          <MobileNav session={session} businessName={businessName} phone={phone} pendingCount={pendingCount} announcementCount={announcementCount} features={features} />
          <div className="flex items-center gap-1.5 font-semibold">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span className="text-sm">Admin Panel</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

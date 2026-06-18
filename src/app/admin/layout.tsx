import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LayoutDashboard } from "lucide-react";
import type { Business } from "@/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let businessName: string | undefined;
  if (session.businessId) {
    const biz = await db<Business>("businesses").where({ id: session.businessId }).first();
    businessName = biz?.name;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:shrink-0">
        <AdminSidebar session={session} businessName={businessName} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
          <MobileNav session={session} businessName={businessName} />
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

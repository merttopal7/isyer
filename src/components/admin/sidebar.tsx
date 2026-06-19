"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Calendar, Building2, Scissors, Users, Clock, LayoutDashboard, LogOut,
  ChevronRight, ChevronDown, Megaphone, Settings, ChevronsLeft, ChevronsRight,
  ClipboardList, QrCode, LayoutList, UtensilsCrossed, SlidersHorizontal, Phone,
} from "lucide-react";
import type { JwtPayload } from "@/types";
import { toast } from "sonner";

interface Features {
  bookingEnabled: boolean;
  announcementsEnabled: boolean;
  menuEnabled: boolean;
}

interface SidebarProps {
  session: JwtPayload;
  businessName?: string;
  phone?: string | null;
  pendingCount?: number;
  announcementCount?: number;
  features?: Features;
  onNavigate?: () => void;
  forceExpanded?: boolean;
}

export function AdminSidebar({
  session, businessName, phone, pendingCount, announcementCount, features, onNavigate, forceExpanded,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bId = session.businessId;
  const isPlatformAdmin = session.role === "platform_admin";

  const [_collapsed, setCollapsed] = useState(false);
  const collapsed = forceExpanded ? false : _collapsed;
  const [openGroups, setOpenGroups] = useState<string[]>(["Hizmetler & Personel", "QR Menü"]);

  useEffect(() => {
    if (forceExpanded) return;
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, [forceExpanded]);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Çıkış yapıldı.");
    router.push("/admin/login");
    router.refresh();
  }

  const initials = businessName
    ? businessName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "A";

  // ── Link renderer ────────────────────────────────────────────────
  function NavLink({
    href, label, icon: Icon, badge, indent = false,
  }: { href: string; label: string; icon: React.ElementType; badge?: number; indent?: boolean }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={cn(
          "group flex items-center gap-3 border-l-[3px] py-2 text-sm transition-colors",
          collapsed ? "justify-center px-3 border-transparent" : "pr-3",
          !collapsed && indent ? "pl-8" : !collapsed ? "pl-4" : "",
          active
            ? "border-primary bg-primary/10 text-primary font-semibold"
            : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground leading-none">
                {badge}
              </span>
            )}
          </>
        )}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </Link>
    );
  }

  // ── Group renderer ───────────────────────────────────────────────
  function NavGroup({
    label, icon: Icon,
    children,
  }: { label: string; icon: React.ElementType; children: { href: string; label: string; icon: React.ElementType }[] }) {
    const isOpen = openGroups.includes(label);
    const anyActive = children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

    if (collapsed) {
      return (
        <>
          {children.map((child) => (
            <NavLink key={child.href} href={child.href} label={child.label} icon={child.icon} />
          ))}
        </>
      );
    }

    return (
      <div>
        <button
          onClick={() => toggleGroup(label)}
          className={cn(
            "flex w-full items-center gap-3 border-l-[3px] py-2 pl-4 pr-3 text-sm transition-colors",
            anyActive
              ? "border-primary/40 text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">{label}</span>
          {isOpen
            ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
        </button>
        {isOpen && (
          <div className="py-0.5">
            {children.map((child) => (
              <NavLink key={child.href} href={child.href} label={child.label} icon={child.icon} indent />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Section label ────────────────────────────────────────────────
  function SectionLabel({ label }: { label: string }) {
    if (collapsed) return <div className="my-1 mx-3 border-t border-border/50" />;
    return (
      <p className="mb-1 mt-4 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-[width] duration-200",
        forceExpanded ? "w-full" : collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-14 shrink-0 items-center border-b",
        collapsed ? "justify-center px-2" : "px-4 gap-2"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="flex-1 truncate text-sm font-bold">Admin Panel</span>
        )}
        {!forceExpanded && (
          <button
            onClick={toggle}
            title={collapsed ? "Genişlet" : "Daralt"}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {collapsed
              ? <ChevronsRight className="h-4 w-4" />
              : <ChevronsLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Business card */}
      {bId && (
        collapsed ? (
          <div className="flex justify-center border-b py-3">
            <div
              title={businessName}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
            >
              {initials}
            </div>
          </div>
        ) : (
          <div className="m-3 rounded-xl border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  İşletme
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{businessName}</p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        )
      )}

      {isPlatformAdmin && !collapsed && (
        <div className="m-3 rounded-xl border bg-muted/30 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Rol</p>
          <p className="text-sm font-semibold text-foreground">Platform Admin</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {isPlatformAdmin ? (
          <>
            <NavLink href="/admin/isletmeler" label="İşletmeler" icon={Building2} />
            <NavLink href="/admin/basvurular" label="Başvurular" icon={ClipboardList} />
          </>
        ) : bId ? (
          <>
            <SectionLabel label="Genel" />
            {(features?.bookingEnabled ?? true) && (
              <NavLink href={`/admin/${bId}/randevular`} label="Randevular" icon={Calendar} badge={pendingCount} />
            )}
            {(features?.announcementsEnabled ?? true) && (
              <NavLink href={`/admin/${bId}/duyurular`} label="Duyurular" icon={Megaphone} badge={announcementCount} />
            )}
            {(features?.menuEnabled ?? true) && (
              <NavGroup
                label="QR Menü"
                icon={QrCode}
                children={[
                  { href: `/admin/${bId}/qr-menu/kategoriler`, label: "Kategoriler", icon: LayoutList },
                  { href: `/admin/${bId}/qr-menu/urunler`,     label: "Ürünler",     icon: UtensilsCrossed },
                ]}
              />
            )}
            <NavLink href={`/admin/${bId}/musaitlik`} label="Müsaitlik" icon={Clock} />

            <SectionLabel label="Yönetim" />
            <NavGroup
              label="Hizmetler & Personel"
              icon={Scissors}
              children={[
                { href: `/admin/${bId}/hizmetler`, label: "Hizmetler", icon: Scissors },
                { href: `/admin/${bId}/personel`,  label: "Personel",  icon: Users },
              ]}
            />
            <NavLink href={`/admin/${bId}/qr-menu/qr-kodu`} label="QR Kodu" icon={QrCode} />
            <NavLink href={`/admin/${bId}/ozellestir`} label="Özelleştir" icon={SlidersHorizontal} />
            <NavLink href={`/admin/${bId}/ayarlar`}    label="Ayarlar"    icon={Settings} />
          </>
        ) : null}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t">
        {!collapsed && (phone || session.email) && (
          <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{phone ?? session.email}</span>
          </div>
        )}
        <div className={cn(
          "flex items-center px-3 py-2.5",
          collapsed ? "flex-col gap-2" : "gap-2"
        )}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Çıkış Yap" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "w-full justify-center" : "flex-1"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Çıkış Yap</span>}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

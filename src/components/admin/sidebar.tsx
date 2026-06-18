"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Calendar, Building2, Scissors, Users, Clock, LayoutDashboard, LogOut,
  ChevronRight, ChevronDown, Megaphone, Settings, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { JwtPayload } from "@/types";
import { toast } from "sonner";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  children: NavLink[];
}

type NavItem = NavLink | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

interface SidebarProps {
  session: JwtPayload;
  businessName?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ session, businessName, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bId = session.businessId;
  const isPlatformAdmin = session.role === "platform_admin";

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["Hizmetler & Personel"]);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

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

  const links: NavItem[] = isPlatformAdmin
    ? [{ href: "/admin/isletmeler", label: "İşletmeler", icon: Building2 }]
    : bId
    ? [
        { href: `/admin/${bId}/randevular`, label: "Randevular", icon: Calendar },
        { href: `/admin/${bId}/duyurular`,  label: "Duyurular",  icon: Megaphone },
        {
          label: "Hizmetler & Personel",
          icon: Scissors,
          children: [
            { href: `/admin/${bId}/hizmetler`, label: "Hizmetler", icon: Scissors },
            { href: `/admin/${bId}/personel`,  label: "Personel",  icon: Users },
          ],
        },
        { href: `/admin/${bId}/musaitlik`, label: "Müsaitlik", icon: Clock },
        { href: `/admin/${bId}/ayarlar`,   label: "Ayarlar",   icon: Settings },
      ]
    : [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Çıkış yapıldı.");
    router.push("/admin/login");
    router.refresh();
  }

  function renderLink(link: NavLink, indent = false) {
    const active = pathname.startsWith(link.href);
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        title={collapsed ? link.label : undefined}
        className={cn(
          "flex items-center rounded-md py-2 text-sm transition-colors",
          collapsed ? "justify-center px-2" : "gap-2 px-3",
          indent && !collapsed && "pl-7",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{link.label}</span>
            {active && <ChevronRight className="ml-auto h-3 w-3 shrink-0" />}
          </>
        )}
      </Link>
    );
  }

  function renderGroup(group: NavGroup) {
    const Icon = group.icon;
    const isOpen = openGroups.includes(group.label);
    const anyChildActive = group.children.some((c) => pathname.startsWith(c.href));

    if (collapsed) {
      // In collapsed mode: show each child icon directly (no group header)
      return group.children.map((child) => renderLink(child, false));
    }

    return (
      <div key={group.label}>
        <button
          onClick={() => toggleGroup(group.label)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            anyChildActive
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{group.label}</span>
          {isOpen
            ? <ChevronDown className="ml-auto h-3 w-3 shrink-0" />
            : <ChevronRight className="ml-auto h-3 w-3 shrink-0" />}
        </button>
        {isOpen && (
          <div className="mt-0.5 space-y-0.5">
            {group.children.map((child) => renderLink(child, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-muted/30 transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center border-b px-3">
        <LayoutDashboard className="h-5 w-5 shrink-0 text-primary" />
        {!collapsed && (
          <span className="ml-2 truncate text-sm font-semibold">Admin Panel</span>
        )}
        <button
          onClick={toggle}
          title={collapsed ? "Genişlet" : "Daralt"}
          className={cn(
            "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed
            ? <ChevronsRight className="h-4 w-4" />
            : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Business / role info */}
      {collapsed ? (
        (businessName || isPlatformAdmin) && (
          <div className="flex justify-center border-b py-3">
            <span title={businessName ?? "Platform Admin"}>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        )
      ) : (
        <>
          {businessName && (
            <div className="border-b px-4 py-3">
              <p className="text-xs text-muted-foreground">İşletme</p>
              <p className="truncate text-sm font-medium">{businessName}</p>
            </div>
          )}
          {isPlatformAdmin && (
            <div className="border-b px-4 py-3">
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-sm font-medium">Platform Admin</p>
            </div>
          )}
        </>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-hidden px-2 py-3">
        {links.map((item, i) =>
          isGroup(item)
            ? <div key={item.label}>{renderGroup(item)}</div>
            : renderLink(item)
        )}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t p-3">
        {!collapsed && (
          <p className="mb-2 truncate px-1 text-xs text-muted-foreground">{session.email}</p>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col gap-2")}>
          <Button
            variant="ghost"
            size="sm"
            title={collapsed ? "Çıkış Yap" : undefined}
            className={cn(
              "text-muted-foreground",
              collapsed ? "w-full justify-center px-0" : "flex-1 justify-start gap-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Çıkış Yap"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

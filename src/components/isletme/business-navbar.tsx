"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Calendar, CalendarPlus, Megaphone, MapPin,
  User, LogOut, ChevronDown, Building2, LayoutDashboard, Loader2,
} from "lucide-react";
import type { CustomerJwtPayload } from "@/types";
import { bizPath } from "@/lib/url";

interface Props {
  slug: string;
  businessName: string;
  hasMap: boolean;
  logoUrl?: string | null;
}

export function BusinessNavbar({ slug, businessName, hasMap, logoUrl }: Props) {
  const pathname = usePathname();

  const [customer, setCustomer] = useState<CustomerJwtPayload | null | undefined>(undefined);

  const tabs = [
    { href: bizPath(slug, "/duyurular"),   label: "Duyurular",    icon: Megaphone    },
    { href: bizPath(slug, "/randevu"),     label: "Randevu Al",   icon: CalendarPlus },
    ...(customer ? [{ href: bizPath(slug, "/randevularim"), label: "Randevularım", icon: Calendar }] : []),
    ...(hasMap ? [{ href: bizPath(slug, "/konum"), label: "Konum", icon: MapPin }] : []),
  ];

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((d) => setCustomer(d))
      .catch(() => setCustomer(null));

    const handler = (e: Event) =>
      setCustomer((e as CustomEvent<CustomerJwtPayload>).detail);
    window.addEventListener("customer-auth-changed", handler);
    return () => window.removeEventListener("customer-auth-changed", handler);
  }, []);

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" });
    window.location.href = bizPath(slug, "/duyurular");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      {/* Top bar: logo, business name, customer menu */}
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4">
        {/* Left: home + business crumb */}
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Link
            href={bizPath(slug, "/duyurular")}
            className="group flex min-w-0 items-center gap-2.5 font-bold tracking-tight text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="h-full w-full object-cover shrink-0"
                />
              ) : (
                <Building2 className="h-5 w-5 shrink-0" />
              )}
            </div>
            <span className="min-w-0 truncate font-semibold text-base">{businessName}</span>
          </Link>
        </div>

        {/* Right: customer menu + theme */}
        <nav className="flex shrink-0 items-center gap-3">
          {customer === undefined ? null : customer ? (
            <CustomerMenu customer={customer} onLogout={handleLogout} slug={slug} />
          ) : (
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1.5" asChild>
              <Link href={`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(pathname)}`}>
                <User className="h-4 w-4" />
                <span>Giriş Yap</span>
              </Link>
            </Button>
          )}
          
          <div className="h-4 w-[1px] bg-border" />
          <ThemeToggle />
        </nav>
      </div>

      {/* Tab bar */}
      <div className="border-t border-border/60 bg-background/50">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex overflow-x-auto scrollbar-none gap-2 py-1">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all relative border-b-2 sm:gap-2 sm:px-4 sm:text-sm",
                    active
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

function CustomerMenu({ customer, onLogout, slug }: { customer: CustomerJwtPayload; onLogout: () => void; slug: string }) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function handleSwitchToAdmin() {
    setSwitching(true);
    try {
      const res = await fetch("/api/customer/switch-to-admin", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
          ?? `https://www.${process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "isyer.com"}`;
        window.location.href = `${appUrl}/admin/${data.businessId}/randevular`;
      }
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 rounded-xl hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 border border-transparent hover:border-indigo-500/10"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-xs">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-[80px] truncate text-sm sm:inline font-semibold">{customer.name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2.5">
              <p className="text-xs font-bold text-foreground">{customer.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{customer.phone}</p>
            </div>
            <div className="my-1.5 h-px bg-border/60" />
            <Link
              href="/hesabim"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <User className="h-4 w-4" /> Hesabım
            </Link>
            <Link
              href={bizPath(slug, "/randevularim")}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Calendar className="h-4 w-4" /> Randevularım
            </Link>
            {customer.businessId && (
              <button
                onClick={() => { setOpen(false); handleSwitchToAdmin(); }}
                disabled={switching}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-500/5 dark:text-indigo-400 transition-colors font-semibold"
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutDashboard className="h-4 w-4" />}
                Admin Panelim
              </button>
            )}
            <div className="my-1.5 h-px bg-border/60" />
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" /> Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}

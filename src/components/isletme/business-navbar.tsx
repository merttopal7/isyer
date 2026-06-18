"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Calendar, CalendarPlus, Megaphone, MapPin,
  User, LogOut, ChevronDown, Building2,
} from "lucide-react";
import type { CustomerJwtPayload } from "@/types";
import { bizPath } from "@/lib/url";

interface Props {
  slug: string;
  businessName: string;
  hasMap: boolean;
}

export function BusinessNavbar({ slug, businessName, hasMap }: Props) {
  const pathname = usePathname();
  const router = useRouter();

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
    setCustomer(null);
    router.push(bizPath(slug, "/duyurular"));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar: logo, business name, customer menu */}
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
        {/* Left: home + business crumb */}
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Link
            href={bizPath(slug, "/duyurular")}
            className="flex min-w-0 items-center gap-1.5 font-medium hover:text-primary truncate"
          >
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{businessName}</span>
          </Link>
        </div>

        {/* Right: customer menu + theme */}
        <nav className="flex shrink-0 items-center gap-1">
          {customer === undefined ? null : customer ? (
            <CustomerMenu customer={customer} onLogout={handleLogout} slug={slug} />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(pathname)}`}>
                <User className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </nav>
      </div>

      {/* Tab bar */}
      <div className="border-t">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex overflow-x-auto scrollbar-none">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
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

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} className="gap-1">
        <User className="h-4 w-4" />
        <span className="hidden max-w-[80px] truncate text-sm sm:inline">{customer.name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-md">
            <div className="px-3 py-2">
              <p className="text-xs font-medium">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href={bizPath(slug, "/randevularim")}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Calendar className="h-4 w-4" /> Randevularım
            </Link>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}

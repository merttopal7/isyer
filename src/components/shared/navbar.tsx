"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown, LayoutDashboard, Calendar } from "lucide-react";
import type { CustomerJwtPayload } from "@/types";

export function Navbar() {
  const [customer, setCustomer] = useState<CustomerJwtPayload | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((d) => setCustomer(d))
      .catch(() => setCustomer(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="İşyer" className="h-6 w-6" />
          <span>İşyer</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
            <Link href="/randevu-sorgula">Randevu Sorgula</Link>
          </Button>

          {customer === undefined ? null : customer ? (
            <CustomerMenu customer={customer} onLogout={handleLogout} />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/giris">
                <User className="mr-1 h-4 w-4" />
                Giriş Yap
              </Link>
            </Button>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function CustomerMenu({ customer, onLogout }: { customer: CustomerJwtPayload; onLogout: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function handleSwitchToAdmin() {
    setSwitching(true);
    try {
      const res = await fetch("/api/customer/switch-to-admin", { method: "POST" });
      const data = await res.json();
      if (res.ok) router.push(`/admin`);
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
        className="gap-1"
      >
        <User className="h-4 w-4" />
        <span className="hidden max-w-[100px] truncate text-sm sm:inline">{customer.name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border bg-popover p-1 shadow-md">
            <div className="px-3 py-2">
              <p className="text-xs font-medium">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href="/hesabim"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <User className="h-4 w-4" /> Hesabım
            </Link>
            <Link
              href="/randevularim"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Calendar className="h-4 w-4" /> Randevularım
            </Link>
            {customer.businessId && (
              <button
                onClick={() => { setOpen(false); handleSwitchToAdmin(); }}
                disabled={switching}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent text-primary"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Panelim
              </button>
            )}
            <div className="my-1 h-px bg-border" />
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

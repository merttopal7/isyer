"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown, LayoutDashboard, Calendar, Menu, X, ClipboardList } from "lucide-react";
import type { CustomerJwtPayload } from "@/types";

export function Navbar() {
  const [customer, setCustomer] = useState<CustomerJwtPayload | null | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-sm">
            <img src="/logo.svg" alt="İşyer" className="h-5.5 w-5.5 dark:invert" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            İşyer
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-5">
          <Link 
            href="/randevu-sorgula" 
            className="text-sm font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 mr-2"
          >
            <ClipboardList className="h-4 w-4" />
            Randevu Sorgula
          </Link>

          <div className="h-4 w-[1px] bg-border" />

          {customer === undefined ? null : customer ? (
            <CustomerMenu customer={customer} onLogout={handleLogout} />
          ) : (
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1.5" asChild>
              <Link href="/giris">
                <User className="h-4 w-4" />
                Giriş Yap
              </Link>
            </Button>
          )}

          <div className="h-4 w-[1px] bg-border" />
          <ThemeToggle />
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          
          {customer === undefined ? null : customer ? (
            <CustomerMenu customer={customer} onLogout={handleLogout} />
          ) : null}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl hover:bg-accent text-foreground"
          >
            {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full border-b border-border/80 bg-background/95 backdrop-blur-lg shadow-lg py-4 px-6 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-4">
            <Link 
              href="/randevu-sorgula"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-foreground py-2 border-b border-border/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              Randevu Sorgula
            </Link>
            
            {!customer && customer !== undefined && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/giris">
                  <User className="mr-2 h-4 w-4" />
                  Giriş Yap
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function CustomerMenu({ customer, onLogout }: { customer: CustomerJwtPayload; onLogout: () => void }) {
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
        <span className="hidden max-w-[100px] truncate text-sm sm:inline font-semibold">{customer.name}</span>
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
              href="/randevularim"
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
                <LayoutDashboard className="h-4 w-4" /> Admin Panelim
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

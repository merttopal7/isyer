"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode, CalendarCheck, PanelTop, Loader2, Home, Megaphone } from "lucide-react";
import type { Business } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  business: Business;
}

interface Feature {
  key: keyof Business;
  label: string;
  description: string;
  icon: React.ElementType;
}

const FEATURES: Feature[] = [
  {
    key: "navbar_enabled",
    label: "Navigasyon Çubuğu",
    description: "İşletme sayfasının üstündeki sekme çubuğunu gösterir. Devre dışıyken hiçbir sekme görünmez.",
    icon: PanelTop,
  },
  {
    key: "announcements_enabled",
    label: "Duyurular",
    description: "İşletme sayfasında Duyurular sekmesini gösterir. Devre dışıyken müşteriler duyuruları göremez.",
    icon: Megaphone,
  },
  {
    key: "booking_enabled",
    label: "Randevu Sistemi",
    description: "İşletme sayfasında Randevu Al sekmesini gösterir. Devre dışıyken müşteriler randevu alamaz.",
    icon: CalendarCheck,
  },
  {
    key: "menu_enabled",
    label: "QR Menü",
    description: "İşletme sayfasında Menü sekmesini ve menü içeriğini gösterir. Devre dışıyken müşteriler menüye erişemez.",
    icon: QrCode,
  },
];

export function OzellestirClient({ business }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Partial<Record<keyof Business, boolean>>>({
    navbar_enabled:        business.navbar_enabled        ?? true,
    announcements_enabled: business.announcements_enabled ?? true,
    booking_enabled:       business.booking_enabled       ?? true,
    menu_enabled:          business.menu_enabled          ?? true,
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [defaultTab, setDefaultTab] = useState<string>(business.default_tab ?? "duyurular");
  const [savingTab, setSavingTab] = useState(false);

  async function toggle(key: keyof Business, next: boolean) {
    setSaving(key as string);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Kaydedilemedi.");
        return;
      }
      setValues((v) => ({ ...v, [key]: next }));
      toast.success(next ? "Aktif edildi." : "Devre dışı bırakıldı.");
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  async function changeDefaultTab(tab: string) {
    setDefaultTab(tab);
    setSavingTab(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_tab: tab }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Kaydedilemedi.");
        return;
      }
      toast.success("Varsayılan sayfa güncellendi.");
    } finally {
      setSavingTab(false);
    }
  }

  const tabOptions = [
    { value: "duyurular",   label: "Duyurular",  requiresKey: "announcements_enabled" as keyof Business },
    { value: "kategoriler", label: "Menü",        requiresKey: "menu_enabled"          as keyof Business },
    { value: "randevu",     label: "Randevu Al",  requiresKey: "booking_enabled"       as keyof Business },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Özelleştir</h1>
        <p className="text-sm text-muted-foreground">
          İşletme sayfasında hangi özelliklerin görüneceğini yönetin.
        </p>
      </div>

      {/* Default tab selector */}
      <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Home className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Varsayılan Sayfa</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              İşletme sayfasına girildiğinde hangi sekme açılacağını belirler.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Select value={defaultTab} onValueChange={changeDefaultTab} disabled={savingTab}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tabOptions.map(({ value, label, requiresKey }) => {
                    const featureEnabled = !!(values[requiresKey] ?? true);
                    return (
                      <SelectItem key={value} value={value} disabled={!featureEnabled}>
                        {label}
                        {!featureEnabled && " (devre dışı)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {savingTab && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {FEATURES.map(({ key, label, description, icon: Icon }) => {
          const enabled = values[key] ?? false;
          const isSaving = saving === key;

          return (
            <div
              key={key as string}
              className={cn(
                "flex items-center gap-5 rounded-xl border bg-card p-5 shadow-sm transition-colors",
                !enabled && "bg-muted/30"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                enabled
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{label}</p>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    enabled
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {enabled ? "Aktif" : "Devre dışı"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>

              {isSaving ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => toggle(key, v)}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

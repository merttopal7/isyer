"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User, Phone, Building2, Clock, CheckCircle2, XCircle,
  ArrowRight, Loader2, LayoutDashboard, ExternalLink,
} from "lucide-react";
import type { BusinessApplication } from "@/types";

const CATEGORIES = [
  "berber", "kuaför", "güzellik merkezi", "tırnak stüdyosu",
  "masaj & spa", "klinik", "diş klinigi", "veteriner",
  "restoran", "kafe", "fotoğrafçı", "diğer",
];

interface Props {
  customer: { id: number; name: string; phone: string | null; businessId: number | null };
  application: BusinessApplication | null;
  business: { id: number; slug: string; name: string } | null;
}

export function HesabimClient({ customer, application: initApp, business }: Props) {
  const router = useRouter();
  const [app, setApp] = useState(initApp);
  const [submitting, setSubmitting] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_name: businessName, category, phone, address, description }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Başvuru gönderilemedi."); return; }
      setApp(data);
      toast.success("Başvurunuz alındı. İnceleme sonucunu bildirir, teşekkürler!");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSwitchToAdmin() {
    setSwitching(true);
    try {
      const res = await fetch("/api/customer/switch-to-admin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Hata oluştu."); return; }
      router.push(`/admin/${data.businessId}`);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profil kartı */}
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="mb-4 text-2xl font-bold">Hesabım</h1>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{customer.name}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>

        {/* Admin panele geç butonu — işletmesi onaylanmış müşteriler için */}
        {customer.businessId && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">İşletme Yöneticiniz Aktif</p>
                {business && <p className="text-xs text-muted-foreground truncate">{business.name}</p>}
              </div>
              <Button size="sm" onClick={handleSwitchToAdmin} disabled={switching} className="gap-1.5 shrink-0">
                {switching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                Admin Paneli
              </Button>
            </div>
            {business && (
              <a
                href={`/isletme/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                İşletme sayfasını görüntüle
              </a>
            )}
          </div>
        )}
      </div>

      {/* Başvuru durumu */}
      {app ? (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            İşletme Başvurusu
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">İşletme Adı</span>
              <span className="font-medium text-sm">{app.business_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kategori</span>
              <span className="font-medium text-sm capitalize">{app.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Durum</span>
              <StatusBadge status={app.status} />
            </div>

            {app.status === "pending" && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
                <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Başvurunuz inceleniyor. En kısa sürede bildirilecektir.
                </p>
              </div>
            )}

            {app.status === "approved" && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Başvurunuz onaylandı!</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    Yukarıdaki "Admin Paneli" butonundan işletmenizi yönetebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {app.status === "rejected" && (
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
                  <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Başvurunuz reddedildi.</p>
                    {app.reject_reason && (
                      <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{app.reject_reason}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setApp(null)}>
                  Tekrar Başvur
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Başvuru formu */
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-1 text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            İşletme Başvurusu
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            İşletmenizi platforma eklemek için başvurun. Onay sonrasında admin panelinize erişebilirsiniz.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bname">İşletme Adı <span className="text-destructive">*</span></Label>
              <Input
                id="bname"
                placeholder="Ali Berber"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat">Kategori <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")} required>
                <SelectTrigger id="cat">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bphone">Telefon</Label>
                <Input
                  id="bphone"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="baddr">Adres</Label>
                <Input
                  id="baddr"
                  placeholder="Mahalle, sokak..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bdesc">Açıklama</Label>
              <Textarea
                id="bdesc"
                placeholder="İşletmenizi kısaca tanıtın..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submitting || !businessName.trim() || !category} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Başvur
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">İnceleniyor</Badge>;
  if (status === "approved") return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30">Onaylandı</Badge>;
  return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30">Reddedildi</Badge>;
}

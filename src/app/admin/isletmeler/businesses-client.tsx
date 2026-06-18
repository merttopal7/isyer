"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ToggleLeft, ToggleRight, Loader2, UserPlus } from "lucide-react";
import type { Business, BusinessStatus } from "@/types";

const CATEGORIES = ["berber", "hastane", "restoran", "güzellik", "spor", "diğer"];

const STATUS_LABELS: Record<BusinessStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Aktif", variant: "default" },
  pending: { label: "Beklemede", variant: "secondary" },
  inactive: { label: "Pasif", variant: "destructive" },
};

interface Props {
  initialBusinesses: Business[];
}

const emptyForm = { name: "", slug: "", category: "berber", description: "", phone: "", address: "" };

export function BusinessesClient({ initialBusinesses }: Props) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Add admin user dialog
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTarget, setAdminTarget] = useState<Business | null>(null);
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminSaving, setAdminSaving] = useState(false);

  async function handleAddAdmin() {
    if (!adminTarget || !adminForm.email || !adminForm.password) {
      toast.error("E-posta ve şifre zorunludur."); return;
    }
    setAdminSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminForm.email, password: adminForm.password, business_id: adminTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`${adminTarget.name} için admin kullanıcı oluşturuldu.`);
      setAdminOpen(false);
      setAdminForm({ email: "", password: "" });
    } finally { setAdminSaving(false); }
  }

  function handleNameChange(name: string) {
    const slug = name.toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    setForm((f) => ({ ...f, name, slug }));
  }

  async function handleCreate() {
    if (!form.name || !form.slug || !form.category) {
      toast.error("Ad, slug ve kategori zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setBusinesses((prev) => [data, ...prev]);
      setOpen(false);
      setForm(emptyForm);
      toast.success("İşletme eklendi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(b: Business) {
    const next: BusinessStatus = b.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/businesses/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setBusinesses((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: next } : x)));
      toast.success(`İşletme ${next === "active" ? "aktifleştirildi" : "pasifleştirildi"}.`);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İşletmeler</h1>
          <p className="text-sm text-muted-foreground">{businesses.length} işletme kayıtlı</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          İşletme Ekle
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Henüz işletme yok.
                </TableCell>
              </TableRow>
            )}
            {businesses.map((b) => {
              const s = STATUS_LABELS[b.status];
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                  <TableCell className="capitalize">{b.category}</TableCell>
                  <TableCell>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(b.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Admin Kullanıcı Ekle"
                        onClick={() => { setAdminTarget(b); setAdminOpen(true); }}
                      >
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(b)}
                        title={b.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                      >
                        {b.status === "active"
                          ? <ToggleRight className="h-4 w-4 text-green-600" />
                          : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni İşletme Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ad *</Label>
              <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Modern Berber" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="modern-berber" />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v ?? "berber" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0212 555 00 00" />
            </div>
            <div className="space-y-1.5">
              <Label>Adres</Label>
              <Textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Açıklama</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin User Dialog */}
      <Dialog open={adminOpen} onOpenChange={(o) => { setAdminOpen(o); if (!o) setAdminTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Admin Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          {adminTarget && (
            <p className="text-sm text-muted-foreground">
              <strong>{adminTarget.name}</strong> işletmesi için yeni bir admin kullanıcı oluşturun.
            </p>
          )}
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>E-posta *</Label>
              <Input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@isletme.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Şifre *</Label>
              <Input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="En az 6 karakter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminOpen(false)}>İptal</Button>
            <Button onClick={handleAddAdmin} disabled={adminSaving}>
              {adminSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

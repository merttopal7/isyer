"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import type { Service } from "@/types";

interface Props {
  businessId: number;
  initialServices: Service[];
}

export function HizmetlerClient({ businessId, initialServices }: Props) {
  const [services, setServices] = useState(initialServices);

  // Add service dialog
  const [sOpen, setSOpen] = useState(false);
  const [sForm, setSForm] = useState({ name: "", duration_minutes: "30", price: "" });
  const [sSaving, setSSaving] = useState(false);

  // Edit service dialog
  const [editService, setEditService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({ name: "", duration_minutes: "30", price: "" });
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(s: Service) {
    setEditService(s);
    setEditForm({
      name: s.name,
      duration_minutes: String(s.duration_minutes),
      price: s.price != null ? String(s.price) : "",
    });
  }

  async function createService() {
    if (!sForm.name || !sForm.duration_minutes) { toast.error("İsim ve süre zorunludur."); return; }
    setSSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, ...sForm, price: sForm.price || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setServices((p) => [...p, data]);
      setSOpen(false);
      setSForm({ name: "", duration_minutes: "30", price: "" });
      toast.success("Hizmet eklendi.");
    } finally { setSSaving(false); }
  }

  async function updateService() {
    if (!editService || !editForm.name || !editForm.duration_minutes) {
      toast.error("İsim ve süre zorunludur.");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/services/${editService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          duration_minutes: Number(editForm.duration_minutes),
          price: editForm.price ? Number(editForm.price) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Kaydedilemedi."); return; }
      setServices((p) => p.map((x) => x.id === editService.id ? data : x));
      setEditService(null);
      toast.success("Hizmet güncellendi.");
    } finally { setEditSaving(false); }
  }

  async function toggleService(s: Service) {
    const res = await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !s.is_active }),
    });
    if (res.ok) {
      setServices((p) => p.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
    }
  }

  async function deleteService(id: number) {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) { setServices((p) => p.filter((x) => x.id !== id)); toast.success("Hizmet silindi."); }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hizmetler</h1>
        <Button size="sm" onClick={() => setSOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Hizmet Ekle
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hizmet Adı</TableHead>
              <TableHead>Süre</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Henüz hizmet yok.
                </TableCell>
              </TableRow>
            )}
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.duration_minutes} dk</TableCell>
                <TableCell>{s.price ? `${s.price} ₺` : "—"}</TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "secondary"}>
                    {s.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleService(s)}>
                    {s.is_active
                      ? <ToggleRight className="h-4 w-4 text-green-600" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteService(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={sOpen} onOpenChange={setSOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hizmet Ekle</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Hizmet Adı *</Label>
              <Input value={sForm.name} onChange={(e) => setSForm((f) => ({ ...f, name: e.target.value }))} placeholder="Saç Kesimi" />
            </div>
            <div className="space-y-1.5">
              <Label>Süre (dakika) *</Label>
              <Input type="number" min={5} step={5} value={sForm.duration_minutes}
                onChange={(e) => setSForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fiyat (₺)</Label>
              <Input type="number" min={0} value={sForm.price}
                onChange={(e) => setSForm((f) => ({ ...f, price: e.target.value }))} placeholder="Boş bırakılabilir" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSOpen(false)}>İptal</Button>
            <Button onClick={createService} disabled={sSaving}>
              {sSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editService} onOpenChange={(o) => { if (!o) setEditService(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hizmet Düzenle</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Hizmet Adı *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Saç Kesimi" />
            </div>
            <div className="space-y-1.5">
              <Label>Süre (dakika) *</Label>
              <Input type="number" min={5} step={5} value={editForm.duration_minutes}
                onChange={(e) => setEditForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fiyat (₺)</Label>
              <Input type="number" min={0} value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} placeholder="Boş bırakılabilir" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditService(null)}>İptal</Button>
            <Button onClick={updateService} disabled={editSaving}>
              {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

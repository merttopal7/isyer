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
import type { StaffOrResource } from "@/types";

interface Props {
  businessId: number;
  initialStaff: StaffOrResource[];
}

export function PersonelClient({ businessId, initialStaff }: Props) {
  const [staff, setStaff] = useState(initialStaff);

  // Add dialog
  const [stOpen, setStOpen] = useState(false);
  const [stForm, setStForm] = useState({ name: "" });
  const [stSaving, setStSaving] = useState(false);

  // Edit dialog
  const [editStaff, setEditStaff] = useState<StaffOrResource | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editStaffSaving, setEditStaffSaving] = useState(false);

  function openEditStaff(s: StaffOrResource) {
    setEditStaff(s);
    setEditStaffName(s.name);
  }

  async function updateStaff() {
    if (!editStaff || !editStaffName.trim()) { toast.error("İsim zorunludur."); return; }
    setEditStaffSaving(true);
    try {
      const res = await fetch(`/api/staff/${editStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editStaffName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Kaydedilemedi."); return; }
      setStaff((p) => p.map((x) => x.id === editStaff.id ? data : x));
      setEditStaff(null);
      toast.success("Personel güncellendi.");
    } finally { setEditStaffSaving(false); }
  }

  async function createStaff() {
    if (!stForm.name) { toast.error("İsim zorunludur."); return; }
    setStSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, name: stForm.name }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setStaff((p) => [...p, data]);
      setStOpen(false);
      setStForm({ name: "" });
      toast.success("Personel/kaynak eklendi.");
    } finally { setStSaving(false); }
  }

  async function toggleStaff(s: StaffOrResource) {
    const res = await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !s.is_active }),
    });
    if (res.ok) {
      setStaff((p) => p.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
    }
  }

  async function deleteStaff(id: number) {
    if (!confirm("Bu personeli/kaynağı silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    if (res.ok) { setStaff((p) => p.filter((x) => x.id !== id)); toast.success("Silindi."); }
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Personel / Kaynak Yönetimi</h1>

      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setStOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Personel / Kaynak Ekle
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Henüz personel/kaynak yok.
                </TableCell>
              </TableRow>
            )}
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "secondary"}>
                    {s.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditStaff(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleStaff(s)}>
                    {s.is_active
                      ? <ToggleRight className="h-4 w-4 text-green-600" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteStaff(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={stOpen} onOpenChange={setStOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Personel / Kaynak Ekle</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Ad *</Label>
              <Input
                value={stForm.name}
                onChange={(e) => setStForm({ name: e.target.value })}
                placeholder="Ahmet Usta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStOpen(false)}>İptal</Button>
            <Button onClick={createStaff} disabled={stSaving}>
              {stSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editStaff} onOpenChange={(o) => { if (!o) setEditStaff(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Personel Düzenle</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Ad *</Label>
              <Input
                value={editStaffName}
                onChange={(e) => setEditStaffName(e.target.value)}
                placeholder="Ahmet Usta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaff(null)}>İptal</Button>
            <Button onClick={updateStaff} disabled={editStaffSaving}>
              {editStaffSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

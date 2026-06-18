"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Pin, Loader2, Megaphone } from "lucide-react";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  businessId: number;
  initialAnnouncements: Announcement[];
}

const EMPTY_FORM = { title: "", content: "", is_pinned: false, is_published: true };

export function DuyurularClient({ businessId, initialAnnouncements }: Props) {
  const [items, setItems] = useState(initialAnnouncements);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(ann: Announcement) {
    setEditing(ann);
    setForm({ title: ann.title, content: ann.content, is_pinned: ann.is_pinned, is_published: ann.is_published });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Başlık ve içerik zorunludur.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/announcements/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Güncellenemedi."); return; }
        setItems((p) => p.map((a) => (a.id === editing.id ? data : a))
          .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)));
        toast.success("Duyuru güncellendi.");
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_id: businessId, ...form }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Oluşturulamadı."); return; }
        setItems((p) => [data, ...p].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)));
        toast.success("Duyuru oluşturuldu.");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Silinemedi."); return; }
      setItems((p) => p.filter((a) => a.id !== id));
      toast.success("Duyuru silindi.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Duyurular</h1>
          <p className="text-sm text-muted-foreground">{items.length} duyuru</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Duyuru
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Henüz duyuru yok</p>
          <p className="mt-1 text-sm text-muted-foreground">Müşterilerinize duyuru paylaşmak için ekleyin.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> İlk Duyuruyu Ekle
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead className="hidden sm:table-cell">İçerik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="hidden md:table-cell">Tarih</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!!ann.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                      <span className="font-medium">{ann.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-xs sm:table-cell">
                    <p className="truncate text-sm text-muted-foreground">{ann.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ann.is_published
                        ? <Badge variant="default" className="text-xs">Yayında</Badge>
                        : <Badge variant="secondary" className="text-xs">Taslak</Badge>}
                      {!!ann.is_pinned && <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">Sabitli</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDate(ann.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ann)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ann.id)}
                        disabled={deletingId === ann.id}
                      >
                        {deletingId === ann.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Duyuru Düzenle" : "Yeni Duyuru"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Başlık *</Label>
              <Input
                id="ann-title"
                placeholder="Duyuru başlığı"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-content">İçerik *</Label>
              <Textarea
                id="ann-content"
                placeholder="Duyuru içeriğini buraya yazın..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sabitle</p>
                <p className="text-xs text-muted-foreground">Sabitli duyurular listenin en üstünde gösterilir.</p>
              </div>
              <Switch
                checked={form.is_pinned}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_pinned: v }))}
              />
            </div>
            <div className={cn(
              "flex items-center justify-between rounded-lg border p-3",
              !form.is_published && "bg-muted/40"
            )}>
              <div>
                <p className="text-sm font-medium">Yayınla</p>
                <p className="text-xs text-muted-foreground">Kapalıysa müşteriler bu duyuruyu göremez.</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

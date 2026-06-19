"use client";

import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, Loader2, LayoutList, ImagePlus, X } from "lucide-react";
import type { MenuCategory } from "@/types";

interface Props {
  businessId: number;
  initialCategories: MenuCategory[];
}

const EMPTY_FORM = { name: "", description: "", is_published: true };

export function KategorilerClient({ businessId, initialCategories }: Props) {
  const [items, setItems] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPendingImage(null);
    setImagePreview(null);
    setImageRemoved(false);
    setOpen(true);
  }

  function openEdit(cat: MenuCategory) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", is_published: cat.is_published });
    setPendingImage(null);
    setImagePreview(null);
    setImageRemoved(false);
    setOpen(true);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingImage(f);
    setImagePreview(URL.createObjectURL(f));
    setImageRemoved(false);
    e.target.value = "";
  }

  function clearImage() {
    setPendingImage(null);
    setImagePreview(null);
    setImageRemoved(true);
  }

  async function uploadImage(categoryId: number): Promise<string | null> {
    if (!pendingImage) return null;
    const fd = new FormData();
    fd.append("type", "category");
    fd.append("id", String(categoryId));
    fd.append("file", pendingImage);
    const res = await fetch(`/api/admin/${businessId}/menu/upload`, { method: "POST", body: fd });
    if (!res.ok) { toast.error("Görsel yüklenemedi."); return null; }
    const { url } = await res.json();
    return url as string;
  }

  async function removeImage(categoryId: number) {
    await fetch(`/api/admin/${businessId}/menu/upload`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", id: categoryId }),
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Kategori adı zorunludur.");
      return;
    }
    setSaving(true);
    try {
      let category: MenuCategory;

      if (editing) {
        const res = await fetch(`/api/menu/categories/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, description: form.description, is_published: form.is_published }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Güncellenemedi."); return; }
        category = data;

        if (pendingImage) {
          const url = await uploadImage(category.id);
          if (url) category = { ...category, image_url: url };
        } else if (imageRemoved && editing.image_url) {
          await removeImage(category.id);
          category = { ...category, image_url: null };
        }

        setItems((p) => p.map((c) => (c.id === editing.id ? category : c)));
        toast.success("Kategori güncellendi.");
      } else {
        const res = await fetch("/api/menu/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_id: businessId, ...form }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Oluşturulamadı."); return; }
        category = data;

        if (pendingImage) {
          const url = await uploadImage(category.id);
          if (url) category = { ...category, image_url: url };
        }

        setItems((p) => [...p, category]);
        toast.success("Kategori oluşturuldu.");
      }

      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/menu/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Silinemedi."); return; }
      setItems((p) => p.filter((c) => c.id !== id));
      toast.success("Kategori silindi.");
    } finally {
      setDeletingId(null);
    }
  }

  const currentImage = imagePreview ?? (editing && !imageRemoved ? editing.image_url : null);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">QR Menü — Kategoriler</h1>
          <p className="text-sm text-muted-foreground">{items.length} kategori</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Kategori
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <LayoutList className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Henüz kategori yok</p>
          <p className="mt-1 text-sm text-muted-foreground">Menünüzü oluşturmak için ilk kategoriyi ekleyin.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> İlk Kategoriyi Ekle
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Görsel</TableHead>
                <TableHead>Kategori Adı</TableHead>
                <TableHead className="hidden sm:table-cell">Açıklama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {cat.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="h-10 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded-md bg-muted">
                        <LayoutList className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="hidden max-w-xs sm:table-cell">
                    <p className="truncate text-sm text-muted-foreground">
                      {cat.description || <span className="italic opacity-40">—</span>}
                    </p>
                  </TableCell>
                  <TableCell>
                    {cat.is_published
                      ? <Badge variant="default" className="text-xs">Yayında</Badge>
                      : <Badge variant="secondary" className="text-xs">Taslak</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                      >
                        {deletingId === cat.id
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="space-y-1.5">
              <Label>Görsel</Label>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
              {currentImage ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage}
                    alt="Önizleme"
                    className="h-36 w-full rounded-xl object-cover border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white transition-colors hover:bg-black/80"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  <ImagePlus className="h-6 w-6" />
                  Fotoğraf seç (max 5 MB)
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Kategori Adı *</Label>
              <Input
                id="cat-name"
                placeholder="ör. Sıcak İçecekler"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Açıklama</Label>
              <Textarea
                id="cat-desc"
                placeholder="Kısa bir açıklama (opsiyonel)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Yayınla</p>
                <p className="text-xs text-muted-foreground">Kapalıysa müşteriler bu kategoriyi göremez.</p>
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

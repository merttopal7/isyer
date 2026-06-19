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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, UtensilsCrossed, ImagePlus, X } from "lucide-react";
import type { MenuCategory, MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import NextLink from "next/link";

interface Props {
  businessId: number;
  initialCategories: MenuCategory[];
  initialItems: MenuItem[];
}

const EMPTY_FORM = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
};

export function UrunlerClient({ businessId, initialCategories, initialItems }: Props) {
  const [categories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCatId, setSelectedCatId] = useState<number | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleItems =
    selectedCatId === "all"
      ? items
      : items.filter((i) => i.category_id === selectedCatId);

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      category_id:
        selectedCatId !== "all"
          ? String(selectedCatId)
          : categories[0]?.id
          ? String(categories[0].id)
          : "",
    });
    setPendingImage(null);
    setImagePreview(null);
    setImageRemoved(false);
    setOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      category_id: String(item.category_id),
      name: item.name,
      description: item.description ?? "",
      price: item.price != null ? String(item.price) : "",
      is_available: item.is_available,
    });
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

  async function uploadImage(itemId: number): Promise<string | null> {
    if (!pendingImage) return null;
    const fd = new FormData();
    fd.append("type", "item");
    fd.append("id", String(itemId));
    fd.append("file", pendingImage);
    const res = await fetch(`/api/admin/${businessId}/menu/upload`, { method: "POST", body: fd });
    if (!res.ok) { toast.error("Görsel yüklenemedi."); return null; }
    const { url } = await res.json();
    return url as string;
  }

  async function removeImage(itemId: number) {
    await fetch(`/api/admin/${businessId}/menu/upload`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "item", id: itemId }),
    });
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Ürün adı zorunludur."); return; }
    if (!form.category_id) { toast.error("Kategori seçiniz."); return; }

    setSaving(true);
    try {
      let item: MenuItem;

      if (editing) {
        const res = await fetch(`/api/menu/items/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category_id: Number(form.category_id),
            name: form.name,
            description: form.description,
            price: form.price !== "" ? form.price : null,
            is_available: form.is_available,
          }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Güncellenemedi."); return; }
        item = data;

        if (pendingImage) {
          const url = await uploadImage(item.id);
          if (url) item = { ...item, image_url: url };
        } else if (imageRemoved && editing.image_url) {
          await removeImage(item.id);
          item = { ...item, image_url: null };
        }

        setItems((p) => p.map((i) => (i.id === editing.id ? item : i)));
        toast.success("Ürün güncellendi.");
      } else {
        const res = await fetch("/api/menu/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: businessId,
            category_id: Number(form.category_id),
            name: form.name,
            description: form.description,
            price: form.price !== "" ? form.price : null,
            is_available: form.is_available,
          }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Oluşturulamadı."); return; }
        item = data;

        if (pendingImage) {
          const url = await uploadImage(item.id);
          if (url) item = { ...item, image_url: url };
        }

        setItems((p) => [...p, item]);
        toast.success("Ürün oluşturuldu.");
      }

      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/menu/items/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Silinemedi."); return; }
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success("Ürün silindi.");
    } finally {
      setDeletingId(null);
    }
  }

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  function formatPrice(p: number | null) {
    if (p == null) return "—";
    return Number(p).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
  }

  const currentImage = imagePreview ?? (editing && !imageRemoved ? editing.image_url : null);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium">Henüz kategori yok</p>
        <p className="mt-1 text-sm text-muted-foreground">Ürün eklemek için önce en az bir kategori oluşturun.</p>
        <Button className="mt-4" asChild>
          <NextLink href={`/admin/${businessId}/qr-menu/kategoriler`}>
            Kategorilere Git
          </NextLink>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">QR Menü — Ürünler</h1>
          <p className="text-sm text-muted-foreground">{visibleItems.length} ürün</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedCatId === "all" ? "all" : String(selectedCatId)}
            onValueChange={(v) => setSelectedCatId(v === "all" ? "all" : Number(v))}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tüm kategoriler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kategoriler</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Ürün
          </Button>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">Henüz ürün yok</p>
          <p className="mt-1 text-sm text-muted-foreground">Bu kategoriye ürün eklemek için butona tıklayın.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> İlk Ürünü Ekle
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Görsel</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="max-w-xs truncate text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {categoryName(item.category_id)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell>
                    {item.is_available
                      ? <Badge variant="default" className="text-xs">Mevcut</Badge>
                      : <Badge variant="secondary" className="text-xs">Tükendi</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id
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
            <DialogTitle>{editing ? "Ürün Düzenle" : "Yeni Ürün"}</DialogTitle>
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
                    className="h-48 w-full rounded-xl object-cover border"
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
              <Label>Kategori *</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-name">Ürün Adı *</Label>
              <Input
                id="item-name"
                placeholder="ör. Türk Kahvesi"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-desc">Açıklama</Label>
              <Textarea
                id="item-desc"
                placeholder="Kısa bir açıklama (opsiyonel)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-price">Fiyat (₺)</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="ör. 45.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className={cn(
              "flex items-center justify-between rounded-lg border p-3",
              !form.is_available && "bg-muted/40"
            )}>
              <div>
                <p className="text-sm font-medium">Mevcut</p>
                <p className="text-xs text-muted-foreground">Kapalıysa "Tükendi" olarak gösterilir.</p>
              </div>
              <Switch
                checked={form.is_available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
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

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, MapPin, ExternalLink, Search, Upload, X, ImageIcon } from "lucide-react";
import type { Business } from "@/types";

function extractIframeSrc(raw: string): string | null {
  const match = raw.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ü/g, "u").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  business: Business;
}

export function AyarlarClient({ business }: Props) {
  const [name, setName] = useState(business.name ?? "");
  const [slug, setSlug] = useState(business.slug ?? "");
  const [description, setDescription] = useState(business.description ?? "");
  const [bookingAdvanceDays, setBookingAdvanceDays] = useState(business.booking_advance_days ?? 7);
  const [slotInterval, setSlotInterval] = useState<string>(
    String(business.slot_interval_minutes ?? "")
  );
  const [phone, setPhone] = useState(business.phone ?? "");
  const [address, setAddress] = useState(business.address ?? "");
  const [iframeRaw, setIframeRaw] = useState(
    business.map_embed ? `<iframe src="${business.map_embed}"></iframe>` : ""
  );
  const [metaTitle, setMetaTitle] = useState(business.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(business.meta_description ?? "");
  const [metaKeywords, setMetaKeywords] = useState(business.meta_keywords ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(business.logo_url ?? null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(business.favicon_url ?? null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingSeo, setSavingSeo] = useState(false);

  async function uploadImage(type: "logo" | "favicon", file: File) {
    const setLoading = type === "logo" ? setUploadingLogo : setUploadingFavicon;
    const setUrl = type === "logo" ? setLogoUrl : setFaviconUrl;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", file);
      const res = await fetch(`/api/admin/${business.id}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Yüklenemedi."); return; }
      setUrl(data.url);
      toast.success(type === "logo" ? "Logo yüklendi." : "Favicon yüklendi.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage(type: "logo" | "favicon") {
    const setUrl = type === "logo" ? setLogoUrl : setFaviconUrl;
    const res = await fetch(`/api/admin/${business.id}/upload`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) { toast.error("Silinemedi."); return; }
    setUrl(null);
    toast.success(type === "logo" ? "Logo silindi." : "Favicon silindi.");
  }

  function handleNameChange(value: string) {
    setName(value);
    setSlug(toSlug(value));
  }

  const extractedSrc = iframeRaw.trim() ? extractIframeSrc(iframeRaw) : null;
  const mapPreviewSrc =
    extractedSrc?.startsWith("https://www.google.com/maps/embed") ? extractedSrc : null;

  async function saveGeneral() {
    setSavingGeneral(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          slug: slug || null,
          description: description || null,
          booking_advance_days: bookingAdvanceDays,
          slot_interval_minutes: slotInterval ? Number(slotInterval) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Kaydedilemedi."); return; }
      toast.success("Genel bilgiler kaydedildi.");
    } finally {
      setSavingGeneral(false);
    }
  }

  async function saveSeo() {
    setSavingSeo(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          meta_keywords: metaKeywords || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Kaydedilemedi."); return; }
      toast.success("SEO bilgileri kaydedildi.");
    } finally {
      setSavingSeo(false);
    }
  }

  async function saveContact() {
    setSavingContact(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone || null,
          address: address || null,
          map_embed: mapPreviewSrc ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Kaydedilemedi."); return; }
      toast.success("İletişim bilgileri kaydedildi.");
    } finally {
      setSavingContact(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-4 sm:px-6 sm:py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">İşletme Ayarları</h1>
          <p className="text-sm text-muted-foreground">{business.name}</p>
        </div>

        <Tabs defaultValue="genel">
          <TabsList className="mb-6">
            <TabsTrigger value="genel">Genel</TabsTrigger>
            <TabsTrigger value="gorseller">Görseller</TabsTrigger>
            <TabsTrigger value="iletisim">İletişim</TabsTrigger>
            <TabsTrigger value="konum">Konum</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="genel" className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">İşletme Adı</Label>
              <Input
                id="name"
                placeholder="İşletme adınız"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">
                URL Slug{" "}
                <span className="text-xs font-normal text-muted-foreground">(otomatik)</span>
              </Label>
              <Input
                id="slug"
                value={slug}
                readOnly
                className="bg-muted font-mono text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Rezervasyon linki:{" "}
                <code className="rounded bg-muted px-1 py-0.5">/b/{slug || "…"}</code>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Açıklama</Label>
              <Textarea
                id="desc"
                placeholder="İşletmenizi tanıtan kısa bir metin..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advance">Maksimum İleri Randevu Süresi (gün)</Label>
              <Input
                id="advance"
                type="number"
                min={1}
                max={365}
                value={bookingAdvanceDays}
                onChange={(e) => setBookingAdvanceDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                className="max-w-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Müşteriler bugünden itibaren en fazla <strong>{bookingAdvanceDays} gün</strong> ilerisine randevu alabilir.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slot-interval">Randevu Sıklığı</Label>
              <Select value={slotInterval} onValueChange={(v) => setSlotInterval(v ?? "")}>
                <SelectTrigger id="slot-interval" className="max-w-[200px]">
                  <SelectValue placeholder="Hizmet süresi kadar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Hizmet süresi kadar</SelectItem>
                  <SelectItem value="10">Her 10 dakikada bir</SelectItem>
                  <SelectItem value="15">Her 15 dakikada bir</SelectItem>
                  <SelectItem value="20">Her 20 dakikada bir</SelectItem>
                  <SelectItem value="30">Her 30 dakikada bir</SelectItem>
                  <SelectItem value="45">Her 45 dakikada bir</SelectItem>
                  <SelectItem value="60">Her 60 dakikada bir</SelectItem>
                  <SelectItem value="90">Her 90 dakikada bir</SelectItem>
                  <SelectItem value="120">Her 2 saatte bir</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {slotInterval
                  ? `Randevu başlangıç saatleri her ${slotInterval} dakikada bir oluşturulur.`
                  : "Varsayılan: her hizmet bitişinde yeni slot başlar."}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={saveGeneral} disabled={savingGeneral}>
                {savingGeneral
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="iletisim" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  placeholder="Mahalle, sokak, bina no..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={saveContact} disabled={savingContact}>
                {savingContact
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="konum" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Google Maps Konumu</h2>
                <p className="text-xs text-muted-foreground">İşletmenizin harita konumunu ekleyin</p>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Nasıl alınır?</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Google Maps&apos;te işletmenizi arayın</li>
                <li>Paylaş → Haritayı göm seçeneğine tıklayın</li>
                <li>Açılan iframe kodunun tamamını kopyalayın</li>
                <li>Aşağıya yapıştırın — src otomatik ayıklanır</li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="map_embed">
                <MapPin className="mr-1 inline h-3.5 w-3.5" />
                Google Maps Iframe Kodu
              </Label>
              <Textarea
                id="map_embed"
                placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                value={iframeRaw}
                onChange={(e) => setIframeRaw(e.target.value)}
                rows={3}
                className="resize-none font-mono text-xs"
              />
              {iframeRaw.trim() && !extractedSrc && (
                <p className="text-xs text-destructive">
                  Geçerli bir <code>src</code> bulunamadı. Lütfen iframe kodunu eksiksiz yapıştırın.
                </p>
              )}
              {extractedSrc && !mapPreviewSrc && (
                <p className="text-xs text-destructive">
                  Ayıklanan URL geçersiz.{" "}
                  <code>https://www.google.com/maps/embed</code> ile başlamalı.
                </p>
              )}
              {mapPreviewSrc && (
                <p className="text-xs text-green-600 dark:text-green-400">✓ Konum ayıklandı</p>
              )}
            </div>

            {mapPreviewSrc && (
              <div className="overflow-hidden rounded-xl border">
                <iframe
                  src={mapPreviewSrc}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Harita önizleme"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={saveContact} disabled={savingContact}>
                {savingContact
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="gorseller" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Görseller WebP formatına dönüştürülerek optimize edilir. Maksimum dosya boyutu: 5 MB.
            </p>

            {/* Logo */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold">Logo</Label>
                <p className="text-xs text-muted-foreground mt-0.5">İşletme sayfasında görüntülenir. Önerilen: kare format. Maksimum 400×400 px olarak yeniden boyutlandırılır.</p>
              </div>
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Logo yüklü</p>
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("logo", f); e.target.value = ""; }}
                        />
                        <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                          {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          Değiştir
                        </span>
                      </label>
                      <button
                        onClick={() => deleteImage("logo")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("logo", f); e.target.value = ""; }}
                  />
                  <div className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30 transition-colors">
                    {uploadingLogo
                      ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      : <><ImageIcon className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Logo yükle</span></>
                    }
                  </div>
                </label>
              )}
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold">Favicon</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Tarayıcı sekmesinde görüntülenir. 64×64 px olarak kırpılır.</p>
              </div>
              {faviconUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl} alt="Favicon" className="h-full w-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Favicon yüklü</p>
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("favicon", f); e.target.value = ""; }}
                        />
                        <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                          {uploadingFavicon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          Değiştir
                        </span>
                      </label>
                      <button
                        onClick={() => deleteImage("favicon")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("favicon", f); e.target.value = ""; }}
                  />
                  <div className="flex h-20 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30 transition-colors">
                    {uploadingFavicon
                      ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      : <><ImageIcon className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Favicon yükle</span></>
                    }
                  </div>
                </label>
              )}
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" /> Arama Motoru Optimizasyonu
              </p>
              <p>Bu alanlar Google gibi arama motorlarında işletmenizin nasıl göründüğünü etkiler.</p>
            </div>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-title">Sayfa Başlığı (Title)</Label>
                <span className={metaTitle.length > 60 ? "text-xs text-destructive" : metaTitle.length > 50 ? "text-xs text-amber-500" : "text-xs text-muted-foreground"}>
                  {metaTitle.length} / 60
                </span>
              </div>
              <Input
                id="meta-title"
                placeholder={`${business.name} — ${business.category}`}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Boş bırakılırsa işletme adı kullanılır. İdeal: 50–60 karakter.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-desc">Meta Açıklama (Description)</Label>
                <span className={metaDescription.length > 160 ? "text-xs text-destructive" : metaDescription.length > 140 ? "text-xs text-amber-500" : "text-xs text-muted-foreground"}>
                  {metaDescription.length} / 160
                </span>
              </div>
              <Textarea
                id="meta-desc"
                placeholder="İşletmenizi kısaca tanıtın. Arama sonuçlarında görüntülenir."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                İdeal: 120–160 karakter. Arama sonuçlarının altındaki açıklama metni.
              </p>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-1.5">
              <Label htmlFor="meta-keywords">Anahtar Kelimeler (Keywords)</Label>
              <Input
                id="meta-keywords"
                placeholder="berber, saç kesimi, sakal tıraşı, İstanbul"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Virgülle ayırın. Google tarafından doğrudan kullanılmaz ancak bazı platformlar okur.
              </p>
            </div>

            {/* Preview */}
            {(metaTitle || metaDescription) && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Arama Sonucu Önizlemesi</p>
                <p className="text-base font-medium text-blue-600 dark:text-blue-400 leading-snug">
                  {metaTitle || business.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-500">
                  {typeof window !== "undefined" ? window.location.origin : ""}/isletme/{business.slug}
                </p>
                {metaDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{metaDescription}</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={saveSeo} disabled={savingSeo}>
                {savingSeo
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

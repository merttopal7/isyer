export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db";
import { bizUrl } from "@/lib/url";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import {
  Calendar, Scissors, Stethoscope, UtensilsCrossed,
  ArrowRight, Building2, CheckCircle2, QrCode, Palette,
  MessageCircle, Users, Globe, Sparkles, Share2,
  ChevronRight,
} from "lucide-react";
import type { Business } from "@/types";

export const metadata: Metadata = {
  title: "İşyer — İşletmenize Ücretsiz Dijital Vitrin ve Online Randevu Sistemi",
  description:
    "Berber, kuaför, klinik, restoran ve her türlü işletme için ücretsiz online randevu sistemi. SEO uyumlu işletme sayfası, WhatsApp bildirimleri, QR menü, QR kod oluşturma ve özelleştirme desteği. Hemen başlayın, sonsuza kadar ücretsiz.",
  keywords:
    "online randevu sistemi, ücretsiz randevu uygulaması, berber randevu, kuaför randevu, işletme yönetimi, dijital vitrin, QR menü, QR kod, randevu al, özelleştirme",
  openGraph: {
    title: "İşyer — İşletmenize Ücretsiz Dijital Vitrin",
    description:
      "Online randevu, QR menü, özelleştirme, müşteri sayfası ve daha fazlası. Dakikalar içinde kurulum — sonsuza kadar ücretsiz.",
    type: "website",
    locale: "tr_TR",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.isyer.com",
  },
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  berber: Scissors,
  hastane: Stethoscope,
  restoran: UtensilsCrossed,
};

const STEPS = [
  {
    n: "01",
    title: "Hesabınızı Açın",
    desc: "Admin paneline giriş yapın, işletmenizi tanımlayın. Kredi kartı gerekmez, dakikalar içinde hazır.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Sayfanızı Kurun",
    desc: "Logo, marka rengi, hizmetler, personel ve çalışma saatlerinizi ekleyin. Her şey sizin kontrolünüzde.",
    icon: Palette,
  },
  {
    n: "03",
    title: "Paylaşın ve Büyüyün",
    desc: "İşletme linkinizi paylaşın, müşteriler randevu almaya başlasın. Siz sadece işinize bakın.",
    icon: Share2,
  },
];

const FREE_ITEMS = [
  "Sınırsız randevu",
  "İşletmeye özel alan adı",
  "WhatsApp ve işletme bildirimleri",
  "SEO optimizasyonlu sayfa",
  "Logo, renk ve stil özelleştirme",
  "Personel ve hizmet yönetimi",
  "QR Menü ve QR Kod oluşturma",
  "Randevu paylaşım linki",
];

/* ── Küçük sabit bileşenler ── */

function AppointmentPreview() {
  const apts = [
    { time: "10:00", name: "Mehmet Yılmaz", svc: "Saç Kesimi · 30 dk" },
    { time: "11:30", name: "Ahmet Kara",    svc: "Sakal Tıraşı · 20 dk" },
    { time: "14:00", name: "Serkan Demir",  svc: "Saç + Sakal · 45 dk" },
  ];
  return (
    <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Bugün · {apts.length} randevu
      </p>
      <div className="flex flex-col gap-1.5">
        {apts.map((a) => (
          <div
            key={a.time}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span className="min-w-[36px] text-[11.5px] font-bold text-green-600 dark:text-green-400">
              {a.time}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{a.name}</p>
              <p className="text-[10.5px] text-muted-foreground">{a.svc}</p>
            </div>
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-green-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QrVisual() {
  return (
    <div className="mt-5 flex items-start gap-4">
      <div className="shrink-0 rounded-xl border border-border bg-white p-2.5 dark:bg-zinc-900">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="76" height="76" aria-hidden="true">
          {/* Top-left finder */}
          <rect x="0" y="0" width="7" height="7" rx="1" fill="currentColor" className="text-foreground"/>
          <rect x="1" y="1" width="5" height="5" fill="white"/>
          <rect x="2" y="2" width="3" height="3" fill="currentColor" className="text-foreground"/>
          {/* Top-right finder */}
          <rect x="14" y="0" width="7" height="7" rx="1" fill="currentColor" className="text-foreground"/>
          <rect x="15" y="1" width="5" height="5" fill="white"/>
          <rect x="16" y="2" width="3" height="3" fill="currentColor" className="text-foreground"/>
          {/* Bottom-left finder */}
          <rect x="0" y="14" width="7" height="7" rx="1" fill="currentColor" className="text-foreground"/>
          <rect x="1" y="15" width="5" height="5" fill="white"/>
          <rect x="2" y="16" width="3" height="3" fill="currentColor" className="text-foreground"/>
          {/* Data modules */}
          <rect x="9" y="0" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="11" y="0" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="8" y="2" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="10" y="2" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="9" y="4" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="8" y="8" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="11" y="8" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="13" y="8" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="9" y="9" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="8" y="10" width="1" height="2" fill="currentColor" className="text-foreground"/>
          <rect x="11" y="10" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="13" y="10" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="8" y="12" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="12" y="12" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="9" y="14" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="11" y="14" width="1" height="2" fill="currentColor" className="text-foreground"/>
          <rect x="13" y="15" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="8" y="16" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="10" y="17" width="2" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" className="text-foreground"/>
          <rect x="15" y="15" width="1" height="1" fill="white"/>
          <rect x="18" y="17" width="1" height="1" fill="currentColor" className="text-foreground"/>
          <rect x="20" y="18" width="1" height="1" fill="currentColor" className="text-foreground"/>
        </svg>
      </div>
      <div>
        <span className="mb-2 inline-block rounded-md bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
          Aktif
        </span>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Her güncelleme anında koda yansır. PNG veya SVG olarak indirin ve paylaşın.
        </p>
      </div>
    </div>
  );
}

function ColorSwatches() {
  const colors = [
    { hex: "#16A34A", label: "Yeşil", active: true },
    { hex: "#2563EB", label: "Mavi" },
    { hex: "#E54D2E", label: "Kırmızı" },
    { hex: "#9333EA", label: "Mor" },
    { hex: "#D97706", label: "Amber" },
    { hex: "#0891B2", label: "Cyan" },
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {colors.map((c) => (
        <span
          key={c.hex}
          aria-label={c.label}
          style={{ backgroundColor: c.hex }}
          className={`h-7 w-7 rounded-lg border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,.1)] transition-transform hover:scale-110 ${
            c.active ? "shadow-[0_0_0_2.5px_#16A34A]" : ""
          }`}
        />
      ))}
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="relative w-[300px] lg:w-[320px] xl:w-[340px]">
      {/* Badge 1 */}
      <div className="animate-float absolute -right-5 -top-4 z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-background/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Randevu Onaylandı</p>
          <p className="text-[10.5px] text-muted-foreground">Ahmet K. · 14:30</p>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_32px_72px_rgba(0,0,0,.10),0_8px_24px_rgba(0,0,0,.06)]">
        {/* Dark header */}
        <div className="relative overflow-hidden bg-[#111C15] px-5 py-[18px]">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-green-500/10 blur-2xl" />
          <p className="mb-1.5 text-[15px] font-bold tracking-tight text-white">Kartal Berber Salonu</p>
          <span className="inline-block rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-green-300">
            berber
          </span>
        </div>
        {/* Body */}
        <div className="px-5 py-4">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Hizmetler
          </p>
          {[
            { name: "Saç Kesimi",        dur: "30 dk", price: "150₺" },
            { name: "Sakal Tıraşı",      dur: "20 dk", price: "80₺"  },
            { name: "Saç + Sakal Paketi",dur: "45 dk", price: "200₺" },
          ].map((s) => (
            <div
              key={s.name}
              className="mb-1.5 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5"
            >
              <div>
                <p className="text-[12.5px] font-semibold text-foreground">{s.name}</p>
                <p className="text-[10.5px] text-muted-foreground">{s.dur}</p>
              </div>
              <span className="text-[13px] font-bold text-green-600 dark:text-green-400">{s.price}</span>
            </div>
          ))}
          <div className="mt-3 w-full rounded-xl bg-green-600 py-2.5 text-center text-[13.5px] font-bold text-white">
            Randevu Al →
          </div>
        </div>
      </div>

      {/* Badge 2 */}
      <div className="animate-float-delayed absolute -left-5 bottom-5 z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-background/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Share2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Randevu Paylaşıldı</p>
          <p className="text-[10.5px] text-muted-foreground">WhatsApp'tan gönderildi</p>
        </div>
      </div>
    </div>
  );
}

/* ── Ana Sayfa ── */
export default async function HomePage() {
  const businesses = await db<Business>("businesses")
    .where({ status: "active" })
    .orderBy("name");

  const activeCount = businesses.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Grid bg */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-green-500/8 blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-emerald-600/8 blur-[90px]" />
          </div>

          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

              {/* Left */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Eyebrow */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/8 px-4 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Tamamen Ücretsiz · Anında Kurulum
                </div>

                <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.08]">
                  İşletmenizin<br />
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-teal-400">
                    Dijital Yüzü
                  </span>
                </h1>

                <p className="mt-6 text-[17px] text-muted-foreground leading-relaxed max-w-xl">
                  Berber, kuaför, klinik, restoran — her işletme için <strong className="font-semibold text-foreground">online randevu</strong>, QR menü, WhatsApp bildirimleri ve tam özelleştirme. Tek platformda.
                </p>

                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 w-full sm:w-auto">
                  <Button
                    size="lg"
                    asChild
                    className="h-13 gap-2 rounded-2xl px-7 text-[15px] bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Link href="/admin/login">
                      Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-13 gap-2 rounded-2xl px-7 text-[15px] border-border hover:bg-accent/50 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Link href="#nasil-calisir">Nasıl Çalışır?</Link>
                  </Button>
                </div>

                <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Kredi Kartı Gerekmez</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Taahhüt Yok</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Reklamsız</span>
                </div>
              </div>

              {/* Right: Product mockup */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <ProductMockup />
              </div>
            </div>

            {/* Stats */}
            {activeCount > 0 && (
              <div className="mt-20">
                <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border bg-card shadow-sm">
                  {[
                    { val: `${activeCount}+`, label: "Aktif İşletme" },
                    { val: "7/24",            label: "Online Randevu" },
                    { val: "0₺",             label: "Sonsuza Kadar Ücretsiz" },
                  ].map(({ val, label }) => (
                    <div key={label} className="px-6 py-5 text-center">
                      <dd className="text-3xl font-extrabold tracking-tight text-green-600 dark:text-green-400 sm:text-4xl">{val}</dd>
                      <dt className="mt-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Özellikler (Bento Grid) ──────────────────────────── */}
        <section id="ozellikler" className="py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                ◆ Çözümlerimiz
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Her İşletme İçin<br />Akıllı Araçlar
              </h2>
              <p className="mt-3.5 text-base text-muted-foreground max-w-lg">
                Sektörünüz ne olursa olsun — işlerinizi kolaylaştıracak her şey burada, kutudan çıktığı gibi hazır.
              </p>
            </div>

            {/* Bento */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">

              {/* A: Randevu — large */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-500/30 md:col-span-1 lg:col-span-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/12">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Gelişmiş Randevu Sistemi
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  7/24 online randevu alımı. İşletmenize anlık bildirim, müşteriye paylaşılabilir link. Onay, iptal ve hatırlatmalar otomatik çalışır.
                </p>
                <AppointmentPreview />
              </div>

              {/* B: QR Menü — large */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-500/30 md:col-span-1 lg:col-span-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/12">
                  <QrCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  QR Menü & QR Kod
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Masaya kodu bırakın, müşteriler anında menüye erişsin. İşletmeniz için QR kod oluşturun, indirin ve paylaşın.
                </p>
                <QrVisual />
              </div>

              {/* C: Özelleştirme */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/30 md:col-span-1 lg:col-span-4">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/12">
                  <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Tam Özelleştirme
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Marka renginizi seçin, yazı tipini ayarlayın, sayfanızı kendinize özel yapın.
                </p>
                <ColorSwatches />
              </div>

              {/* D: WhatsApp */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-500/30 md:col-span-1 lg:col-span-4">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/12">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  WhatsApp Bildirimleri
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Randevu alındığında hem müşteriye hem işletmenize anında bildirim. Randevu linki otomatik eklenir, sıfır kurulum.
                </p>
              </div>

              {/* E: Personel */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30 md:col-span-1 lg:col-span-2">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/12">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Personel Yönetimi
                </h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                  Her personel için ayrı takvim, hizmet ve çalışma saati.
                </p>
              </div>

              {/* F: SEO */}
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-500/30 md:col-span-1 lg:col-span-2">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/12">
                  <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  SEO Sayfası
                </h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                  Kendi alan adınız, Google&apos;da üst sıralar.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Nasıl Çalışır ────────────────────────────────────── */}
        <section id="nasil-calisir" className="border-y bg-muted/30 py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                ◆ Basit Süreç
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                3 Adımda Hazır
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Karmaşık kurulum yok. İşletmenizi dakikalar içinde online randevuya açın.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.n}
                    className="group flex flex-col bg-background/80 p-8 hover:bg-background transition-colors"
                  >
                    <p className="mb-4 text-[10.5px] font-black tracking-[.15em] text-green-600 dark:text-green-400">
                      ADIM {step.n}
                    </p>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-green-500/20 bg-background shadow-sm group-hover:border-green-500/40 transition-colors">
                      <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="mb-2.5 text-base font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Ücretsiz (Dark) Section ──────────────────────────── */}
        <section className="relative overflow-hidden bg-[#111C15] py-24 text-white">
          {/* Glows */}
          <div className="pointer-events-none absolute right-0 top-0 -z-0 h-80 w-80 rounded-full bg-green-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 -z-0 h-64 w-64 rounded-full bg-amber-500/8 blur-[100px]" />

          <div className="container relative z-10 mx-auto max-w-5xl px-4">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/15 px-4 py-1.5 text-xs font-semibold text-green-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  Tamamen Ücretsiz Sistem
                </div>
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl text-white">
                  Başlamak ve büyümek için{" "}
                  <span className="text-green-400">hiçbir ücret ödemeyin</span>
                </h2>
                <p className="mb-8 text-[15px] text-white/60 leading-relaxed max-w-md">
                  İşyer, küçük ve orta ölçekli işletmelerin dijital dünyaya kolayca entegre olabilmesi için geliştirildi. Sözleşme yok, kurulum bedeli yok, sürpriz fatura yok.
                </p>
                <Button
                  size="lg"
                  className="h-13 gap-2 rounded-2xl bg-white px-7 text-[15px] font-bold text-[#111C15] hover:bg-zinc-100 shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/admin/login">
                    Hemen Ücretsiz Katıl <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FREE_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3.5 text-[13px] font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/8"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Aktif İşletmeler ─────────────────────────────────── */}
        {businesses.length > 0 && (
          <section id="isletmeler" className="border-t py-24">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-12 text-center">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                  ◆ Keşfedin
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Platformumuzu Kullanan İşletmeler
                </h2>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Siz de dijital vitrinizi oluşturun ve bu listedeki yerinizi alın.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((biz) => {
                  const Icon = CATEGORY_ICONS[biz.category] ?? Building2;
                  return (
                    <Link
                      key={biz.id}
                      href={bizUrl(biz.slug, "/")}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-green-500/35 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-500/10 ring-1 ring-border group-hover:scale-105 transition-transform">
                        {biz.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {biz.name}
                        </p>
                        <span className="mt-1 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                          {biz.category}
                        </span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/60 group-hover:bg-green-500/10 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all">
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/8 blur-[100px]" />
          <div className="container mx-auto max-w-xl px-4 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
              Müşterileriniz{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                Sizi Bekliyor
              </span>
            </h2>
            <p className="mb-8 text-muted-foreground text-base sm:text-lg max-w-sm mx-auto leading-relaxed">
              5 dakika içinde işletme sayfanızı oluşturun, online randevu almaya başlayın.
            </p>
            <Button
              size="lg"
              asChild
              className="h-13 gap-2 rounded-2xl px-8 text-[15px] bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 hover:shadow-green-600/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href="/admin/login">
                Hemen Başla — Ücretsiz <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20 py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-black">
                İ
              </div>
              <span>İşyer</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs sm:max-w-none">
              İşletmeler için ücretsiz dijital vitrin ve online randevu platformu
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-col items-center sm:items-end gap-1">
              <span>© {new Date().getFullYear()} İşyer</span>
              <Link
                href="https://merttopal.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                merttopal.com.tr
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db";
import { bizUrl } from "@/lib/url";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Scissors, Stethoscope, UtensilsCrossed,
  ArrowRight, Building2, CheckCircle2, QrCode, Images,
  MessageCircle, Users, Globe, Sparkles, Zap,
  ChevronRight,
} from "lucide-react";
import type { Business } from "@/types";

export const metadata: Metadata = {
  title: "İşyer — İşletmenize Ücretsiz Dijital Vitrin ve Online Randevu Sistemi",
  description:
    "Berber, kuaför, klinik, restoran ve her türlü işletme için ücretsiz online randevu sistemi. SEO uyumlu işletme sayfası, WhatsApp bildirimleri, QR menü ve galeri desteği. Hemen başlayın, sonsuza kadar ücretsiz.",
  keywords:
    "online randevu sistemi, ücretsiz randevu uygulaması, berber randevu, kuaför randevu, işletme yönetimi, dijital vitrin, QR menü, randevu al",
  openGraph: {
    title: "İşyer — İşletmenize Ücretsiz Dijital Vitrin",
    description:
      "Online randevu, QR menü, müşteri sayfası ve daha fazlası. Dakikalar içinde kurulum — sonsuza kadar ücretsiz.",
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

const FEATURES = [
  {
    icon: Calendar,
    title: "7/24 Online Randevu",
    desc: "Müşterileriniz gece yarısı bile randevu alabilir. Onay, iptal ve hatırlatmalar otomatik.",
    badge: null,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Globe,
    title: "SEO Uyumlu Sayfa",
    desc: "İşletmenize özel alan adı. Google'da üst sıralara çıkmanızı sağlayan teknik altyapı.",
    badge: null,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Bildirimleri",
    desc: "Randevu alındığında müşterinize anında WhatsApp bildirimi. Detay linki otomatik eklenir.",
    badge: null,
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: Users,
    title: "Personel Yönetimi",
    desc: "Her personel için ayrı çalışma saati, hizmet listesi ve randevu takvimi.",
    badge: null,
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: QrCode,
    title: "QR Menü",
    desc: "Masaya QR kod bırakın, müşterileriniz menüye anında ulaşsın. Güncelleme anlık yansır.",
    badge: "Yakında",
    gradient: "from-pink-500 to-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: Images,
    title: "Galeri",
    desc: "İşletmenizin atmosferini fotoğraflarla sergileyin. Müşteriler gelmeden önce görsün.",
    badge: "Yakında",
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Hesabınızı Oluşturun",
    desc: "Admin paneline giriş yapın ve birkaç dakika içinde işletmenizi tanımlayın. Kredi kartı gerekmez.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Sayfanızı Kurun",
    desc: "Logo, hizmetler, personel ve çalışma saatlerinizi ekleyin. Tam kontrol sizde.",
    icon: Zap,
  },
  {
    n: "03",
    title: "Paylaşın ve Büyüyün",
    desc: "İşletme linkinizi paylaşın, müşteriler randevu almaya başlasın. Siz sadece işinize bakın.",
    icon: ArrowRight,
  },
];

const FREE_ITEMS = [
  "Sınırsız randevu",
  "İşletmeye özel alan adı",
  "WhatsApp bildirimleri",
  "SEO optimizasyonlu sayfa",
  "Logo ve favicon yükleme",
  "Personel ve hizmet yönetimi",
  "Mobil uyumlu tasarım",
  "QR Menü (çok yakında)",
];

export default async function HomePage() {
  const businesses = await db<Business>("businesses")
    .where({ status: "active" })
    .orderBy("name");

  const activeCount = businesses.length;

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero Section ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          {/* Backdrop Glow Elements */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-glow" />
            <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px]" />
            <div className="absolute left-0 top-1/2 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
          </div>

          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column (Text content) */}
              <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
                {/* Eyebrow badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <span>Tamamen Ücretsiz · Anında Kurulum</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15]">
                  İşletmenize Özel <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                    Dijital Vitrin
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Online randevu, QR menü, galeri ve SEO uyumlu sayfa — hepsi bir arada.
                  Kurulumu sadece 5 dakika, kullanımı <span className="font-semibold text-foreground underline decoration-indigo-500 decoration-2">sonsuza kadar ücretsiz</span>.
                </p>

                {/* Call to Actions */}
                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 w-full sm:w-auto">
                  <Button size="lg" asChild className="h-14 gap-2 rounded-2xl px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-300 transform hover:-translate-y-0.5">
                    <Link href="/admin/login">
                      Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 gap-2 rounded-2xl px-8 text-base border-border hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 transform hover:-translate-y-0.5">
                    <Link href="#nasil-calisir">
                      Nasıl Çalışır?
                    </Link>
                  </Button>
                </div>

                {/* Trust Signals */}
                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Kredi Kartı Gerekmez</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Taahhüt / Sözleşme Yok</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Reklamsız Deneyim</span>
                </div>
              </div>

              {/* Right Column (Visual Mockup) */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                {/* Visual frame with soft glowing shadows */}
                <div className="relative w-full max-w-[440px] aspect-[4/3] sm:aspect-square md:max-w-[500px] lg:max-w-none rounded-2xl border border-white/10 dark:border-white/5 bg-gradient-to-b from-white/10 to-white/5 dark:from-black/20 dark:to-black/10 p-2.5 shadow-2xl backdrop-blur-md">
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-80" />
                  
                  {/* Mockup Image */}
                  <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-card shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/hero-mockup.png" 
                      alt="İşyer Dijital Vitrin Arayüzü" 
                      className="h-full w-full object-cover select-none"
                    />
                  </div>

                  {/* Floating glassmorphic widget 1 */}
                  <div className="absolute -left-6 top-[20%] animate-float p-3.5 rounded-xl border border-border/80 bg-background/90 shadow-lg backdrop-blur-md flex items-center gap-3.5 max-w-[210px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">Randevu Onaylandı</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Salih U. - Saç Kesimi</p>
                    </div>
                  </div>

                  {/* Floating glassmorphic widget 2 */}
                  <div className="absolute -right-6 bottom-[20%] animate-float-delayed p-3.5 rounded-xl border border-border/80 bg-background/90 shadow-lg backdrop-blur-md flex items-center gap-3.5 max-w-[220px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">Yeni Ziyaretçi</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Sayfanız 180 kez görüntülendi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Block */}
            {activeCount > 0 && (
              <div className="mt-24 sm:mt-28">
                <div className="mx-auto grid max-w-4xl grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border dark:bg-zinc-800 shadow-lg backdrop-blur">
                  {[
                    { val: `${activeCount}+`, label: "Aktif İşletme" },
                    { val: "7/24",            label: "Online Randevu" },
                    { val: "0₺",             label: "Sonsuza Kadar Ücretsiz" },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-background/90 px-4 py-6 text-center hover:bg-accent/40 transition-colors">
                      <dd className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-4xl">{val}</dd>
                      <dt className="mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Nasıl Çalışır Section ───────────────────────────────────── */}
        <section id="nasil-calisir" className="py-24 relative overflow-hidden bg-muted/30 border-y">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-60" />
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Basit Süreç</p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Sadece 3 Adımda Hazır</h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Karışık kurulumlar olmadan işletmenizi hemen online randevuya açın.
              </p>
            </div>
            
            <div className="relative grid gap-8 sm:grid-cols-3">
              {/* Connecting line on desktop */}
              <div className="pointer-events-none absolute left-1/2 top-10 hidden h-[2px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 border hover:border-indigo-500/20 hover:bg-background shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background border-2 border-indigo-500/20 shadow-md group-hover:scale-110 transition-transform">
                      <span className="absolute -right-2 -top-2 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                        {step.n.replace("0", "")}
                      </span>
                      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="mb-2.5 text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Özellikler Section ─────────────────────────────────────────── */}
        <section id="ozellikler" className="py-24 relative overflow-hidden">
          <div className="pointer-events-none absolute right-1/4 bottom-10 -z-10 h-72 w-72 rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Çözümlerimiz</p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Her İhtiyacınız İçin Akıllı Çözümler</h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-base">
                Sektörünüz ne olursa olsun, işletmenizi güçlendirecek ve operasyonlarınızı kolaylaştıracak tüm araçlar burada.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group relative flex flex-col gap-5 rounded-2xl border bg-card/60 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    {f.badge && (
                      <span className="absolute right-4 top-4 rounded-full bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {f.badge}
                      </span>
                    )}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Ücretsiz Vurgu Section (Bento Box Redesign) ────────────────── */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-[1px] shadow-2xl">
              <div className="rounded-[23px] bg-gradient-to-br from-zinc-950 via-indigo-950 to-zinc-950 px-8 py-14 sm:px-12 md:p-16 text-white relative overflow-hidden">
                {/* Background glows */}
                <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
                <div className="absolute left-10 bottom-0 -z-10 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px]" />

                <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-7">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-indigo-300">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                      Tamamen Ücretsiz Sistem
                    </div>
                    <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 leading-tight">
                      Başlamak ve büyümek için <br />
                      <span className="bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">hiçbir ücret ödemeyin</span>
                    </h2>
                    <p className="text-zinc-300 text-base mb-8 leading-relaxed max-w-lg">
                      İşyer, küçük ve orta ölçekli işletmelerin dijital dünyaya kolayca entegre olabilmesi için geliştirildi. 
                      Sözleşme yok, kurulum bedeli yok, sürpriz faturalar yok.
                    </p>
                    <Button
                      size="lg"
                      className="h-14 gap-2 rounded-2xl bg-white px-8 text-base font-bold text-zinc-950 hover:bg-zinc-100 shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      asChild
                    >
                      <Link href="/admin/login">
                        Hemen Ücretsiz Katıl <ChevronRight className="h-4 w-4 text-zinc-950" />
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="lg:col-span-5">
                    <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
                      {FREE_ITEMS.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Aktif İşletmeler Section ─────────────────────────────────── */}
        {businesses.length > 0 && (
          <section id="isletmeler" className="py-24 bg-muted/10 border-t">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-16 text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Keşfedin</p>
                <h2 className="text-3xl font-extrabold sm:text-4xl">Platformumuzu Kullanan İşletmeler</h2>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Siz de dijital vitrinizi oluşturun ve bu listedeki yerinizi alın.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((biz) => {
                  const Icon = CATEGORY_ICONS[biz.category] ?? Building2;
                  return (
                    <Link
                      key={biz.id}
                      href={bizUrl(biz.slug, "/")}
                      className="group flex items-center gap-4 rounded-2xl border bg-card p-4.5 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 overflow-hidden ring-1 ring-border group-hover:scale-105 transition-transform">
                        {biz.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{biz.name}</p>
                        <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                          {biz.category}
                        </span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/60 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                        <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Son CTA Section ─────────────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden border-t">
          {/* Decorative glowing blobs */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
              Müşterileriniz <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Sizi Bekliyor
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 text-base sm:text-lg max-w-md mx-auto">
              5 dakika içinde işletme sayfanızı oluşturun, online randevu almaya başlayın.
            </p>
            <Button size="lg" asChild className="h-14 gap-2 rounded-2xl px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 transform hover:-translate-y-0.5">
              <Link href="/admin/login">
                Hemen Başla — Ücretsiz <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Calendar className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" />
              <span>İşyer</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs sm:max-w-none">
              İşletmeler için ücretsiz dijital vitrin ve online randevu platformu
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-col items-center sm:items-end gap-1">
              <span>© {new Date().getFullYear()} İşyer</span>
              <Link href="https://merttopal.com.tr" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                merttopal.com.tr
              </Link>            
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

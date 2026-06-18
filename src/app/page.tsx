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
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
            <div className="absolute left-0 top-1/2 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 text-center">
            {/* Eyebrow pill */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Tamamen ücretsiz · Anında kurulum
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              İşletmenize Özel{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                Dijital Vitrin
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Online randevu, QR menü, galeri ve SEO uyumlu sayfa — hepsi bir arada.
              <br className="hidden sm:block" />
              Kurulum 5 dakika, kullanımı sonsuza kadar <strong className="text-foreground">ücretsiz</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="h-12 gap-2 rounded-xl px-7 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Link href="/admin/login">
                  Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 gap-2 rounded-xl px-7 text-base">
                <Link href="#nasil-calisir">
                  Nasıl Çalışır?
                </Link>
              </Button>
            </div>

            {/* Stats */}
            {activeCount > 0 && (
              <div className="mx-auto mt-16 grid max-w-sm grid-cols-3 divide-x rounded-2xl border bg-card/60 shadow-sm backdrop-blur">
                {[
                  { val: `${activeCount}+`, label: "Aktif İşletme" },
                  { val: "7/24",            label: "Online Randevu" },
                  { val: "0₺",             label: "Başlangıç Ücreti" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex flex-col items-center py-4">
                    <span className="text-2xl font-bold text-primary">{val}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Nasıl Çalışır ──────────────────────────────────────────── */}
        <section id="nasil-calisir" className="py-24 bg-muted/40">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Başlamak Kolay</p>
              <h2 className="text-4xl font-bold">3 Adımda Hazır</h2>
            </div>
            <div className="relative grid gap-8 sm:grid-cols-3">
              {/* Connecting line on desktop */}
              <div className="pointer-events-none absolute left-1/2 top-9 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="relative flex flex-col items-center text-center">
                    <div className="relative mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-background border-2 border-primary/20 shadow-md">
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {step.n.replace("0", "")}
                      </span>
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Özellikler ──────────────────────────────────────────────── */}
        <section id="ozellikler" className="py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Özellikler</p>
              <h2 className="text-4xl font-bold">Her İhtiyacınız Karşılandı</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Berber, kuaför, klinik, restoran — ne tür işletme olursa olsun ihtiyacınız olan her şey.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`group relative flex flex-col gap-4 rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${f.bg}`}
                  >
                    {f.badge && (
                      <span className="absolute right-4 top-4 rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border">
                        {f.badge}
                      </span>
                    )}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1.5 font-bold text-base">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Ücretsiz Vurgu ──────────────────────────────────────────── */}
        <section className="py-24 bg-muted/40">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-violet-600 p-1 shadow-2xl shadow-primary/30">
              <div className="rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-primary/95 to-violet-600/95 px-8 py-12 sm:px-12 text-primary-foreground">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Sonsuza kadar ücretsiz
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                      Başlamak için<br />hiçbir ödeme gerekmez
                    </h2>
                    <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                      İşyer, küçük ve orta ölçekli işletmelerin dijitalleşmesini
                      kolaylaştırmak için kuruldu. Plan yok, sözleşme yok, sürpriz ücret yok.
                    </p>
                    <Button
                      size="lg"
                      className="h-12 gap-2 rounded-xl bg-white px-7 text-base font-semibold text-primary hover:bg-white/90 shadow-lg"
                      asChild
                    >
                      <Link href="/admin/login">
                        Ücretsiz Hesap Oluştur <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {FREE_ITEMS.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 opacity-90" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Aktif İşletmeler ────────────────────────────────────────── */}
        {businesses.length > 0 && (
          <section id="isletmeler" className="py-24">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Platformumuzda</p>
                <h2 className="text-4xl font-bold">Aktif İşletmeler</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((biz) => {
                  const Icon = CATEGORY_ICONS[biz.category] ?? Building2;
                  return (
                    <Link
                      key={biz.id}
                      href={bizUrl(biz.slug, "/")}
                      className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 overflow-hidden ring-1 ring-border">
                        {biz.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">{biz.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground capitalize">{biz.category}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Son CTA ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-muted/40">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-4xl font-extrabold mb-4">
              Müşterileriniz{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Sizi Bekliyor
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              5 dakika içinde işletme sayfanızı oluşturun.
            </p>
            <Button size="lg" asChild className="h-12 gap-2 rounded-xl px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-shadow">
              <Link href="/admin/login">
                Hemen Başla — Ücretsiz <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              İşyer
            </div>
            <p className="text-sm text-muted-foreground text-center">
              İşletmeler için ücretsiz dijital vitrin ve online randevu platformu
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} İşyer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import db from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scissors, Stethoscope, UtensilsCrossed, Sparkles, ArrowRight, Building2, Search } from "lucide-react";
import type { Business } from "@/types";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  berber: Scissors,
  hastane: Stethoscope,
  restoran: UtensilsCrossed,
};

const CATEGORY_COLORS: Record<string, string> = {
  berber:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hastane:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  restoran: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export default async function HomePage() {
  const businesses = await db<Business>("businesses")
    .where({ status: "active" })
    .orderBy("name");

  const categories = [...new Set(businesses.map((b) => b.category))];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20 text-center">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="mb-4 flex justify-center">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              İşyer
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Berber, hastane, restoran ve daha fazlası için anında randevu alın.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="#isletmeler">
                  Randevu Al <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/randevu-sorgula">
                  <Search className="mr-2 h-4 w-4" /> Randevumu Sorgula
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Category pills */}
        {categories.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat] ?? Sparkles;
                  const color = CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";
                  return (
                    <div key={cat} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${color}`}>
                      <Icon className="h-3.5 w-3.5" /> {cat}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Business list */}
        <section id="isletmeler" className="pb-16 pt-4">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-bold">İşletmeler</h2>

            {businesses.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 opacity-30" />
                <p>Henüz aktif işletme yok.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((biz) => {
                  const Icon = CATEGORY_ICONS[biz.category] ?? Building2;
                  return (
                    <Card key={biz.id} className="group transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-base leading-tight">{biz.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="capitalize shrink-0">{biz.category}</Badge>
                        </div>
                        {biz.description && (
                          <CardDescription className="line-clamp-2 mt-1">{biz.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" asChild>
                          <Link href={`/isletme/${biz.slug}`}>
                            Randevu Al <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} İşyer. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}

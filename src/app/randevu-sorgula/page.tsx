"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Phone, Hash } from "lucide-react";
import type { AppointmentStatus } from "@/types";

const STATUS_MAP: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:          { label: "Onay Bekliyor", variant: "secondary" },
  approved:         { label: "Onaylandı",     variant: "default" },
  cancelled:        { label: "İptal Edildi",  variant: "outline" },
  cancel_requested: { label: "İptal Talebi", variant: "outline" },
};

interface AppointmentResult {
  id: number;
  business_name: string;
  service_name: string;
  customer_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  booking_code: string;
  created_at: string;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
  });
}

export default function RandevuSorgula() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [results, setResults] = useState<AppointmentResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(mode: "phone" | "code") {
    const value = mode === "phone" ? phone.trim() : code.trim();
    if (!value) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const param = mode === "phone" ? `phone=${encodeURIComponent(value)}` : `code=${encodeURIComponent(value.toUpperCase())}`;
      const res = await fetch(`/api/appointments?${param}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sorgu başarısız."); return; }
      if (data.length === 0) { setError("Randevu bulunamadı."); return; }
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Randevu Sorgula</h1>
            <p className="mt-2 text-muted-foreground">Telefon numarası veya randevu koduyla randevunuzu bulun.</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Tabs defaultValue="phone">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="phone" className="flex-1">
                    <Phone className="mr-2 h-4 w-4" /> Telefon ile
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex-1">
                    <Hash className="mr-2 h-4 w-4" /> Randevu Kodu ile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phone">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="phone-input">Telefon Numaranız</Label>
                      <Input
                        id="phone-input"
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && search("phone")}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => search("phone")} disabled={loading || !phone.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="code-input">Randevu Kodunuz</Label>
                      <Input
                        id="code-input"
                        placeholder="ABCD1234"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && search("code")}
                        className="font-mono uppercase"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => search("code")} disabled={loading || !code.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{results.length} randevu bulundu</p>
              {results.map((a) => {
                const s = STATUS_MAP[a.status];
                return (
                  <Card key={a.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{a.business_name}</CardTitle>
                          <CardDescription>{a.service_name}</CardDescription>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                        <span className="text-muted-foreground">Tarih</span>
                        <span className="font-medium">{formatDate(a.appointment_date)}</span>
                        <span className="text-muted-foreground">Saat</span>
                        <span className="font-medium">{a.start_time} – {a.end_time}</span>
                        <span className="text-muted-foreground">Randevu Kodu</span>
                        <span className="font-mono font-medium">{a.booking_code}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} İşyer
      </footer>
    </div>
  );
}

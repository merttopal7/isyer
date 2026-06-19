"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import { validatePhone } from "@/lib/slots";
import { PhoneInput } from "@/components/shared/phone-input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PhoneForm({ redirectUrl }: { redirectUrl: string }) {
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneValid = validatePhone(phone);
  const showPhoneError = phoneTouched && phone.length > 0 && !phoneValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phoneValid) {
      setError("Geçerli bir Türkiye telefon numarası girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Telefon kaydedilemedi.");
        return;
      }
      toast.success("Telefon numarası kaydedildi.");
      window.location.href = redirectUrl;
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon Numarası</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onValueChange={(raw) => { setPhone(raw); setPhoneTouched(true); }}
          onBlur={() => setPhoneTouched(true)}
          autoComplete="tel"
          required
          autoFocus
          className={cn(
            showPhoneError && "border-destructive focus-visible:ring-destructive/20",
            phoneValid && phone.length > 0 && "border-green-500 focus-visible:ring-green-500/20"
          )}
        />
        {showPhoneError ? (
          <p className="text-xs text-destructive">Format: 0 (5XX) XXX XXXX</p>
        ) : phoneValid && phone.length > 0 ? (
          <p className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" /> Geçerli
          </p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Phone className="mr-2 h-4 w-4" />
        )}
        Kaydet ve Devam Et
      </Button>
    </form>
  );
}

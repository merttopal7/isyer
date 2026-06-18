"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validatePhone } from "@/lib/slots";
import type { CustomerJwtPayload } from "@/types";

interface Props {
  onAuthenticated: (customer: CustomerJwtPayload) => void;
}

type Mode = "login" | "register";

export function StepAuth({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // login fields
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhoneTouched, setRegPhoneTouched] = useState(false);

  const regPhoneValid = validatePhone(regPhone);
  const showRegPhoneError = regPhoneTouched && regPhone.length > 0 && !regPhoneValid;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Giriş yapılamadı."); return; }
      onAuthenticated(data as CustomerJwtPayload);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!regPhoneValid) { setError("Geçerli bir Türkiye telefon numarası girin."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone, name: regName, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Kayıt olunamadı."); return; }
      onAuthenticated(data as CustomerJwtPayload);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    const redirect = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">Randevu Almak İçin Giriş Yapın</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Telefon numaranız ile kayıt olun veya giriş yapın.
        </p>
      </div>

      {/* Google login */}
      <Button type="button" variant="outline" className="mb-4 w-full gap-2" onClick={handleGoogleLogin}>
        <GoogleIcon />
        Google ile Giriş Yap
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">veya</span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg border p-1">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
            mode === "login"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LogIn className="h-4 w-4" /> Giriş Yap
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(""); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
            mode === "register"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserPlus className="h-4 w-4" /> Kayıt Ol
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-phone">Telefon Numarası</Label>
            <Input
              id="login-phone"
              type="tel"
              placeholder="05XX XXX XX XX"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password">Şifre</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Giriş Yap
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <button type="button" onClick={() => { setMode("register"); setError(""); }} className="text-primary underline-offset-2 hover:underline">
              Kayıt olun
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Ad Soyad</Label>
            <Input
              id="reg-name"
              placeholder="Ahmet Yılmaz"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-phone">Telefon Numarası</Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="05XX XXX XX XX"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              onBlur={() => setRegPhoneTouched(true)}
              autoComplete="tel"
              className={cn(
                showRegPhoneError && "border-destructive focus-visible:ring-destructive/20",
                regPhoneValid && regPhone.length > 0 && "border-green-500 focus-visible:ring-green-500/20"
              )}
              required
            />
            {showRegPhoneError ? (
              <p className="text-xs text-destructive">Geçerli bir Türkiye telefon numarası girin (05XXXXXXXXX).</p>
            ) : regPhoneValid && regPhone.length > 0 ? (
              <p className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Geçerli
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Şifre</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="En az 6 karakter"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Kayıt Ol ve Devam Et
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-primary underline-offset-2 hover:underline">
              Giriş yapın
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

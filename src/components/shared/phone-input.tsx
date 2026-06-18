"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay, extractPhoneDigits } from "@/lib/slots";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value"> {
  /** State'de tutulan ham rakamlar: "05340660662" */
  value: string;
  /** Değiştiğinde ham rakamları döner */
  onValueChange: (rawDigits: string) => void;
  className?: string;
}

/**
 * Auto-masked Türk telefon giriş alanı.
 * Kullanıcı sadece rakam yazar; "0 (5__) ___ ____" formatı otomatik eklenir.
 * State raw rakam tutar, görsel formatlanmış gösterir.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onValueChange, className, readOnly, ...props }, ref) {
    // State'deki raw rakamları gösterim formatına çevir
    const displayed = formatPhoneDisplay(value);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (readOnly) return;
      onValueChange(extractPhoneDigits(e.target.value));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (readOnly) return;
      // Backspace → her zaman son rakamı sil (maske karakterleri üzerinde takılmaz)
      if (e.key === "Backspace" && value.length > 0) {
        e.preventDefault();
        onValueChange(value.slice(0, -1));
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="0 (5__) ___ ____"
        value={displayed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className={cn("tabular-nums tracking-wide", className)}
        {...props}
      />
    );
  }
);

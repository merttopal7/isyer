"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import type { StaffOrResource } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  staff: StaffOrResource[];
  selected: StaffOrResource | null;
  onSelect: (s: StaffOrResource | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepStaff({ staff, selected, onSelect, onNext, onBack }: Props) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">Personel / Kaynak Seçin</h2>
      <p className="mb-6 text-sm text-muted-foreground">Tercih ettiğiniz personeli seçin veya fark etmez deyin.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* No preference option */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm",
            selected === null ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
          )}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <p className="font-semibold">Fark etmez</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">İlk müsait personel</p>
        </button>

        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm",
              selected?.id === s.id ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
            )}
          >
            <p className="font-semibold">{s.name}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
        <Button onClick={onNext}>
          Devam Et <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

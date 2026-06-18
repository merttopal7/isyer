"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CircleDollarSign, ArrowRight } from "lucide-react";
import type { Service } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  services: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
  onNext: () => void;
}

export function StepService({ services, selected, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">Hizmet Seçin</h2>
      <p className="mb-6 text-sm text-muted-foreground">Randevu almak istediğiniz hizmeti seçin.</p>

      {services.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">Bu işletmede aktif hizmet bulunmuyor.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm",
              selected?.id === s.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "bg-card"
            )}
          >
            <p className="font-semibold">{s.name}</p>
            <div className="mt-2 flex gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {s.duration_minutes} dk
              </span>
              {s.price && (
                <span className="flex items-center gap-1">
                  <CircleDollarSign className="h-3.5 w-3.5" /> {s.price} ₺
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!selected}>
          Devam Et <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

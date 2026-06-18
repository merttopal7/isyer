"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-semibold">Sayfa yüklenemedi</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message ?? "Lütfen tekrar deneyin."}</p>
      </div>
      <Button size="sm" onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" /> Yenile
      </Button>
    </div>
  );
}

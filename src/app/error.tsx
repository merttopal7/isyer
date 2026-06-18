"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ?? "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">#{error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" /> Tekrar Dene
      </Button>
    </div>
  );
}

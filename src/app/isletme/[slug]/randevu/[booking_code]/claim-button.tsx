"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClaimButton({ appointmentId }: { appointmentId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function claim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/claim`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "İşlem başarısız.");
        return;
      }
      setClaimed(true);
      toast.success("Randevu hesabınıza kaydedildi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
        <BookmarkCheck className="h-4 w-4" />
        Hesabınıza kaydedildi
      </div>
    );
  }

  return (
    <Button onClick={claim} disabled={loading} className="w-full">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookmarkCheck className="mr-2 h-4 w-4" />}
      Hesabıma Kaydet
    </Button>
  );
}

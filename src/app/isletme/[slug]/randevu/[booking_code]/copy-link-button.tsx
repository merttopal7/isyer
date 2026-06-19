"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Randevu linki kopyalandı!");
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleCopy}>
      <Copy className="mr-2 h-4 w-4" />
      Linki Kopyala
    </Button>
  );
}

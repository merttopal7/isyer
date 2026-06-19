"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  businessId: number;
  businessUrl: string;
  menuUrl: string;
  businessName: string;
}

const STORAGE_KEY = (id: number) => `qr-generated-${id}`;

function QrCard({
  label,
  description,
  url,
  filename,
}: {
  label: string;
  description: string;
  url: string;
  filename: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).catch(() => toast.error("QR kodu render edilemedi."));
  }, [url]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 shadow-sm">
      <p className="font-semibold">{label}</p>
      <div className="rounded-xl border-2 border-border bg-white p-2.5 shadow-sm">
        <canvas ref={canvasRef} className="block" />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">{url}</span>
      </a>
      <p className="text-xs text-muted-foreground text-center">{description}</p>
      <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
        <Download className="h-4 w-4" />
        PNG İndir
      </Button>
    </div>
  );
}

export function QrKoduClient({ businessId, businessUrl, menuUrl, businessName }: Props) {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(businessId));
    if (saved === "true") setGenerated(true);
  }, [businessId]);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 300));
    localStorage.setItem(STORAGE_KEY(businessId), "true");
    setGenerated(true);
    setGenerating(false);
    toast.success("QR kodları oluşturuldu.");
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY(businessId));
    setGenerated(false);
  }

  const slug = businessName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-10">
      <div className="text-center">
        <h1 className="text-xl font-bold">QR Kodu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          İşletme sayfanızı ve menünüzü ziyaretçilerle paylaşmak için QR kodları oluşturun.
        </p>
      </div>

      {!generated ? (
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-10 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <QrCode className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">Henüz QR kodu oluşturulmadı</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aşağıdaki butona tıklayarak işletme sayfanız için QR kodlarını oluşturun.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2 px-6">
            {generating
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <QrCode className="h-4 w-4" />}
            QR Kodlarını Oluştur
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QrCard
              label="İşletme Sayfası"
              description="Ana işletme sayfasına yönlendirir."
              url={businessUrl}
              filename={`${slug}-isletme-qr.png`}
            />
            <QrCard
              label="Menü"
              description="Doğrudan menü sayfasına yönlendirir."
              url={menuUrl}
              filename={`${slug}-menu-qr.png`}
            />
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Sıfırla
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

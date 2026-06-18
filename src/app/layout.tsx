import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.isyer.com"),
  title: {
    default: "İşyer — Ücretsiz Dijital Vitrin ve Online Randevu",
    template: "%s | İşyer",
  },
  description:
    "Berber, kuaför, klinik ve her türlü işletme için ücretsiz online randevu sistemi. SEO uyumlu işletme sayfası, WhatsApp bildirimleri ve daha fazlası.",
  keywords: "online randevu, ücretsiz randevu sistemi, işletme sayfası, berber randevu, kuaför randevu",
  openGraph: {
    siteName: "İşyer",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

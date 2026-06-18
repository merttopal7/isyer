import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Sayfa bulunamadı</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </Button>
    </div>
  );
}

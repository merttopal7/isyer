"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, CalendarPlus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizPath } from "@/lib/url";

interface Props {
  slug: string;
  hasMap: boolean;
}

export function BusinessNav({ slug, hasMap }: Props) {
  const pathname = usePathname();

  const tabs = [
    { href: bizPath(slug, "/duyurular"), label: "Duyurular",  icon: Megaphone    },
    { href: bizPath(slug, "/randevu"),   label: "Randevu Al",  icon: CalendarPlus },
    ...(hasMap ? [{ href: bizPath(slug, "/konum"), label: "Konum", icon: MapPin }] : []),
  ];

  return (
    <nav className="border-b bg-background sticky top-14 z-40">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex">
          {tabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

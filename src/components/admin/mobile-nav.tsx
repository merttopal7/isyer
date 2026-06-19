"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import type { JwtPayload } from "@/types";

interface Features {
  bookingEnabled: boolean;
  announcementsEnabled: boolean;
  menuEnabled: boolean;
}

interface Props {
  session: JwtPayload;
  businessName?: string;
  phone?: string | null;
  pendingCount?: number;
  announcementCount?: number;
  features?: Features;
}

export function MobileNav({ session, businessName, phone, pendingCount, announcementCount, features }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç</span>
        </Button>
      } />
      <SheetContent side="left" className="w-72 p-0 sm:w-80">
        <AdminSidebar
          session={session}
          businessName={businessName}
          phone={phone}
          pendingCount={pendingCount}
          announcementCount={announcementCount}
          features={features}
          onNavigate={() => setOpen(false)}
          forceExpanded
        />
      </SheetContent>
    </Sheet>
  );
}

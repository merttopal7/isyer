"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import type { JwtPayload } from "@/types";

interface Props {
  session: JwtPayload;
  businessName?: string;
}

export function MobileNav({ session, businessName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç</span>
        </Button>
      } />
      <SheetContent side="left" className="w-60 p-0">
        <AdminSidebar session={session} businessName={businessName} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

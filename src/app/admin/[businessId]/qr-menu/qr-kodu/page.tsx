import { notFound } from "next/navigation";
import { headers } from "next/headers";
import db from "@/lib/db";
import type { Business } from "@/types";
import { QrKoduClient } from "./qr-kodu-client";
import { bizUrl } from "@/lib/url";

export default async function QrKoduPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const business = await db<Business>("businesses").where({ id: Number(businessId) }).first();
  if (!business) notFound();

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = `${proto}://${host}`;

  const businessUrl = bizUrl(business.slug, "/", origin);
  const menuUrl     = bizUrl(business.slug, "/kategoriler", origin);

  return (
    <QrKoduClient
      businessId={Number(businessId)}
      businessUrl={businessUrl}
      menuUrl={menuUrl}
      businessName={business.name}
    />
  );
}

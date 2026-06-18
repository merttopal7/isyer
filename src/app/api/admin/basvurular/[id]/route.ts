import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import type { BusinessApplication, Business, Customer } from "@/types";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ü/g, "u").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await db<Business>("businesses").where({ slug }).first()) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { id } = await params;
  const appId = Number(id);
  const { action, reject_reason } = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  }

  const application = await db<BusinessApplication>("business_applications")
    .where({ id: appId })
    .first();

  if (!application) return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
  if (application.status !== "pending") {
    return NextResponse.json({ error: "Bu başvuru zaten işleme alındı." }, { status: 409 });
  }

  if (action === "reject") {
    await db("business_applications")
      .where({ id: appId })
      .update({ status: "rejected", reject_reason: reject_reason?.trim() || null });
    return NextResponse.json({ ok: true });
  }

  // approve: işletme oluştur, müşteriye bağla
  const slug = await uniqueSlug(toSlug(application.business_name));

  const [business] = await db<Business>("businesses")
    .insert({
      name: application.business_name,
      slug,
      category: application.category,
      phone: application.phone,
      address: application.address,
      description: application.description,
      status: "active",
      booking_advance_days: 7,
    })
    .returning("*");

  await db<BusinessApplication>("business_applications")
    .where({ id: appId })
    .update({ status: "approved", business_id: business.id });

  await db<Customer>("customers")
    .where({ id: application.customer_id })
    .update({ business_id: business.id });

  return NextResponse.json({ ok: true, businessId: business.id });
}

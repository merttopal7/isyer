import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import type { BusinessApplication } from "@/types";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const application = await db<BusinessApplication>("business_applications")
    .where({ customer_id: session.customerId })
    .orderBy("created_at", "desc")
    .first();

  return NextResponse.json(application ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const existing = await db<BusinessApplication>("business_applications")
    .where({ customer_id: session.customerId })
    .whereIn("status", ["pending", "approved"])
    .first();

  if (existing) {
    return NextResponse.json(
      { error: "Zaten aktif veya bekleyen bir başvurunuz var." },
      { status: 409 }
    );
  }

  const { business_name, category, phone, address, description } = await req.json();

  if (!business_name?.trim() || !category?.trim()) {
    return NextResponse.json({ error: "İşletme adı ve kategori zorunludur." }, { status: 400 });
  }

  const [app] = await db<BusinessApplication>("business_applications")
    .insert({
      customer_id: session.customerId,
      business_name: business_name.trim(),
      category: category.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      description: description?.trim() || null,
      status: "pending",
    })
    .returning("*");

  return NextResponse.json(app, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Business } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const businesses =
    session.role === "platform_admin"
      ? await db<Business>("businesses").orderBy("created_at", "desc")
      : await db<Business>("businesses").where({ id: session.businessId }).limit(1);

  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, category, description, phone, address } = body;

  if (!name || !slug || !category) {
    return NextResponse.json({ error: "Ad, slug ve kategori zorunludur." }, { status: 400 });
  }

  const existing = await db<Business>("businesses").where({ slug }).first();
  if (existing) {
    return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
  }

  const [business] = await db<Business>("businesses")
    .insert({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      category,
      description: description ?? null,
      phone: phone ?? null,
      address: address ?? null,
      status: "active",
    })
    .returning("*");
  return NextResponse.json(business, { status: 201 });
}

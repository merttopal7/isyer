import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Business } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const { id } = await params;
    const bId = Number(id);
    const body = await req.json();

    const isPlatform = session.role === "platform_admin";
    const isOwner    = session.role === "business_admin" && session.businessId === bId;

    if (!isPlatform && !isOwner) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const SEO_FIELDS = ["meta_title", "meta_description", "meta_keywords"];
    const allowed = isPlatform
      ? ["name", "slug", "category", "description", "phone", "address", "status", "map_embed", "booking_advance_days", "slot_interval_minutes", ...SEO_FIELDS]
      : ["name", "slug", "description", "phone", "address", "map_embed", "booking_advance_days", "slot_interval_minutes", ...SEO_FIELDS];

    const updates: Partial<Business> = {};
    for (const key of allowed) {
      if (key in body) (updates as Record<string, unknown>)[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    await db<Business>("businesses").where({ id: bId }).update(updates);
    const updated = await db<Business>("businesses").where({ id: bId }).first();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/businesses/[id]:", err);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { id } = await params;
  await db("businesses").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}

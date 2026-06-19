import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { MenuItem } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const item = await db<MenuItem>("menu_items").where({ id: Number(id) }).first();
  if (!item) return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== item.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, price, is_available, category_id } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (price !== undefined) updates.price = price != null && price !== "" ? Number(price) : null;
  if (is_available !== undefined) updates.is_available = Boolean(is_available);
  if (category_id !== undefined) updates.category_id = Number(category_id);

  const [updated] = await db<MenuItem>("menu_items")
    .where({ id: Number(id) })
    .update(updates)
    .returning("*");

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const item = await db<MenuItem>("menu_items").where({ id: Number(id) }).first();
  if (!item) return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== item.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await db("menu_items").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}

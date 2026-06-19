import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { MenuCategory } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const category = await db<MenuCategory>("menu_categories").where({ id: Number(id) }).first();
  if (!category) return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== category.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, is_published } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (is_published !== undefined) updates.is_published = Boolean(is_published);

  const [updated] = await db<MenuCategory>("menu_categories")
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
  const category = await db<MenuCategory>("menu_categories").where({ id: Number(id) }).first();
  if (!category) return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== category.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await db("menu_categories").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}

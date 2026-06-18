import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { StaffOrResource } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const staff = await db<StaffOrResource>("staff_or_resources").where({ id: Number(id) }).first();
  if (!staff) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== staff.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["name", "is_active"];
  const updates: Partial<StaffOrResource> = {};
  for (const key of allowed) {
    if (key in body) (updates as Record<string, unknown>)[key] = body[key];
  }

  await db<StaffOrResource>("staff_or_resources").where({ id: Number(id) }).update(updates);
  const updated = await db<StaffOrResource>("staff_or_resources").where({ id: Number(id) }).first();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const staff = await db<StaffOrResource>("staff_or_resources").where({ id: Number(id) }).first();
  if (!staff) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== staff.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await db("staff_or_resources").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}

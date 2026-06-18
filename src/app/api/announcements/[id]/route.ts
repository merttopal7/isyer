import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Announcement } from "@/types";

async function getAnnouncement(id: number) {
  return db<Announcement>("announcements").where({ id }).first();
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const ann = await getAnnouncement(Number(id));
  if (!ann) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  if (session.role !== "platform_admin" && session.businessId !== ann.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const updates: Partial<Announcement> = {};
  if (body.title   !== undefined) updates.title        = String(body.title).trim();
  if (body.content !== undefined) updates.content      = String(body.content).trim();
  if (body.is_pinned    !== undefined) updates.is_pinned    = Boolean(body.is_pinned);
  if (body.is_published !== undefined) updates.is_published = Boolean(body.is_published);

  await db<Announcement>("announcements").where({ id: Number(id) }).update(updates);
  const updated = await getAnnouncement(Number(id));
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const ann = await getAnnouncement(Number(id));
  if (!ann) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  if (session.role !== "platform_admin" && session.businessId !== ann.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await db<Announcement>("announcements").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}

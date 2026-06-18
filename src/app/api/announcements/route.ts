import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Announcement } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const businessId = Number(searchParams.get("businessId"));
  const all = searchParams.get("all") === "1"; // admin: include unpublished

  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const query = db<Announcement>("announcements").where({ business_id: businessId });
  if (!all) query.where({ is_published: true });

  const rows = await query.orderByRaw("is_pinned DESC, created_at DESC");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, title, content, is_pinned = false, is_published = true } = body;

  if (!business_id || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "İşletme, başlık ve içerik zorunludur." }, { status: 400 });
  }
  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const [row] = await db<Announcement>("announcements")
    .insert({
      business_id: Number(business_id),
      title: title.trim(),
      content: content.trim(),
      is_pinned: Boolean(is_pinned),
      is_published: Boolean(is_published),
    })
    .returning("*");
  return NextResponse.json(row, { status: 201 });
}

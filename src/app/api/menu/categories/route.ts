import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { MenuCategory } from "@/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const businessId = Number(searchParams.get("businessId"));
  const all = searchParams.get("all") === "1";

  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const query = db<MenuCategory>("menu_categories").where({ business_id: businessId });
  if (!all) query.where({ is_published: true });

  const rows = await query.orderBy("created_at", "asc");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, name, description, is_published = true } = body;

  if (!business_id || !name?.trim()) {
    return NextResponse.json({ error: "İşletme ve kategori adı zorunludur." }, { status: 400 });
  }
  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  let base = slugify(name.trim()) || "kategori";
  let slug = base;
  let i = 2;
  while (await db("menu_categories").where({ business_id: Number(business_id), slug }).first()) {
    slug = `${base}-${i++}`;
  }

  const [row] = await db<MenuCategory>("menu_categories")
    .insert({
      business_id: Number(business_id),
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      is_published: Boolean(is_published),
    })
    .returning("*");

  return NextResponse.json(row, { status: 201 });
}

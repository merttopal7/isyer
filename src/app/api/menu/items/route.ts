import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { MenuItem } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const businessId = searchParams.get("businessId");
  const all = searchParams.get("all") === "1";

  if (!categoryId && !businessId) {
    return NextResponse.json({ error: "categoryId veya businessId gerekli." }, { status: 400 });
  }

  const query = db<MenuItem>("menu_items");
  if (categoryId) query.where({ category_id: Number(categoryId) });
  if (businessId) query.where({ business_id: Number(businessId) });
  if (!all) query.where({ is_available: true });

  const rows = await query.orderBy("created_at", "asc");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, category_id, name, description, price, is_available = true } = body;

  if (!business_id || !category_id || !name?.trim()) {
    return NextResponse.json({ error: "İşletme, kategori ve ürün adı zorunludur." }, { status: 400 });
  }
  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const [row] = await db<MenuItem>("menu_items")
    .insert({
      business_id: Number(business_id),
      category_id: Number(category_id),
      name: name.trim(),
      description: description?.trim() || null,
      price: price != null && price !== "" ? Number(price) : null,
      is_available: Boolean(is_available),
    })
    .returning("*");

  return NextResponse.json(row, { status: 201 });
}

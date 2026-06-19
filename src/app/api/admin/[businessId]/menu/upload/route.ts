import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "businesses");

const SPECS = {
  category: { width: 1200, height: 600, quality: 85, fit: "cover" as const },
  item:     { width: 800,  height: 800, quality: 85, fit: "cover" as const },
} as const;

type MenuImageType = keyof typeof SPECS;

async function processImage(buffer: Buffer, type: MenuImageType): Promise<{ data: Buffer; ext: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const spec = SPECS[type];
    const data = await sharp(buffer)
      .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: true })
      .webp({ quality: spec.quality, effort: 4 })
      .toBuffer();
    return { data, ext: "webp" };
  } catch {
    return { data: buffer, ext: "bin" };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { businessId } = await params;
  const bId = Number(businessId);

  const isPlatform = session.role === "platform_admin";
  const isOwner    = session.role === "business_admin" && session.businessId === bId;
  if (!isPlatform && !isOwner) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const formData = await req.formData();
  const type     = formData.get("type") as string;
  const entityId = Number(formData.get("id"));
  const file     = formData.get("file") as File | null;

  if (!type || !["category", "item"].includes(type)) {
    return NextResponse.json({ error: "Geçersiz tür (category veya item)." }, { status: 400 });
  }
  if (!entityId) {
    return NextResponse.json({ error: "Kayıt ID gerekli." }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Dosya 5 MB'dan büyük olamaz." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Sadece görsel dosyaları kabul edilir." }, { status: 400 });
  }

  const table = type === "category" ? "menu_categories" : "menu_items";
  const entity = await db(table).where({ id: entityId, business_id: bId }).first();
  if (!entity) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, ext } = await processImage(buffer, type as MenuImageType);

  const dir = path.join(UPLOAD_DIR, String(bId), "menu");
  await fs.mkdir(dir, { recursive: true });

  for (const e of ["webp", "bin"]) {
    await fs.unlink(path.join(dir, `${type}-${entityId}.${e}`)).catch(() => {});
  }

  const filename = `${type}-${entityId}.${ext}`;
  await fs.writeFile(path.join(dir, filename), data);

  const dbPath = `/uploads/businesses/${bId}/menu/${filename}?v=${Date.now()}`;
  await db(table).where({ id: entityId }).update({ image_url: dbPath });

  return NextResponse.json({ url: dbPath });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { businessId } = await params;
  const bId = Number(businessId);

  const isPlatform = session.role === "platform_admin";
  const isOwner    = session.role === "business_admin" && session.businessId === bId;
  if (!isPlatform && !isOwner) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { type, id } = await req.json();
  if (!type || !["category", "item"].includes(type)) {
    return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });

  const dir = path.join(UPLOAD_DIR, String(bId), "menu");
  for (const e of ["webp", "bin"]) {
    await fs.unlink(path.join(dir, `${type}-${id}.${e}`)).catch(() => {});
  }

  const table = type === "category" ? "menu_categories" : "menu_items";
  await db(table).where({ id: Number(id) }).update({ image_url: null });

  return NextResponse.json({ ok: true });
}

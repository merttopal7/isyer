import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import type { Business } from "@/types";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "businesses");

const SPECS = {
  logo:    { width: 800, height: 800, quality: 93, fit: "inside" as const },
  favicon: { width: 64,  height: 64,  quality: 90, fit: "cover"  as const },
} as const;

type ImageType = keyof typeof SPECS;

async function processImage(buffer: Buffer, type: ImageType): Promise<{ data: Buffer; ext: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const spec = SPECS[type];
    const data = await sharp(buffer)
      .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: true })
      .webp({ quality: spec.quality, effort: 4 })
      .toBuffer();
    return { data, ext: "webp" };
  } catch {
    // Sharp not available (e.g. Windows dev env) — save original as-is
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
  const type = formData.get("type") as string;
  const file = formData.get("file") as File | null;

  if (!type || !["logo", "favicon"].includes(type)) {
    return NextResponse.json({ error: "Geçersiz tür (logo veya favicon)." }, { status: 400 });
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, ext } = await processImage(buffer, type as ImageType);

  const dir = path.join(UPLOAD_DIR, String(bId));
  await fs.mkdir(dir, { recursive: true });

  // Remove old file regardless of extension before writing new one
  for (const e of ["webp", "bin"]) {
    await fs.unlink(path.join(dir, `${type}.${e}`)).catch(() => {});
  }

  const filename = `${type}.${ext}`;
  await fs.writeFile(path.join(dir, filename), data);

  // Version in the URL busts browser caches (especially for favicons which are cached aggressively).
  // The uploads route ignores query params when reading the file from disk.
  const dbPath = `/uploads/businesses/${bId}/${filename}?v=${Date.now()}`;
  const field = type === "logo" ? "logo_url" : "favicon_url";
  await db<Business>("businesses").where({ id: bId }).update({ [field]: dbPath });

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

  const { type } = await req.json();
  if (!type || !["logo", "favicon"].includes(type)) {
    return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
  }

  const dir = path.join(UPLOAD_DIR, String(bId));
  for (const e of ["webp", "bin"]) {
    await fs.unlink(path.join(dir, `${type}.${e}`)).catch(() => {});
  }

  const field = type === "logo" ? "logo_url" : "favicon_url";
  await db<Business>("businesses").where({ id: bId }).update({ [field]: null });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".bin":  "application/octet-stream",
};

// Nginx subdomains için path: ali-berber.isyer.com/uploads/... → /isletme/ali-berber/uploads/...
// slug parametresi yoksayılır, dosya /public/uploads/... konumundan serve edilir.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  const { path: segments } = await params;

  // Güvenlik: path traversal engelle
  const normalized = segments.map((s) => s.replace(/\.\./g, "")).filter(Boolean);
  const filePath = path.join(process.cwd(), "public", "uploads", ...normalized);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

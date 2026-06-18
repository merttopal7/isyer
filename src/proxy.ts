import { NextRequest, NextResponse } from "next/server";

const PROD = process.env.NEXT_PUBLIC_PRODUCTION === "true";
const DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || process.env.MAIN_DOMAIN || "xx.com";

export function proxy(request: NextRequest) {
  if (!PROD) return NextResponse.next();

  const host = request.headers.get("host") || "";
  const forwardedHost = request.headers.get("x-forwarded-host") || host;
  const hostname = forwardedHost.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // slug.alanadi.com/[sayfa] → /isletme/slug/[sayfa] olarak yeniden yaz
  if (hostname.endsWith(`.${DOMAIN}`) && hostname !== `www.${DOMAIN}`) {
    const slug = hostname.slice(0, -(DOMAIN.length + 1));
    if (!slug || slug === "www") return NextResponse.next();

    // Platform genelinde sayfalar ve sistem yolları — rewrite yapma
    if (
      pathname.startsWith("/isletme/") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/admin/") ||
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico" ||
      pathname === "/randevu-sorgula" ||
      pathname === "/randevularim" ||
      pathname.startsWith("/giris/telefon")
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/isletme/${slug}` + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  // alanadi.com/isletme/[slug]/[sayfa] → slug.alanadi.com/[sayfa] yönlendir (301)
  if (hostname === DOMAIN || hostname === `www.${DOMAIN}`) {
    const m = pathname.match(/^\/isletme\/([^/]+)(\/.*)?$/);
    if (m) {
      const [, slug, rest = "/"] = m;
      // nextUrl.clone() iç portu (3000) taşır — dışarıya görünen protokol/host ile inşa et
      const proto = request.headers.get("x-forwarded-proto") ?? "https";
      const search = request.nextUrl.search; // query string'i koru (?redirect=... gibi)
      return NextResponse.redirect(`${proto}://${slug}.${DOMAIN}${rest}${search}`, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};

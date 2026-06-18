const PROD = process.env.NEXT_PUBLIC_PRODUCTION === "true";
const DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "";

function normPath(page: string): string {
  return page && !page.startsWith("/") ? `/${page}` : page;
}

/**
 * href/redirect için iş yeri sayfası içi yolu döner.
 * PRODUCTION=true → /[sayfa]  (subdomain'de göreli)
 * PRODUCTION=false → /isletme/[slug]/[sayfa]
 */
export function bizPath(slug: string, page = ""): string {
  const p = normPath(page);
  return PROD ? (p || "/") : `/isletme/${slug}${p}`;
}

/**
 * Paylaşım için mutlak URL döner (WhatsApp, yönetici paneli vb.).
 * PRODUCTION=true  → https://[slug].alanadi.com/[sayfa]
 * PRODUCTION=false → [origin]/isletme/[slug]/[sayfa]
 */
export function bizUrl(slug: string, page = "", origin = ""): string {
  const p = normPath(page);
  if (PROD && DOMAIN) return `https://${slug}.${DOMAIN}${p || "/"}`;
  return `${origin}/isletme/${slug}${p}`;
}

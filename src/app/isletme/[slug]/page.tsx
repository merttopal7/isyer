import { redirect } from "next/navigation";
import { bizPath } from "@/lib/url";

export default async function IsletmePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(bizPath(slug, "/duyurular"));
}

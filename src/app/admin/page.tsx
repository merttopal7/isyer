import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminIndexPage() {
  const session = await getSession();

  if (!session) redirect("/admin/login");

  if (session.role === "platform_admin") {
    redirect("/admin/isletmeler");
  }

  if (session.businessId) {
    redirect(`/admin/${session.businessId}/randevular`);
  }

  redirect("/admin/login");
}

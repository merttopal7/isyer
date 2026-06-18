import { redirect } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.isyer.com";

export default function HesabimRedirect() {
  redirect(`${APP_URL}/hesabim`);
}

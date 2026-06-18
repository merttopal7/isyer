import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { signCustomerToken, setCustomerCookieOptions } from "@/lib/customer-auth";
import type { Customer } from "@/types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

interface GoogleProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/giris?error=google_cancelled`);
  }

  // Decode state
  let nonce: string;
  let redirect: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    nonce = decoded.nonce;
    redirect = decoded.redirect ?? "/";
  } catch {
    return NextResponse.redirect(`${APP_URL}/giris?error=invalid_state`);
  }

  // Verify nonce (CSRF protection)
  const storedNonce = req.cookies.get("oauth_nonce")?.value;
  if (!storedNonce || storedNonce !== nonce) {
    return NextResponse.redirect(`${APP_URL}/giris?error=invalid_state`);
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${APP_URL}/giris?error=token_exchange`);
  }

  const tokens = await tokenRes.json();

  // Get Google user profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(`${APP_URL}/giris?error=profile_fetch`);
  }

  const profile: GoogleProfile = await profileRes.json();

  // Find or create customer
  let customer = await db<Customer>("customers").where({ google_id: profile.id }).first();

  if (!customer) {
    // Check if email already registered manually
    if (profile.email) {
      customer = await db<Customer>("customers").where({ email: profile.email }).first();
    }

    if (customer) {
      // Link Google account to existing customer
      await db<Customer>("customers").where({ id: customer.id }).update({ google_id: profile.id });
    } else {
      // Create new customer
      const [created] = await db<Customer>("customers")
        .insert({
          google_id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: null,
          password_hash: null,
        })
        .returning("*");
      customer = created as Customer;
    }
  }

  const token = signCustomerToken({
    customerId: customer.id,
    phone: customer.phone,
    name: customer.name,
  });

  const clearNonce = { name: "oauth_nonce", value: "", maxAge: 0, path: "/" };

  // Telefon numarası yoksa önce telefon toplama sayfasına yönlendir
  if (!customer.phone) {
    const phoneRedirect = `${APP_URL}/giris/telefon?redirect=${encodeURIComponent(redirect)}`;
    const res = NextResponse.redirect(phoneRedirect);
    res.cookies.set(setCustomerCookieOptions(token));
    res.cookies.set(clearNonce);
    return res;
  }

  // redirect tam URL ise (subdomain'den geliyorsa) direkt kullan, yoksa ana domain'e ekle
  const finalUrl = redirect.startsWith("http") ? redirect : `${APP_URL}${redirect}`;
  const res = NextResponse.redirect(finalUrl);
  res.cookies.set(setCustomerCookieOptions(token));
  res.cookies.set(clearNonce);
  return res;
}

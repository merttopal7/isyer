import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth yapılandırılmamış." }, { status: 500 });
  }

  const redirect = req.nextUrl.searchParams.get("redirect") ?? "/";
  const nonce = randomBytes(16).toString("hex");

  // Encode both nonce and redirect in state
  const state = Buffer.from(JSON.stringify({ nonce, redirect })).toString("base64url");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);

  // Store nonce in httpOnly cookie to verify in callback (5 min TTL)
  res.cookies.set({
    name: "oauth_nonce",
    value: nonce,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return res;
}

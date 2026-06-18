import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import type { User } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
    }

    const user = await db<User>("users").where({ email }).first();
    if (!user) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, businessId: user.business_id },
    });

    response.cookies.set(setAuthCookie(token));
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

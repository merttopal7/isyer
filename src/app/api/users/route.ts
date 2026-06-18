import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import type { User } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const users = await db<User>("users")
    .select("id", "email", "role", "business_id", "created_at")
    .orderBy("created_at", "desc");

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { email, password, business_id } = await req.json();

  if (!email || !password || !business_id) {
    return NextResponse.json({ error: "E-posta, şifre ve işletme zorunludur." }, { status: 400 });
  }

  const existing = await db<User>("users").where({ email }).first();
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda." }, { status: 409 });
  }

  const password_hash = await hashPassword(password);

  const [id] = await db<User>("users").insert({
    email,
    password_hash,
    role: "business_admin",
    business_id: Number(business_id),
  });

  const user = await db<User>("users")
    .select("id", "email", "role", "business_id", "created_at")
    .where({ id })
    .first();

  return NextResponse.json(user, { status: 201 });
}

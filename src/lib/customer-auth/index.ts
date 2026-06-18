import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
export const CUSTOMER_COOKIE_NAME = "customer_token";

export interface CustomerJwtPayload {
  customerId: number;
  phone: string | null;
  name: string;
}

export async function hashCustomerPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyCustomerPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signCustomerToken(payload: CustomerJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" } as jwt.SignOptions);
}

export function verifyCustomerToken(token: string): CustomerJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function setCustomerCookieOptions(token: string) {
  return {
    name: CUSTOMER_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  };
}

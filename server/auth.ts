import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
};

function getSecretKey() {
  return new TextEncoder().encode(ENV.jwtSecret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const { userId, email, role } = payload as Record<string, unknown>;
    if (typeof userId !== "number" || typeof email !== "string" || typeof role !== "string") {
      return null;
    }
    return { userId, email, role };
  } catch {
    return null;
  }
}

import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SESSION_SECRET = process.env.ADMIN_SECRET || "kopitiam-admin-secret-change-me";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = scryptSync(password, salt, KEY_LENGTH);
  return timingSafeEqual(hashBuffer, derivedBuffer);
}

export function createSession(adminId: string): string {
  const expires = Date.now() + SESSION_DURATION;
  const payload = `${adminId}:${expires}`;
  const signature = scryptSync(payload, SESSION_SECRET, 32).toString("hex");
  return `${payload}:${signature}`;
}

export function validateSession(token: string): string | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [adminId, expiresStr, signature] = parts;
  const expires = parseInt(expiresStr, 10);

  if (Date.now() > expires) return null;

  const payload = `${adminId}:${expiresStr}`;
  const expectedSig = scryptSync(payload, SESSION_SECRET, 32).toString("hex");

  if (signature !== expectedSig) return null;

  return adminId;
}

export function getAdminFromRequest(request: NextRequest): string | null {
  const session = request.cookies.get("admin_session")?.value;
  if (!session) return null;
  return validateSession(session);
}

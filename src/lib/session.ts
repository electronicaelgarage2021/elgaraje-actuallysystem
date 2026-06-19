// Manejo de sesión sin estado (cookie firmada con JWT vía jose).
// Módulo PURO (sin next/headers ni "server-only") para que lo pueda usar
// tanto el proxy como los server actions.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "elgarage_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export type SessionPayload = { auth: true };

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function decryptSession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload?.auth === true ? { auth: true } : null;
  } catch {
    return null;
  }
}

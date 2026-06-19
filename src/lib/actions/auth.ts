"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, SESSION_DURATION_MS, encryptSession } from "@/lib/session";

// Rate limit básico en memoria (mitigación contra fuerza bruta).
// Se resetea en cold start; suficiente para este caso de uso.
let fails: number[] = [];
const MAX_FAILS = 5;
const WINDOW_MS = 5 * 60 * 1000;

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const now = Date.now();
  fails = fails.filter((t) => now - t < WINDOW_MS);

  if (fails.length >= MAX_FAILS) {
    return { error: "Demasiados intentos. Esperá unos minutos." };
  }

  const pin = String(formData.get("pin") || "").trim();
  const expected = process.env.APP_PIN;

  if (!expected || pin !== expected) {
    await new Promise((r) => setTimeout(r, 500)); // ralentiza fuerza bruta
    fails.push(now);
    return { error: "PIN incorrecto" };
  }

  fails = [];
  const token = await encryptSession({ auth: true });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(now + SESSION_DURATION_MS),
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

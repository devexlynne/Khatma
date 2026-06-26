import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { endSession, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const token = cookies().get(COOKIE_NAME)?.value;
  endSession(token);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return out;
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { userFromToken, isAdmin, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const row = db.prepare("SELECT value, updated_at FROM site_settings WHERE key='announcement'").get();
  return NextResponse.json({ message: row?.value || "", updatedAt: row?.updated_at || "" }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  if (!user || !isAdmin(user)) return NextResponse.json({ ok:false }, { status:403 });
  const { message } = await request.json();
  const clean = String(message || "").trim().slice(0, 500);
  if (!clean) return NextResponse.json({ ok:false }, { status:400 });
  const updatedAt = new Date().toISOString();
  db.prepare("INSERT INTO site_settings (key,value,updated_at) VALUES ('announcement',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(clean, updatedAt);
  return NextResponse.json({ ok:true, message:clean, updatedAt });
}

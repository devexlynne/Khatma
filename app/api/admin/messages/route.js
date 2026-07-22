export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { userFromToken, isAdmin, COOKIE_NAME } from "@/lib/auth";

function authorized() {
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  return Boolean(user && isAdmin(user));
}

export async function GET() {
  if (!authorized()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const messages = db.prepare("SELECT * FROM contact_messages ORDER BY status='new' DESC, created_at DESC LIMIT 200").all();
  return NextResponse.json({ messages });
}

export async function PATCH(request) {
  if (!authorized()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await request.json();
  const result = db.prepare("UPDATE contact_messages SET status='read', read_at=datetime('now') WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: result.changes === 1 });
}

export async function DELETE(request) {
  if (!authorized()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await request.json();
  const result = db.prepare("DELETE FROM contact_messages WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: result.changes === 1 });
}

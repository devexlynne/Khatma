export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { userFromToken, isAdmin, COOKIE_NAME } from "@/lib/auth";

function authorized() {
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  return user && isAdmin(user) ? user : null;
}

export async function GET() {
  if (!authorized()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const messages = db.prepare(
    `SELECT cm.*, u.full_name AS account_name, u.email AS account_email
       FROM contact_messages cm
       LEFT JOIN users u ON u.id = cm.submitted_by
      ORDER BY cm.status='new' DESC, cm.created_at DESC
      LIMIT 200`
  ).all();
  return NextResponse.json({ messages });
}

export async function PATCH(request) {
  const user = authorized();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id, action = "read", reply = "" } = await request.json();
  const messageId = Number(id);
  let result;
  if (action === "reply") {
    const cleanReply = String(reply || "").trim().slice(0, 2000);
    if (cleanReply.length < 2) return NextResponse.json({ error: "اكتب ردًا واضحًا أولًا" }, { status: 400 });
    result = db.prepare(
      "UPDATE contact_messages SET status='replied', admin_reply=?, replied_at=datetime('now'), replied_by=?, read_at=COALESCE(read_at, datetime('now')) WHERE id=?"
    ).run(cleanReply, user.id, messageId);
  } else {
    result = db.prepare("UPDATE contact_messages SET status='read', read_at=datetime('now') WHERE id=?").run(messageId);
  }
  return NextResponse.json({ ok: result.changes === 1 });
}

export async function DELETE(request) {
  if (!authorized()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await request.json();
  const result = db.prepare("DELETE FROM contact_messages WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: result.changes === 1 });
}

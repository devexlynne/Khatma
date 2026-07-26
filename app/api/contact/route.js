export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  const name = String(body.name || "").trim().slice(0, 80);
  const contact = String(body.contact || "").trim().slice(0, 120);
  const category = ["message", "suggestion", "problem", "question"].includes(body.category) ? body.category : "message";
  const message = String(body.message || "").trim().slice(0, 1500);
  if (!name || !contact || !message) return NextResponse.json({ error: "الاسم ووسيلة التواصل والرسالة مطلوبة" }, { status: 400 });
  if (message.length < 3) return NextResponse.json({ error: "الرسالة قصيرة جدًا" }, { status: 400 });
  db.prepare("INSERT INTO contact_messages (sender_name, contact_info, category, message) VALUES (?, ?, ?, ?)").run(name, contact, category, message);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import db from "@/lib/db";
import { COOKIE_NAME, userFromToken } from "@/lib/auth";
import { validateRealEmailAddress } from "@/lib/emailValidation";
import { getClientIp, lookupIpGeo } from "@/lib/geoip";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const country = String(body.country || "").trim().slice(0, 80);
  const category = ["message", "suggestion", "problem", "question"].includes(body.category) ? body.category : "message";
  const message = String(body.message || "").trim().slice(0, 1500);
  if (!name || !body.email || !phone || !country || !message) return NextResponse.json({ error: "الاسم والبريد الإلكتروني والهاتف والبلد والرسالة مطلوبة" }, { status: 400 });
  if (message.length < 3) return NextResponse.json({ error: "الرسالة قصيرة جدًا" }, { status: 400 });
  const emailCheck = await validateRealEmailAddress(body.email);
  if (!emailCheck.ok) return NextResponse.json({ error: "يرجى استخدام بريد إلكتروني حقيقي وقابل لاستقبال الرسائل" }, { status: 400 });
  const ipAddress = getClientIp(headers());
  const geo = await lookupIpGeo(ipAddress);
  const contact = `${emailCheck.email} · ${phone} · ${country}`;
  db.prepare(
    `INSERT INTO contact_messages
       (sender_name, contact_info, sender_email, phone, country, ip_address, ip_country, ip_city, category, message, submitted_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(name, contact, emailCheck.email, phone, country, ipAddress, geo.country, geo.city, category, message, user?.id || null);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { userFromToken, isAdmin, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const notifications = [];
  const announcement = db.prepare("SELECT value, updated_at FROM site_settings WHERE key='announcement'").get();
  if (announcement?.value) notifications.push({ id: `announcement-${announcement.updated_at}`, type: "announcement", title: "رسالة الموقع", message: announcement.value, createdAt: announcement.updated_at, url: "/" });

  const events = db.prepare(`SELECT j.id, j.number, j.status, j.participant_name, COALESCE(j.completed_at,j.reserved_at) AS event_at, k.id AS khatma_id, k.title
    FROM juz j JOIN khatmas k ON k.id=j.khatma_id
    WHERE k.owner_id=? AND (j.reserved_at IS NOT NULL OR j.completed_at IS NOT NULL)
    ORDER BY event_at DESC LIMIT 12`).all(user.id);
  events.forEach((event) => notifications.push({ id: `juz-${event.id}-${event.status}`, type: event.status, title: event.status === "completed" ? "تم إكمال جزء" : "تم حجز جزء", message: `${event.participant_name || "مشارك"} — الجزء ${event.number} في ختمة «${event.title}»`, createdAt: event.event_at, url: `/khatmas/${event.khatma_id}` }));

  if (isAdmin(user)) {
    db.prepare("SELECT id, sender_name, category, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 8").all().forEach((item) => notifications.push({ id: `contact-${item.id}`, type: "contact", title: item.category === "suggestion" ? "اقتراح جديد" : "رسالة جديدة للمشرف", message: `${item.sender_name}: ${item.message.slice(0,90)}`, createdAt: item.created_at, url: "/dashboard" }));
    db.prepare("SELECT id, title, created_at FROM khatmas ORDER BY created_at DESC LIMIT 5").all().forEach((item) => notifications.push({ id: `khatma-${item.id}`, type: "khatma", title: "ختمة أُنشئت", message: item.title, createdAt: item.created_at, url: `/khatmas/${item.id}` }));
  }

  notifications.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return NextResponse.json({ notifications: notifications.slice(0,20) }, { headers: { "Cache-Control": "no-store" } });
}

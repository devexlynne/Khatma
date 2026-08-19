export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import db from "@/lib/db";
import { COOKIE_NAME, userFromToken } from "@/lib/auth";
import { randomId } from "@/lib/ids";

const VISITOR_COOKIE = "khatma_visitor";

function cleanText(value, fallback = "") {
  const normalized = value == null || value === "" ? fallback : value;
  if (normalized == null) return null;
  return String(normalized).trim().slice(0, 500);
}

function getClientIp(headerList) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return headerList.get("x-real-ip") || headerList.get("cf-connecting-ip") || null;
}

export async function POST(req) {
  const cookieStore = cookies();
  const headerList = headers();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  const user = userFromToken(sessionToken);
  const existingVisitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitorId || randomId(12);

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const path = cleanText(body.path, "/").replace(/^https?:\/\/[^/]+/i, "") || "/";
  const referrer = cleanText(body.referrer || headerList.get("referer") || "", null);
  const userAgent = cleanText(headerList.get("user-agent") || "", null);
  const ipAddress = cleanText(getClientIp(headerList), null);

  db.prepare(
    `INSERT INTO visit_logs (visitor_id, user_id, path, referrer, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(visitorId, user?.id || null, path, referrer, ipAddress, userAgent);

  db.prepare(
    `DELETE FROM visit_logs
      WHERE id NOT IN (
        SELECT id FROM visit_logs ORDER BY created_at DESC, id DESC LIMIT 2000
      )`
  ).run();

  const response = NextResponse.json({ ok: true });
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

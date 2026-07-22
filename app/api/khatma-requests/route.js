export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createKhatmaRequest } from "@/lib/khatmaRequest";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  const result = createKhatmaRequest(getCurrentUser(), body);
  if (!result.ok) return NextResponse.json({ error: "اسمك واسم الشخص المطلوب إنشاء الختمة له مطلوبان" }, { status: 400 });
  return NextResponse.json({ ok: true, requestId: result.id }, { status: 201 });
}

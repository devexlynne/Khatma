import { NextResponse } from "next/server";
import { getCurrentUser, checkIsAdmin } from "@/lib/session";
import { adminSetJuzStatus } from "@/lib/khatma";

// Admin manually sets a juz status (available | reserved | completed).
// Both khatma owners and admins can use this endpoint.
export async function POST(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  
  const khatmaId = Number(params.id);
  const { number, status, name } = await req.json();
  
  const res = adminSetJuzStatus(khatmaId, user, Number(number), status, name);
  if (!res.ok) return NextResponse.json({ error: "تعذّر التحديث" }, { status: 403 });
  return NextResponse.json({ ok: true });
}

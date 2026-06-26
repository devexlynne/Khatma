export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createKhatma } from "@/lib/khatma";

export async function POST(req) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { title, description, honorName } = await req.json();
  if (!title || !title.trim())
    return NextResponse.json({ error: "اسم الختمة مطلوب" }, { status: 400 });
  const k = createKhatma(user.id, title, description || "", honorName || null);
  return NextResponse.json({ ok: true, id: k.id });
}

export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createKhatma } from "@/lib/khatma";
import { isAdmin } from "@/lib/auth";

export async function POST(req) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { title, description, honorName, honorRelation, honorStatus, ownerId } = await req.json();
  if (!title || !title.trim())
    return NextResponse.json({ error: "اسم الختمة مطلوب" }, { status: 400 });
  const requestedOwnerId = Number(ownerId);
  const targetOwnerId = isAdmin(user) && requestedOwnerId > 0 ? requestedOwnerId : user.id;
  const k = createKhatma(targetOwnerId, title, description || "", honorName || null, {
    honorRelation,
    honorStatus,
  });
  return NextResponse.json({ ok: true, id: k.id });
}

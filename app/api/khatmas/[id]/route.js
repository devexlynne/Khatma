export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateKhatma, deleteKhatma, getKhatmaById } from "@/lib/khatma";
import { isAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json();
  const khatma = getKhatmaById(id);
  const actingOwnerId = isAdmin(user) && khatma ? khatma.owner_id : user.id;
  const updated = updateKhatma(id, actingOwnerId, body);
  if (!updated) return NextResponse.json({ error: "غير موجودة أو ليست لك" }, { status: 403 });
  return NextResponse.json({ ok: true, khatma: updated });
}

export async function DELETE(_req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const id = Number(params.id);
  const khatma = getKhatmaById(id);
  const actingOwnerId = isAdmin(user) && khatma ? khatma.owner_id : user.id;
  const ok = deleteKhatma(id, actingOwnerId);
  if (!ok) return NextResponse.json({ error: "غير موجودة أو ليست لك" }, { status: 403 });
  return NextResponse.json({ ok: true });
}

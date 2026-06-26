import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateKhatma, deleteKhatma, getKhatmaById } from "@/lib/khatma";

export async function PATCH(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json();
  const updated = updateKhatma(id, user.id, body);
  if (!updated) return NextResponse.json({ error: "غير موجودة أو ليست لك" }, { status: 403 });
  return NextResponse.json({ ok: true, khatma: updated });
}

export async function DELETE(_req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const id = Number(params.id);
  const ok = deleteKhatma(id, user.id);
  if (!ok) return NextResponse.json({ error: "غير موجودة أو ليست لك" }, { status: 403 });
  return NextResponse.json({ ok: true });
}

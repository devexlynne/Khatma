import { NextResponse } from "next/server";
import { getKhatmaByPublicId, reserveJuz } from "@/lib/khatma";

export async function POST(req, { params }) {
  const khatma = getKhatmaByPublicId(params.publicId);
  if (!khatma) return NextResponse.json({ error: "الختمة غير موجودة" }, { status: 404 });
  if (khatma.status === "disabled")
    return NextResponse.json({ error: "هذه الختمة موقوفة حاليًا" }, { status: 403 });

  const { number, name } = await req.json();
  if (!name || !name.trim())
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  if (!number || number < 1 || number > 30)
    return NextResponse.json({ error: "رقم جزء غير صحيح" }, { status: 400 });

  const res = reserveJuz(khatma.id, Number(number), name);
  if (!res.ok)
    return NextResponse.json({ error: "هذا الجزء محجوز مسبقًا، اختر جزءًا آخر" }, { status: 409 });

  return NextResponse.json({ ok: true, token: res.token });
}

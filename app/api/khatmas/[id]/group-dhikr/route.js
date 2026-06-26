import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addGroupDhikrContribution, getKhatmaGroupDhikrs } from "@/lib/dhikr";
import { getKhatmaById } from "@/lib/khatma";

export async function GET(req, { params }) {
  const khatmaId = Number(params.id);
  const groupDhikrs = getKhatmaGroupDhikrs(khatmaId);
  return NextResponse.json({ ok: true, groupDhikrs });
}

export async function POST(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const khatmaId = Number(params.id);
  const khatma = getKhatmaById(khatmaId);
  if (!khatma) return NextResponse.json({ error: "الختمة غير موجودة" }, { status: 404 });

  const { dhikrType, count } = await req.json();
  if (!dhikrType || !count || count < 1) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const groupDhikr = addGroupDhikrContribution(khatmaId, dhikrType, user.id, count);
  return NextResponse.json({ ok: true, groupDhikr });
}

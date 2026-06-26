export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { completeJuzByToken } from "@/lib/khatma";

export async function POST(_req, { params }) {
  const res = completeJuzByToken(params.token);
  if (!res.ok)
    return NextResponse.json({ error: "رمز غير صالح" }, { status: 404 });
  return NextResponse.json({ ok: true, already: !!res.already });
}

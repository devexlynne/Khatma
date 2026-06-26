export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createDedication } from "../../../../lib/dedication.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, message, image_url } = body || {};
    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, reason: "missing_message" }, { status: 400 });
    }
    const res = createDedication({ name, message, image_url });
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getApprovedDedications } from "../../../../lib/dedication.js";

export async function GET() {
  try {
    const items = getApprovedDedications(200);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userFromToken, isAdmin, COOKIE_NAME } from "../../../../../lib/auth.js";
import { approveDedication, rejectDedication } from "../../../../../lib/dedication.js";

export async function POST(req) {
  try {
    const cookie = cookies().get(COOKIE_NAME)?.value;
    const user = userFromToken(cookie);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body || {};
    if (!id) return NextResponse.json({ ok: false, reason: "missing_id" }, { status: 400 });
    if (action === "approve") {
      const ok = approveDedication(id, user.id);
      return NextResponse.json({ ok });
    } else if (action === "reject") {
      const ok = rejectDedication(id, user.id);
      return NextResponse.json({ ok });
    }
    return NextResponse.json({ ok: false, reason: "invalid_action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}

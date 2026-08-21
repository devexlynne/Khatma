export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { COOKIE_NAME, isAdmin, userFromToken } from "@/lib/auth";

function currentAdmin() {
  const user = userFromToken(cookies().get(COOKIE_NAME)?.value);
  return isAdmin(user) ? user : null;
}

export async function PATCH(req) {
  const admin = currentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { userId, action } = await req.json();
  const id = Number(userId);
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json({ error: "لا يمكنك تغيير حالة حسابك الحالي" }, { status: 400 });
  }

  const status = action === "approve" ? "approved" : "rejected";
  const result = db
    .prepare("UPDATE users SET approval_status=? WHERE id=? AND role != 'admin'")
    .run(status, id);

  if (!result.changes) {
    return NextResponse.json({ error: "لم يتم العثور على مستخدم قابل للتعديل" }, { status: 404 });
  }

  if (status === "rejected") {
    db.prepare("DELETE FROM sessions WHERE user_id=?").run(id);
  }

  return NextResponse.json({ ok: true, status });
}

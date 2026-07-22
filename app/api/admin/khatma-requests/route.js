export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser, checkIsAdmin } from "@/lib/session";
import { listKhatmaRequests, reviewKhatmaRequest } from "@/lib/khatmaRequest";

function adminUser() {
  const user = getCurrentUser();
  return user && checkIsAdmin(user) ? user : null;
}

export async function GET() {
  if (!adminUser()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  return NextResponse.json({ requests: listKhatmaRequests() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const user = adminUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id, action } = await request.json();
  const result = reviewKhatmaRequest(Number(id), user, action);
  if (!result.ok) return NextResponse.json({ error: "الطلب غير متاح أو تمت معالجته مسبقًا" }, { status: 409 });
  return NextResponse.json(result);
}

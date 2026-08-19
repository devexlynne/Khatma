export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, startSession, COOKIE_NAME } from "@/lib/auth";
import { validateRealEmailAddress } from "@/lib/emailValidation";
import { VISITOR_COOKIE, attachVisitorToUser } from "@/lib/visitIdentity";

export async function POST(req) {
  const { fullName, email, password } = await req.json();
  if (!fullName || !email || !password)
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  const emailCheck = await validateRealEmailAddress(email);
  if (!emailCheck.ok)
    return NextResponse.json({ error: "يرجى إدخال بريد إلكتروني حقيقي قابل لاستقبال الرسائل" }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });

  const res = createUser(fullName, emailCheck.email, password);
  if (!res.ok)
    return NextResponse.json({ error: "هذا البريد مستخدم بالفعل" }, { status: 409 });

  const token = startSession(res.userId);
  attachVisitorToUser(cookies().get(VISITOR_COOKIE)?.value, res.userId);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return out;
}

export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUser, startSession, COOKIE_NAME } from "@/lib/auth";
import { validateRealEmailAddress } from "@/lib/emailValidation";
import { VISITOR_COOKIE, attachVisitorToUser } from "@/lib/visitIdentity";

export async function POST(req) {
  const { email, password, remember = true } = await req.json();
  const emailCheck = await validateRealEmailAddress(email);
  if (!emailCheck.ok)
    return NextResponse.json({ error: "يرجى استخدام بريد إلكتروني حقيقي ومسجل" }, { status: 401 });
  const user = verifyUser(emailCheck.email, password || "");
  if (!user)
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

  const token = startSession(user.id);
  attachVisitorToUser(cookies().get(VISITOR_COOKIE)?.value, user.id);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
  return out;
}

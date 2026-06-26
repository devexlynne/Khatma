import { NextResponse } from "next/server";
import { verifyUser, startSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = verifyUser(email || "", password || "");
  if (!user)
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

  const token = startSession(user.id);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return out;
}

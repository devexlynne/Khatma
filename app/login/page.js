export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const notify = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        notify("مرحبًا بعودتك");
        router.push("/dashboard");
        router.refresh();
        return;
      }
      let d = null;
      try { d = await res.json(); } catch (err) { /* ignore JSON parse errors */ }
      setError(d?.error || "حدث خطأ");
    } catch (err) {
      console.error("Login failed:", err);
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 440 }}>
      <div className="card">
        <h1 className="section-title center">تسجيل الدخول</h1>
        <p className="muted center" style={{ marginTop: 0 }}>أهلاً بك من جديد</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input className="input" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <div className="pw-wrap">
              <input className="input" type={show ? "text" : "password"} value={form.password} onChange={set("password")} required />
              <button type="button" className="toggle" onClick={() => setShow(!show)}>{show ? "إخفاء" : "إظهار"}</button>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              تذكّرني
            </label>
            <span className="muted" style={{ fontSize: 13 }}>نسيت كلمة المرور؟</span>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "جارٍ الدخول…" : "دخول"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10 }}
            onClick={() => setForm({ email: "admin@khatma.app", password: "admin123" })}
          >
            دخول كمدير النظام
          </button>
        </form>
        <div className="note" style={{ marginTop: 16, background: "#f4f8ff", borderColor: "#d7e5fa", color: "#254a78" }}>
          لتجربة دور المسؤول، شغّل الأمر <strong>npm run seed</strong> ثم سجّل الدخول بـ
          <br />البريد: <strong>admin@khatma.app</strong> · كلمة المرور: <strong>admin123</strong>
        </div>
        <div className="divider">ليس لديك حساب؟ <Link href="/signup" style={{ color: "var(--green)", fontWeight: 800 }}>إنشاء حساب</Link></div>
      </div>
    </div>
  );
}

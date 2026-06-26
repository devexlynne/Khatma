export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const notify = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("كلمتا المرور غير متطابقتين");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      notify("تم إنشاء الحساب بنجاح");
      router.push("/dashboard");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error || "حدث خطأ");
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 460 }}>
      <div className="card">
        <h1 className="section-title center">إنشاء حساب</h1>
        <p className="muted center" style={{ marginTop: 0 }}>أنشئ حسابك لإدارة ختماتك</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>الاسم الكامل</label>
            <input className="input" value={form.fullName} onChange={set("fullName")} required />
          </div>
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
          <div className="field">
            <label>تأكيد كلمة المرور</label>
            <input className="input" type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} required />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </button>
        </form>
        <div className="divider">لديك حساب بالفعل؟ <Link href="/login" style={{ color: "var(--green)", fontWeight: 800 }}>تسجيل الدخول</Link></div>
      </div>
    </div>
  );
}

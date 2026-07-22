"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function ContactAdminForm() {
  const notify = useToast();
  const [form, setForm] = useState({ name: "", contact: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return notify("الاسم والرسالة مطلوبان", "error");
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال الرسالة");
      setForm({ name: "", contact: "", message: "", website: "" });
      notify("وصلت رسالتك إلى المشرف، شكرًا لك", "success");
    } catch (error) {
      notify(error.message || "تعذر إرسال الرسالة", "error");
    } finally {
      setBusy(false);
    }
  }

  return <section className="card moroccan-frame contact-admin-card" id="contact-admin">
    <div className="contact-admin-heading">
      <span className="contact-admin-icon" aria-hidden="true">✉</span>
      <div><span className="admin-kicker">نسعد بسماعكم</span><h2>تواصل مع المشرف</h2><p className="muted">يمكن للمشتركين والزوار إرسال اقتراح، ملاحظة أو استفسار مباشرة إلى مشرف الموقع.</p></div>
    </div>
    <form onSubmit={submit} className="contact-admin-form">
      <div className="contact-fields-row">
        <div className="field"><label htmlFor="contact-name">الاسم</label><input id="contact-name" className="input" value={form.name} onChange={update("name")} maxLength={80} required placeholder="اكتب اسمك" /></div>
        <div className="field"><label htmlFor="contact-info">وسيلة التواصل (اختياري)</label><input id="contact-info" className="input" value={form.contact} onChange={update("contact")} maxLength={120} placeholder="بريد إلكتروني أو رقم هاتف" /></div>
      </div>
      <div className="field"><label htmlFor="contact-message">الرسالة</label><textarea id="contact-message" className="input" value={form.message} onChange={update("message")} maxLength={1500} required rows={5} placeholder="اكتب رسالتك للمشرف هنا..." /></div>
      <input className="contact-honeypot" tabIndex="-1" autoComplete="off" value={form.website} onChange={update("website")} aria-hidden="true" />
      <div className="row contact-submit-row"><small className="muted">لن تظهر الرسالة للزوار؛ يراها المشرف فقط.</small><button className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الإرسال..." : "إرسال إلى المشرف"}</button></div>
    </form>
  </section>;
}

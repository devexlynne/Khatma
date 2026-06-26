"use client";

import { useState } from "react";

export default function DedicationForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setStatus({ ok: false, msg: "الرجاء إدخال نص الدعاء أو الرثاء" });
    setSubmitting(true);
    try {
      const res = await fetch("/api/dedications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null, message: message.trim(), image_url: imageUrl.trim() || null }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ ok: true, msg: "تم الإرسال. سيظهر بعد الموافقة من المشرف." });
        setName("");
        setMessage("");
        setImageUrl("");
      } else {
        setStatus({ ok: false, msg: data.reason || "خطأ في الإرسال" });
      }
    } catch (err) {
      setStatus({ ok: false, msg: "خطأ في الاتصال" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="dedication-form" onSubmit={submit}>
      <div className="form-group">
        <label className="label">لمن تدعو (اختياري)</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="أكتب الاسم (اختياري)" />
      </div>

      <div className="form-group">
        <label className="label">نص الدعاء أو الرثاء</label>
        <textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="أكتب رسالتك هنا..." />
      </div>

      <div className="form-group">
        <label className="label">رابط صورة/ملص (اختياري)</label>
        <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
      </div>

      <div className="dedication-form-actions">
        <button className="btn btn-primary btn-ornate" type="submit" disabled={submitting}>
          {submitting ? "جارٍ الإرسال..." : "أرسل للدراسة"}
        </button>
      </div>

      {status ? (
        <p className={status.ok ? "muted success" : "muted error"}>{status.msg}</p>
      ) : null}
    </form>
  );
}

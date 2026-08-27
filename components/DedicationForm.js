"use client";

import { useRef, useState } from "react";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

export default function DedicationForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const chooseImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return setStatus({ ok: false, msg: "الرجاء اختيار ملف صورة" });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      e.target.value = "";
      return setStatus({ ok: false, msg: "حجم الصورة يجب ألا يتجاوز 3 ميغابايت" });
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus(null);
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setStatus({ ok: false, msg: "الرجاء إدخال نص الدعاء أو الرثاء" });
    setSubmitting(true);
    try {
      const body = new FormData();
      if (name.trim()) body.append("name", name.trim());
      body.append("message", message.trim());
      if (image) body.append("image", image);
      const res = await fetch("/api/dedications/submit", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ ok: true, msg: "تم الإرسال. سيظهر بعد الموافقة من المشرف." });
        setName("");
        setMessage("");
        removeImage();
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
        <label className="label" htmlFor="dedication-image">صورة/ملصق (اختياري)</label>
        <input
          ref={fileInputRef}
          id="dedication-image"
          className="visually-hidden"
          type="file"
          accept="image/*"
          onChange={chooseImage}
        />
        {previewUrl ? (
          <div className="dedication-image-preview">
            <img src={previewUrl} alt="معاينة الصورة المرفقة" />
            <button type="button" className="btn dedication-image-remove" onClick={removeImage}>إزالة الصورة</button>
          </div>
        ) : (
          <button type="button" className="input dedication-image-picker" onClick={() => fileInputRef.current?.click()}>
            اختر صورة من جهازك
          </button>
        )}
        <small className="muted">JPG أو PNG أو GIF أو WebP، بحد أقصى 3 ميغابايت</small>
      </div>

      <div className="dedication-form-actions">
        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? "جارٍ الإرسال..." : "أرسل للدراسة"}
        </button>
      </div>

      {status ? (
        <p className={status.ok ? "muted success" : "muted error"}>{status.msg}</p>
      ) : null}
    </form>
  );
}

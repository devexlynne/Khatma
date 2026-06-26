"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function NewKhatmaForm() {
  const router = useRouter();
  const notify = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [honorName, setHonorName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/khatmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, honorName }),
    });
    setLoading(false);
    if (res.ok) {
      const d = await res.json();
      notify("تم إنشاء الختمة بنجاح");
      router.push(`/khatmas/${d.id}`);
      router.refresh();
    } else {
      notify("تعذّر إنشاء الختمة", "error");
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="field">
        <label>اسم الختمة</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ختمة رمضان لعائلتنا" required />
      </div>
      <div className="field">
        <label>الوصف (اختياري)</label>
        <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="نية الختمة أو أي تفاصيل…" />
      </div>
      <div className="field">
        <label>مهدى إلى (اختياري)</label>
        <input className="input" value={honorName} onChange={(e) => setHonorName(e.target.value)} placeholder="اسم الحبيب/الفقيد أو الدعاء الخاص" />
      </div>
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "جارٍ الحفظ…" : "إنشاء الختمة"}
      </button>
    </form>
  );
}

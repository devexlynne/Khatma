"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

const statusLabel = {
  pending: "بانتظار الموافقة",
  approved: "معتمدة",
  rejected: "مرفوضة",
};

export default function AdminDedications() {
  const notify = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/dedications/admin/approve", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setItems(data.items || []);
    } catch {
      setError("تعذر تحميل رسائل الدعاء والرثاء.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(id, action) {
    setSaving(id);
    try {
      const response = await fetch("/api/dedications/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error();
      setItems((current) => current.map((item) => item.id === id
        ? { ...item, status: action === "approve" ? "approved" : "rejected", approved_at: new Date().toISOString() }
        : item));
      notify(action === "approve" ? "تم اعتماد الرسالة" : "تم رفض الرسالة", "success");
    } catch {
      notify("تعذر تحديث الرسالة", "error");
    } finally {
      setSaving(null);
    }
  }

  const pending = items.filter((item) => item.status === "pending").length;

  return <section className="card admin-message-inbox">
    <div className="admin-card-title">
      <div><span className="admin-kicker">الإشراف على المحتوى</span><h3>رسائل الدعاء والرثاء</h3></div>
      <span className={`badge ${pending ? "active" : "completed"}`}>{pending} تنتظر الموافقة</span>
    </div>
    {loading ? <p className="muted">جارٍ تحميل الرسائل...</p>
      : error ? <div><p className="error-text">{error}</p><button className="btn btn-sm btn-ghost" onClick={load}>إعادة المحاولة</button></div>
      : !items.length ? <p className="muted">لا توجد رسائل دعاء أو رثاء بعد.</p>
      : <div className="admin-message-list">
        {items.map((item) => <article key={item.id} className={`admin-message-item ${item.status === "pending" ? "is-new" : ""}`}>
          <div className="admin-message-meta">
            <strong>{item.name ? `دعاء إلى ${item.name}` : "رسالة دعاء أو رثاء"}</strong>
            <span>{item.submitted_at?.slice(0, 16)}</span>
          </div>
          {item.image_url ? <img className="admin-dedication-image" src={item.image_url} alt="الصورة المرفقة بالرسالة" /> : null}
          <p>{item.message}</p>
          <div className="admin-detail-grid admin-message-details">
            <span><b>المرسل:</b> {item.submitter_name || "زائر بدون حساب"}</span>
            <span><b>البريد:</b> {item.submitter_email || "غير متوفر"}</span>
            <span><b>الحالة:</b> {statusLabel[item.status] || item.status}</span>
          </div>
          <div className="row">
            {item.status === "pending" ? <>
              <button className="btn btn-sm btn-primary" disabled={saving === item.id} onClick={() => review(item.id, "approve")}>موافقة ونشر</button>
              <button className="btn btn-sm btn-ghost" disabled={saving === item.id} onClick={() => review(item.id, "reject")}>رفض</button>
            </> : <span className={`badge ${item.status === "approved" ? "completed" : "active"}`}>{statusLabel[item.status]}</span>}
          </div>
        </article>)}
      </div>}
  </section>;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

export default function AdminMessages() {
  const notify = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replies, setReplies] = useState({});
  const [savingReply, setSavingReply] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/messages", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setMessages(data.messages || []);
    } catch {
      setError("تعذر تحميل الرسائل. حاول التحديث مجددًا.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(id, action) {
    const response = await fetch("/api/admin/messages", { method: action === "delete" ? "DELETE" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) return notify("تعذر تحديث الرسالة", "error");
    setMessages((current) => action === "delete" ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, status: "read" } : item));
    notify(action === "delete" ? "تم حذف الرسالة" : "تم تعليم الرسالة كمقروءة", "success");
  }

  async function saveReply(item) {
    const reply = (replies[item.id] ?? item.admin_reply ?? "").trim();
    if (!reply) return notify("اكتب الرد أولًا", "error");
    setSavingReply(item.id);
    const response = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, action: "reply", reply }),
    });
    setSavingReply(null);
    if (!response.ok) return notify("تعذر حفظ الرد", "error");
    const repliedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    setMessages((current) => current.map((message) => message.id === item.id ? { ...message, status: "replied", admin_reply: reply, replied_at: repliedAt } : message));
    notify("تم إرسال الرد داخل البوابة", "success");
  }

  function replyEmail(item) {
    const directEmail = item.sender_email || item.account_email;
    if (directEmail) return directEmail;
    const match = String(item.contact_info || "").match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    return match?.[0] || "";
  }

  const unread = messages.filter((item) => item.status === "new").length;
  const categoryLabel = { message: "رسالة", suggestion: "اقتراح", problem: "مشكلة", question: "استفسار" };
  const statusLabel = { new: "جديدة", read: "مقروءة", replied: "تم الرد" };
  return <section className="card admin-message-inbox">
    <div className="admin-card-title"><div><span className="admin-kicker">صندوق التواصل</span><h3>رسائل الزوار والمشتركين</h3></div><span className={`badge ${unread ? "active" : "completed"}`}>{unread} جديدة</span></div>
    {loading ? <p className="muted">جارٍ تحميل الرسائل...</p> : error ? <div><p className="error-text">{error}</p><button className="btn btn-sm btn-ghost" onClick={load}>إعادة المحاولة</button></div> : messages.length === 0 ? <p className="muted">لا توجد رسائل بعد.</p> : <div className="admin-message-list">
      {messages.map((item) => <article key={item.id} className={`admin-message-item ${item.status === "new" ? "is-new" : ""}`}>
        {(() => {
          const email = replyEmail(item);
          const replyText = replies[item.id] ?? item.admin_reply ?? "";
          return <>
        <div className="admin-message-meta"><strong>{item.sender_name} · {categoryLabel[item.category] || "رسالة"}</strong><span>{item.created_at?.slice(0,16)}</span></div>
        <div className="admin-detail-grid admin-message-details">
          <span><b>البريد:</b> {email || "غير متوفر"}</span>
          <span><b>الهاتف:</b> {item.phone || "غير متوفر"}</span>
          <span><b>البلد المدخل:</b> {item.country || "غير متوفر"}</span>
          <span><b>بلد IP:</b> {item.ip_country || "غير متوفر"}</span>
          <span><b>مدينة IP:</b> {item.ip_city || "غير متوفر"}</span>
          <span><b>IP:</b> {item.ip_address || "غير متوفر"}</span>
          <span><b>الحساب:</b> {item.account_name || "زائر بدون حساب"}</span>
        </div>
        {item.contact_info ? <p className="admin-message-contact">كل معلومات التواصل: {item.contact_info}</p> : null}
        <p>{item.message}</p>
        {item.admin_reply ? <div className="admin-reply-box"><strong>رد المشرف:</strong><p>{item.admin_reply}</p><small>{item.replied_at?.slice(0,16)}</small></div> : null}
        <div className="field admin-reply-field">
          <label htmlFor={`reply-${item.id}`}>رد المشرف</label>
          <textarea id={`reply-${item.id}`} className="input" rows={3} maxLength={2000} value={replies[item.id] ?? item.admin_reply ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="اكتب الرد الذي سيظهر لصاحب الرسالة داخل البوابة..." />
        </div>
        <div className="row">
          {item.status === "new" ? <button className="btn btn-sm btn-primary" onClick={() => update(item.id, "read")}>تعليم كمقروءة</button> : <span className={`badge ${item.status === "replied" ? "completed" : "active"}`}>{statusLabel[item.status] || item.status}</span>}
          <button className="btn btn-sm btn-primary" onClick={() => saveReply(item)} disabled={savingReply === item.id}>{savingReply === item.id ? "جارٍ الإرسال..." : "إرسال الرد"}</button>
          {email ? <a className="btn btn-sm btn-gold" href={`mailto:${email}?subject=${encodeURIComponent("رد من إدارة نور الوالدين")}&body=${encodeURIComponent(replyText)}`}>إرسال بالبريد</a> : null}
          <button className="btn btn-sm btn-ghost" onClick={() => update(item.id, "delete")}>حذف</button>
        </div>
        </>;
        })()}
      </article>)}
    </div>}
  </section>;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

export default function AdminMessages() {
  const notify = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setMessages(data.messages || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(id, action) {
    const response = await fetch("/api/admin/messages", { method: action === "delete" ? "DELETE" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) return notify("تعذر تحديث الرسالة", "error");
    setMessages((current) => action === "delete" ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, status: "read" } : item));
    notify(action === "delete" ? "تم حذف الرسالة" : "تم تعليم الرسالة كمقروءة", "success");
  }

  const unread = messages.filter((item) => item.status === "new").length;
  return <section className="card admin-message-inbox">
    <div className="admin-card-title"><div><span className="admin-kicker">صندوق التواصل</span><h3>رسائل الزوار والمشتركين</h3></div><span className={`badge ${unread ? "active" : "completed"}`}>{unread} جديدة</span></div>
    {loading ? <p className="muted">جارٍ تحميل الرسائل...</p> : messages.length === 0 ? <p className="muted">لا توجد رسائل بعد.</p> : <div className="admin-message-list">
      {messages.map((item) => <article key={item.id} className={`admin-message-item ${item.status === "new" ? "is-new" : ""}`}>
        <div className="admin-message-meta"><strong>{item.sender_name}</strong><span>{item.created_at?.slice(0,16)}</span></div>
        {item.contact_info ? <p className="admin-message-contact">وسيلة التواصل: {item.contact_info}</p> : null}
        <p>{item.message}</p>
        <div className="row">{item.status === "new" ? <button className="btn btn-sm btn-primary" onClick={() => update(item.id, "read")}>تعليم كمقروءة</button> : <span className="badge completed">مقروءة</span>}<button className="btn btn-sm btn-ghost" onClick={() => update(item.id, "delete")}>حذف</button></div>
      </article>)}
    </div>}
  </section>;
}

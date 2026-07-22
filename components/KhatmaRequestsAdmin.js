"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

const STATUS_LABEL = { pending: "بانتظار القرار", processing: "قيد الإنشاء", approved: "تم إنشاء الختمة", rejected: "مرفوض" };

export default function KhatmaRequestsAdmin() {
  const notify = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/khatma-requests", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRequests(data.requests || []);
    } catch { notify("تعذّر تحميل طلبات الختمات", "error"); }
    finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  async function review(id, action) {
    setBusyId(id);
    try {
      const response = await fetch("/api/admin/khatma-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذّر تنفيذ القرار");
      notify(action === "approve" ? "تم قبول الطلب وإنشاء الختمة" : "تم رفض الطلب", "success");
      await load();
    } catch (error) { notify(error.message || "تعذّر تنفيذ القرار", "error"); }
    finally { setBusyId(null); }
  }

  const pending = requests.filter((item) => item.status === "pending").length;
  return <section className="card admin-khatma-requests">
    <div className="admin-card-title"><div><span className="admin-kicker">طلبات من الزوار والمستخدمين</span><h3>طلبات إنشاء ختمة</h3></div><span className={`badge ${pending ? "active" : "completed"}`}>{pending} بانتظارك</span></div>
    {loading ? <p className="muted">جارٍ تحميل الطلبات...</p> : requests.length === 0 ? <p className="muted">لا توجد طلبات ختمة بعد.</p> : <div className="admin-request-list">
      {requests.map((item) => <article key={item.id} className={`admin-request-item ${item.status === "pending" ? "is-pending" : ""}`}>
        <div className="admin-request-top"><div><span>طلب رقم {item.id}</span><h4>{item.beneficiary_name}</h4><p>{item.relationship || "لم تحدد الصلة"} · {item.beneficiary_status === "living" ? "حي — حفظه الله" : "متوفى — رحمه الله"}</p></div><span className={`badge ${item.status === "approved" ? "completed" : item.status === "pending" ? "active" : "disabled"}`}>{STATUS_LABEL[item.status] || item.status}</span></div>
        <div className="admin-detail-grid"><span><b>مقدم الطلب:</b> {item.requester_name}</span><span><b>التواصل:</b> {item.contact_info || "غير مذكور"}</span><span><b>الحساب:</b> {item.account_name || "زائر من دون حساب"}</span><span><b>العنوان:</b> {item.suggested_title || "سيُنشأ تلقائيًا"}</span></div>
        {item.message ? <p className="admin-request-message">{item.message}</p> : null}
        <div className="row">
          {item.status === "pending" ? <><button className="btn btn-primary btn-sm" disabled={busyId === item.id} onClick={() => review(item.id, "approve")}>{busyId === item.id ? "جارٍ الإنشاء..." : "قبول وإنشاء الختمة"}</button><button className="btn btn-ghost btn-sm" disabled={busyId === item.id} onClick={() => review(item.id, "reject")}>رفض</button></> : null}
          {item.created_khatma_id ? <><Link href={`/khatmas/${item.created_khatma_id}`} className="btn btn-primary btn-sm">إدارة الختمة</Link>{item.khatma_public_id ? <Link href={`/k/${item.khatma_public_id}`} className="btn btn-ghost btn-sm">الرابط العام</Link> : null}</> : null}
        </div>
      </article>)}
    </div>}
  </section>;
}

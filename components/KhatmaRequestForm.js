"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function KhatmaRequestForm({ currentUser = null }) {
  const notify = useToast();
  const [form, setForm] = useState({
    requesterName: currentUser?.name || "",
    contactInfo: currentUser?.email || "",
    beneficiaryName: "",
    beneficiaryStatus: "deceased",
    suggestedTitle: "",
    message: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [sentId, setSentId] = useState(null);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/khatma-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذّر إرسال الطلب");
      setSentId(data.requestId);
      setForm((current) => ({ ...current, beneficiaryName: "", suggestedTitle: "", message: "" }));
      notify("وصل طلب الختمة إلى المشرف", "success");
    } catch (error) {
      notify(error.message || "تعذّر إرسال الطلب", "error");
    } finally { setBusy(false); }
  }

  return <section className="card moroccan-frame khatma-request-card" id="request-khatma">
    <div className="khatma-request-heading"><span className="request-star" aria-hidden="true">✦</span><div><span className="admin-kicker">فكرة خير تصل إلى المشرف</span><h2>اطلب ختمة لمن تحب</h2><p className="muted">لا تحتاج إلى حساب. اكتب اسم الشخص، وسيصل الطلب إلى المشرف ليوافق عليه وينشئ الختمة. إن كنت مسجلًا ستظهر الختمة في حسابك بعد قبولها.</p></div></div>
    {sentId ? <div className="request-success"><strong>تم إرسال الطلب رقم {sentId}</strong><span>سيظهر لدى المشرف مع جميع التفاصيل.</span></div> : null}
    <form onSubmit={submit} className="khatma-request-form">
      <div className="smart-two-columns">
        <div className="field"><label htmlFor="requester-name">اسم مقدم الطلب</label><input id="requester-name" className="input" value={form.requesterName} onChange={update("requesterName")} maxLength={80} required placeholder="اسمك" /></div>
        <div className="field"><label htmlFor="requester-contact">وسيلة التواصل</label><input id="requester-contact" className="input" value={form.contactInfo} onChange={update("contactInfo")} maxLength={120} placeholder="البريد أو رقم الهاتف (اختياري)" /></div>
      </div>
      <div className="smart-two-columns">
        <div className="field"><label htmlFor="beneficiary-name">اسم من تريد الختمة له</label><input id="beneficiary-name" className="input" value={form.beneficiaryName} onChange={update("beneficiaryName")} maxLength={120} required placeholder="الاسم الكامل" /></div>
      </div>
      <div className="smart-two-columns">
        <div className="field"><label htmlFor="beneficiary-status">نوع الدعاء</label><select id="beneficiary-status" className="input" value={form.beneficiaryStatus} onChange={update("beneficiaryStatus")}><option value="deceased">لشخص متوفى — رحمه الله</option></select></div>
        <div className="field"><label htmlFor="suggested-title">عنوان مقترح (اختياري)</label><input id="suggested-title" className="input" value={form.suggestedTitle} onChange={update("suggestedTitle")} maxLength={140} placeholder="يُنشأ تلقائيًا إذا تركته فارغًا" /></div>
      </div>
      <div className="field"><label htmlFor="request-message">رسالة للمشرف (اختياري)</label><textarea id="request-message" className="input" value={form.message} onChange={update("message")} maxLength={800} rows={3} placeholder="مناسبة الختمة أو دعاء ترغب بإضافته..." /></div>
      <input className="contact-honeypot" tabIndex="-1" autoComplete="off" value={form.website} onChange={update("website")} aria-hidden="true" />
      <button className="btn btn-primary" disabled={busy}>{busy ? "جارٍ إرسال الطلب..." : "إرسال طلب الختمة إلى المشرف"}</button>
    </form>
  </section>;
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const FEATURED_RECIPIENTS = {
  father: { name: "يحيى علي الحلبي", relationship: "الوالد", honorStatus: "deceased", label: "الوالد يحيى علي الحلبي" },
  mother: { name: "دلال محمد طاهر اللاذقي", relationship: "الوالدة", honorStatus: "deceased", label: "الوالدة دلال محمد طاهر اللاذقي" },
};

export default function NewKhatmaForm({ suggestions = [], owners = [], currentUserId, isAdmin = false }) {
  const router = useRouter();
  const notify = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipientMode, setRecipientMode] = useState("father");
  const [existingName, setExistingName] = useState(suggestions[0]?.name || "");
  const [newName, setNewName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [honorStatus, setHonorStatus] = useState("deceased");
  const [ownerId, setOwnerId] = useState(String(currentUserId || ""));
  const [loading, setLoading] = useState(false);

  const recipient = useMemo(() => {
    if (recipientMode === "none") return { name: "", relationship: "", honorStatus: "deceased" };
    if (FEATURED_RECIPIENTS[recipientMode]) return FEATURED_RECIPIENTS[recipientMode];
    if (recipientMode === "existing") {
      const found = suggestions.find((item) => item.name === existingName);
      return { name: existingName, relationship: found?.relationship || "", honorStatus: found?.honorStatus || "deceased" };
    }
    return { name: newName.trim(), relationship: relationship.trim(), honorStatus };
  }, [recipientMode, existingName, newName, relationship, honorStatus, suggestions]);

  function suggestTitle() {
    setTitle(recipient.name ? `ختمة قرآن مهداة إلى ${recipient.name}` : "ختمة القرآن الكريم");
  }

  async function submit(event) {
    event.preventDefault();
    if (recipientMode !== "none" && !recipient.name) return notify("اكتب اسم الشخص الذي ستهدى إليه الختمة", "error");
    setLoading(true);
    try {
      const response = await fetch("/api/khatmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          honorName: recipient.name || null,
          honorRelation: recipient.relationship || null,
          honorStatus: recipient.honorStatus,
          ownerId: isAdmin ? Number(ownerId) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذّر إنشاء الختمة");
      notify("تم إنشاء الختمة وإضافتها إلى سجل الإهداءات", "success");
      router.push(`/khatmas/${data.id}`);
      router.refresh();
    } catch (error) {
      notify(error.message || "تعذّر إنشاء الختمة", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card smart-khatma-form">
      {isAdmin && owners.length > 0 ? (
        <div className="field smart-owner-field">
          <label htmlFor="khatma-owner">من سيدير هذه الختمة؟</label>
          <select id="khatma-owner" className="input" value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name} — {owner.email}{owner.role === "admin" ? " (مشرف)" : ""}</option>)}
          </select>
          <small className="muted">يستطيع المشرف إنشاء الختمة داخل حساب أي مستخدم مسجل.</small>
        </div>
      ) : null}

      <fieldset className="recipient-picker">
        <legend>لمن ستكون هذه الختمة؟</legend>
        <p className="muted">اختر شخصًا محفوظًا كي يُحتسب عدد الختمات المهداة والمكتملة له تلقائيًا.</p>
        <div className="recipient-options">
          <button type="button" className={`recipient-option ${recipientMode === "father" ? "selected" : ""}`} onClick={() => setRecipientMode("father")}><span>الوالد</span><strong>يحيى علي الحلبي</strong></button>
          <button type="button" className={`recipient-option ${recipientMode === "mother" ? "selected" : ""}`} onClick={() => setRecipientMode("mother")}><span>الوالدة</span><strong>دلال محمد طاهر اللاذقي</strong></button>
          {suggestions.length ? <button type="button" className={`recipient-option compact ${recipientMode === "existing" ? "selected" : ""}`} onClick={() => setRecipientMode("existing")}><span>شخص سبق الإهداء له</span><strong>اختيار من السجل</strong></button> : null}
          <button type="button" className={`recipient-option compact ${recipientMode === "new" ? "selected" : ""}`} onClick={() => setRecipientMode("new")}><span>شخص جديد</span><strong>إضافة مستفيد جديد</strong></button>
          <button type="button" className={`recipient-option compact ${recipientMode === "none" ? "selected" : ""}`} onClick={() => setRecipientMode("none")}><span>ختمة عامة</span><strong>من دون اسم محدد</strong></button>
        </div>
      </fieldset>

      {recipientMode === "existing" ? (
        <div className="field">
          <label htmlFor="existing-recipient">اختر من سجل الإهداءات</label>
          <select id="existing-recipient" className="input" value={existingName} onChange={(event) => setExistingName(event.target.value)}>
            {suggestions.map((item) => <option key={item.name} value={item.name}>{item.name} — {item.total} ختمة، {item.completed || 0} مكتملة</option>)}
          </select>
        </div>
      ) : null}

      {recipientMode === "new" ? (
        <div className="new-recipient-panel">
          <div className="field"><label htmlFor="recipient-name">اسم الشخص</label><input id="recipient-name" className="input" value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={120} required placeholder="الاسم الكامل" /></div>
          <div className="smart-two-columns">
            <div className="field"><label htmlFor="recipient-relation">صلته بك</label><select id="recipient-relation" className="input" value={relationship} onChange={(event) => setRelationship(event.target.value)}><option value="">اختر الصلة</option><option>الوالد</option><option>الوالدة</option><option>الزوج</option><option>الزوجة</option><option>الابن</option><option>الابنة</option><option>الأخ</option><option>الأخت</option><option>قريب</option><option>صديق</option><option>شخص عزيز</option></select></div>
            <div className="field"><label htmlFor="recipient-status">الدعاء له</label><select id="recipient-status" className="input" value={honorStatus} onChange={(event) => setHonorStatus(event.target.value)}><option value="deceased">رحمه الله / رحمها الله</option><option value="living">حفظه الله / حفظها الله</option></select></div>
          </div>
        </div>
      ) : null}

      {recipient.name ? <div className="recipient-preview"><span>الإهداء المختار</span><strong>{recipient.name}</strong><small>{recipient.relationship ? `${recipient.relationship} · ` : ""}{recipient.honorStatus === "living" ? "حفظه الله" : "رحمه الله"}</small></div> : null}

      <div className="field">
        <div className="smart-label-row"><label htmlFor="khatma-title">اسم الختمة</label><button type="button" className="text-action" onClick={suggestTitle}>اقتراح اسم تلقائي</button></div>
        <input id="khatma-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} placeholder={recipient.name ? `ختمة مهداة إلى ${recipient.name}` : "مثال: ختمة رمضان للعائلة"} required />
      </div>
      <div className="field"><label htmlFor="khatma-description">رسالة أو نية الختمة (اختياري)</label><textarea id="khatma-description" className="input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={600} placeholder="اكتب دعاءً قصيرًا أو مناسبة الختمة..." /></div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? "جارٍ إنشاء الختمة..." : "إنشاء الختمة وفتح الأجزاء الثلاثين"}</button>
    </form>
  );
}

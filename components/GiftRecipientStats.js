export default function GiftRecipientStats({ recipients = [], admin = false }) {
  if (!recipients.length) return null;
  return <section className="card gift-recipient-ledger">
    <div className="admin-card-title"><div><span className="admin-kicker">عداد تلقائي حسب الاسم</span><h3>{admin ? "سجل الإهداءات في الموقع" : "الأشخاص الذين أهديت لهم الختمات"}</h3></div><span className="badge completed">{recipients.length} مستفيد</span></div>
    <p className="muted">كل ختمة جديدة بالاسم نفسه تزيد العدد تلقائيًا، وعند إكمال أجزائها الثلاثين تنتقل إلى خانة «مكتملة».</p>
    <div className="gift-recipient-grid">
      {recipients.map((person) => <article key={person.name} className="gift-recipient-item"><div><span>{person.relationship || (person.honorStatus === "living" ? "إهداء ودعاء" : "صدقة ودعاء")}</span><strong>{person.name}</strong><small>{person.honorStatus === "living" ? "حفظه الله" : "رحمه الله"}</small></div><div className="gift-recipient-numbers"><b>{person.total}</b><span>مهداة</span><b>{person.completed || 0}</b><span>مكتملة</span><b>{person.active || 0}</b><span>نشطة</span></div></article>)}
    </div>
  </section>;
}

export default function KidsGardenSection() {
  return (
    <section className="pdf-section">
      <div className="card pdf-shell">
        <div className="pdf-header">
          <div>
            <h2 className="section-title">حديقة الأطفال</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              ملفات PDF مخصّصة للأطفال، يمكن عرضها أو تنزيلها مباشرة.
            </p>
          </div>
          <span className="pdf-badge">كتاب</span>
        </div>
        <div className="pdf-grid">
          <a href="/hadiqat-al-atfal-1.pdf" className="pdf-card" target="_blank" rel="noreferrer">
            <div className="pdf-card-title">
              <span className="pdf-icon icon-decorated">📘</span>
              <strong>كتاب حديقة الأطفال 1</strong>
            </div>
            <p>نسخة PDF من الكتاب الأول في سلسلة حديقة الأطفال.</p>
            <span className="pdf-meta">حجم الملف حوالي 21 ميغابايت</span>
            <span className="pdf-action">عرض الملف</span>
          </a>
          <a href="/hadiqat-al-atfal-2.pdf" className="pdf-card" target="_blank" rel="noreferrer">
            <div className="pdf-card-title">
              <span className="pdf-icon icon-decorated">📗</span>
              <strong>كتاب حديقة الأطفال 2</strong>
            </div>
            <p>نسخة PDF من الكتاب الثاني في سلسلة حديقة الأطفال.</p>
            <span className="pdf-meta">حجم الملف حوالي 41 ميغابايت</span>
            <span className="pdf-action">عرض الملف</span>
          </a>
        </div>
      </div>
    </section>
  );
}

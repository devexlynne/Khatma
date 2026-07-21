import Link from "next/link";

export default function PublicKhatmasSection({ khatmas = [] }) {
  return (
    <section className="home-public-khatmas" aria-labelledby="public-khatmas-title">
      <div className="public-khatmas-heading">
        <div>
          <span>شارك في ختم القرآن</span>
          <h2 id="public-khatmas-title" className="section-title">الختمات العامة المتاحة</h2>
          <p className="muted">لا تحتاج إلى حساب؛ اختر ختمة وافتحها ثم احجز الجزء الذي ترغب في قراءته.</p>
        </div>
        <span className="badge active">{khatmas.length} ختمة نشطة</span>
      </div>
      {khatmas.length === 0 ? (
        <div className="card center"><p className="muted">لا توجد ختمات عامة نشطة حاليًا.</p></div>
      ) : (
        <div className="stat-grid">
          {khatmas.map((k) => (
            <article key={k.id} className="card k-card public-khatma-card">
              <div className="top"><h3>{k.title}</h3><span className="badge active">متاحة</span></div>
              {k.description ? <p className="desc">{k.description}</p> : null}
              {k.honor_name ? <p className="desc"><strong>الإهداء:</strong> {k.honor_name}</p> : null}
              <div className="progress"><span style={{ width: `${k.progress.percent}%` }} /></div>
              <div className="meta">{k.progress.completed} مكتمل · {k.progress.reserved} محجوز · {k.progress.available} متاح</div>
              <Link href={`/k/${k.public_id}`} className="btn btn-primary btn-sm">فتح الختمة وحجز جزء</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

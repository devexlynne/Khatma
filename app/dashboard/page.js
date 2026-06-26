import Link from "next/link";
import Nav from "@/components/Nav";
import QiblaCompass from "@/components/QiblaCompass";
import MemorialDedication from "@/components/MemorialDedication";
import { getDailyDuaa } from "@/lib/dhikr-client";
import { requireUser } from "@/lib/guard";
import { ownerStats, adminOverview } from "@/lib/khatma";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const user = requireUser();
  const stats = ownerStats(user.id);
  const dailyDuaa = getDailyDuaa();
  const isAdmin = user.role === "admin";
  const adminInfo = isAdmin ? adminOverview() : null;

  return (
    <>
      <Nav />
      <div className="container page">
        <h1 className="section-title">لوحة التحكم</h1>
        <p className="muted" style={{ marginTop: 0 }}>مرحبًا {user.full_name} 👋</p>
        {isAdmin ? (
          <div className="card note" style={{ marginTop: 14, padding: 16, borderColor: "#d7e5fa", background: "#eef6ff" }}>
            <strong>أنت متصل كمدير النظام</strong>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              يمكنك هنا مشاهدة إحصائيات عامة للنظام، متابعة آخر الختمات، وفتح أي ختمة لإدارة حالة الأجزاء.
            </p>
          </div>
        ) : null}

        <div className="stat-grid" style={{ marginTop: 18 }}>
          <div className="stat"><div className="v">{stats.active}</div><div className="l">ختمات نشطة</div></div>
          <div className="stat"><div className="v">{stats.completed}</div><div className="l">ختمات مكتملة</div></div>
          <div className="stat"><div className="v">{stats.completedJuz}</div><div className="l">أجزاء مُتمّة</div></div>
          <div className="stat"><div className="v">{stats.avg}%</div><div className="l">متوسط الإنجاز</div></div>
        </div>

        {isAdmin ? (
          <div style={{ marginTop: 22 }}>
            <div className="row" style={{ gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ flex: "1 1 320px", minWidth: 280 }}>
                <div className="stat-grid">
                  <div className="stat"><div className="v">{adminInfo.totalUsers}</div><div className="l">مستخدمون</div></div>
                  <div className="stat"><div className="v">{adminInfo.totalKhatmas}</div><div className="l">كل الختمات</div></div>
                  <div className="stat"><div className="v">{adminInfo.completedJuz}</div><div className="l">أجزاء مكتملة</div></div>
                  <div className="stat"><div className="v">{adminInfo.reservedJuz}</div><div className="l">أجزاء محجوزة</div></div>
                </div>
              </div>
              <div style={{ flex: "1 1 320px", minWidth: 280 }}>
                <div className="card" style={{ background: "#eef6ff", borderColor: "#d8e8f4" }}>
                  <strong style={{ display: "block", marginBottom: 10 }}>وضع مدير النظام</strong>
                  <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
                    يمكنك متابعة تقدم كل الختمات، فتح أي صفحة ختمة كمشرف، وتحديث حالة الأجزاء إذا احتاج الأمر.
                  </p>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <strong style={{ display: "block", marginBottom: 12 }}>آخر الختمات</strong>
              <div className="row" style={{ flexDirection: "column", gap: 12 }}>
                {adminInfo.recentKhatmas.map((k) => (
                  <Link key={k.id} href={`/khatmas/${k.id}`} className="card" style={{ padding: "14px 16px", borderColor: "#dde7f1", background: "#fbfdff" }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15 }}>{k.title}</h3>
                        <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
                          {k.honorName ? `مهدى إلى ${k.honorName}` : "بدون إهداء"} · {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                        </p>
                      </div>
                      <span className={`badge ${k.status}`} style={{ padding: "6px 12px" }}>
                        {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="row" style={{ gap: 16, flexWrap: "wrap", marginTop: 18, marginBottom: 24 }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card highlight-card">
              <strong style={{ display: "block", marginBottom: 10 }}>أبطال التفاعل</strong>
              {stats.topParticipants.length ? (
                <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                  {stats.topParticipants.map((participant) => (
                    <span key={participant.name} className="pill">
                      {participant.name} · {participant.count} جزء
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  لم يبدأ أي مشارك بعد. شارك رابط الختمة لتشجيع أول الأصدقاء.
                </p>
              )}
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card" style={{ background: "#f4f8ff" }}>
              <strong style={{ display: "block", marginBottom: 10 }}>لمحة ذكية</strong>
              <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
                {stats.completed === 0
                  ? "ابدأ أول ختماتك اليوم وادعُ لأحبائك أثناء الحجز."
                  : stats.avg < 40
                  ? "التقدّم في البداية؛ رجاءً شارك تذكيرًا لطيفًا مع من لم يؤكد حصته بعد."
                  : stats.avg < 80
                  ? "جيد جدًا! أعد نشر الرابط لتشجيع بقية المشاركين على إكمال الأجزاء."
                  : "ممتاز — الختمات في طريقها إلى الاكتمال. أكمل شاملًا دعاء ختم القرآن."}
              </p>
              <div style={{ marginTop: 12 }} className="row">
                <Link href="/duas?category=quran_completion" className="btn btn-gold btn-sm">دعاء ختم القرآن</Link>
                <Link href="/duas?category=deceased" className="btn btn-ghost btn-sm">دعاء للمتوفّى</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", margin: "30px 0 14px" }}>
          <h2 className="section-title" style={{ fontSize: 19 }}>ملخّص الختمات</h2>
          <Link href="/khatmas/new" className="btn btn-primary btn-sm">+ ختمة جديدة</Link>
        </div>

        <div className="row" style={{ gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card" style={{ background: "#f7fafc" }}>
              <strong style={{ display: "block", marginBottom: 10 }}>دعاء اليوم الموصى به</strong>
              <p style={{ margin: 0, lineHeight: 1.8 }}>{dailyDuaa.text}</p>
              <div style={{ marginTop: 12 }}>
                <Link href="/duas?category=quran_completion" className="btn btn-gold btn-sm">اطّلع على الأدعية</Link>
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <MemorialDedication father="يحيى علي الحلبي" mother="دلال محمد طاهر اللادقي" />
          </div>
        </div>

        {stats.khatmas.length === 0 ? (
          <div className="card center">
            <p className="muted">لا توجد ختمات بعد. ابدأ ختمتك الأولى الآن.</p>
            <Link href="/khatmas/new" className="btn btn-primary">إنشاء ختمة</Link>
          </div>
        ) : (
          <div className="stat-grid">
            {stats.khatmas.map((k) => (
              <Link key={k.id} href={`/khatmas/${k.id}`} className="card k-card" style={{ textDecoration: "none" }}>
                <div className="top">
                  <h3>{k.title}</h3>
                  <span className={`badge ${k.status}`}>
                    {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                  </span>
                </div>
                <div className="progress"><span style={{ width: `${k.progress.percent}%` }} /></div>
                <div className="meta">{k.progress.completed} / 30 جزء مُتمّ — {k.progress.percent}%</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

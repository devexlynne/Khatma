export const dynamic = 'force-dynamic';
import Link from "next/link";
import Nav from "@/components/Nav";
import EntrySplash from "@/components/EntrySplash";
import MemorialDedication from "@/components/MemorialDedication";
import KidsGardenSection from "@/components/KidsGardenSection";
import { getCurrentUser } from "@/lib/session";
import DailyDhikr from "@/components/DailyDhikr";
import PrayerTimes from "@/components/PrayerTimes";

export default function Home() {
  const user = getCurrentUser();
  // Demo grid preview for the landing page.
  const demo = Array.from({ length: 30 }, (_, i) => {
    const n = i + 1;
    const status = n <= 11 ? "completed" : n <= 18 ? "reserved" : "available";
    return { n, status };
  });
  const labels = { available: "متاح", reserved: "محجوز", completed: "تم" };

  return (
    <>
      <EntrySplash />
      <Nav />
      <div className="container">
        <section className="hero">
          <h1>منصة الختمات الجماعية للقرآن</h1>
          <p>
            نظّم ختمة قرآن مع عائلتك وأصدقائك بسهولة واحترام. أنشئ ختمة، شارك الرابط،
            ودع كل مشارك يحجز جزءًا ويتابع الجميع التقدّم حتى تكتمل الختمة.
          </p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link href={user ? "/khatmas/new" : "/signup"} className="btn btn-primary">
              ابدأ ختمة جديدة
            </Link>
            <Link href={user ? "/dashboard" : "/login"} className="btn btn-ghost">
              {user ? "لوحة التحكم" : "تسجيل الدخول"}
            </Link>
          </div>
        </section>

        <MemorialDedication father="يحيى علي الحلبي" mother="دلال محمد طاهر اللادقي" />

        <PrayerTimes city="Beirut" country="Lebanon" />

        <KidsGardenSection />

        <DailyDhikr />

        <section style={{ marginTop: 10 }}>
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <strong>معاينة شبكة الأجزاء</strong>
              <div className="legend">
                <span><i className="dot completed" /> تم</span>
                <span><i className="dot reserved" /> محجوز</span>
                <span><i className="dot available" /> متاح</span>
              </div>
            </div>
            <div className="juz-grid">
              {demo.map((j) => (
                <div key={j.n} className={`juz ${j.status}`}>
                  <span className="num">{j.n}</span>
                  <span className="lbl">{labels[j.status]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="steps">
          <div className="step"><div className="n">١</div><strong>أنشئ ختمة</strong><p className="muted" style={{ margin: 0, fontSize: 14 }}>سمِّ الختمة وأضف وصفًا اختياريًا.</p></div>
          <div className="step"><div className="n">٢</div><strong>شارك الرابط</strong><p className="muted" style={{ margin: 0, fontSize: 14 }}>أرسل الرابط عبر واتساب أو أي وسيلة.</p></div>
          <div className="step"><div className="n">٣</div><strong>احجز جزءًا</strong><p className="muted" style={{ margin: 0, fontSize: 14 }}>يختار كل مشارك جزءًا متاحًا باسمه فقط.</p></div>
          <div className="step"><div className="n">٤</div><strong>تابع التقدّم</strong><p className="muted" style={{ margin: 0, fontSize: 14 }}>يؤكّد كل مشارك إتمامه حتى تكتمل الختمة.</p></div>
        </section>

        <footer className="center muted" style={{ padding: "40px 0" }}>
          صُنع بحبّ لخدمة كتاب الله — ختمة
        </footer>
      </div>
    </>
  );
}

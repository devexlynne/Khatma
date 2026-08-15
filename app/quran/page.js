export const dynamic = "force-dynamic";

import Link from "next/link";
import Nav from "@/components/Nav";
import { getJuzList, getSurahList } from "@/lib/quranData";

export const metadata = { title: "القرآن الكريم — نور الوالدين" };

export default function QuranIndex() {
  const juzList = getJuzList();
  const surahList = getSurahList();

  return (
    <>
      <Nav />
      <main className="container page">
        <section className="card quran-source-card moroccan-frame">
          <div>
            <h1>القرآن الكريم</h1>
            <p className="muted">
              اقرأ أجزاء القرآن واستمع إليها من داخل نور الوالدين، أو افتح المصحف الإلكتروني المرجعي.
            </p>
          </div>
          <div className="quran-source-actions">
            <a className="btn btn-primary" href="https://quran.islamonline.net/" target="_blank" rel="noreferrer">
              فتح القرآن على إسلام أون لاين
            </a>
            <a className="muted quran-source-link" href="https://tanzil.net/" target="_blank" rel="noreferrer">
              نص القرآن: مشروع تنزيل Tanzil
            </a>
          </div>
        </section>

        <section className="quran-reading-section">
          <div className="quran-section-heading">
            <span>تقسيم الختمة</span>
            <h2>الأجزاء الثلاثون</h2>
            <p className="muted">اختر الجزء الذي تريد قراءته. هذه هي قائمة الأجزاء الأساسية للختمة.</p>
          </div>
          {juzList.length ? (
            <div className="quran-grid">
              {juzList.map((item) => (
                <Link key={item.juz} href={`/quran/${item.juz}`} className="quran-juz-link">
                  <span className="quran-juz-num">الجزء {item.juz}</span>
                  <span className="quran-juz-count">{item.versesCount} آية</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card muted">بيانات القرآن غير متاحة حالياً.</div>
          )}
        </section>

        <section className="quran-reading-section">
          <div className="quran-section-heading">
            <span>قراءة كاملة من الآية الأولى</span>
            <h2>السور القرآنية</h2>
            <p className="muted">اختر السورة لقراءتها كاملة من الآية ١ حتى نهايتها.</p>
          </div>
          {surahList.length ? (
            <div className="quran-grid">
              {surahList.map((surah) => (
                <Link key={surah.number} href={`/quran/surah/${surah.number}`} className="quran-juz-link quran-surah-link">
                  <span className="quran-surah-index">{surah.number}</span>
                  <span className="quran-juz-num">سورة {surah.name}</span>
                  <span className="quran-juz-count">{surah.versesCount} آية</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}

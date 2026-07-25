export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getSurahName } from "@/lib/surahNames";

export const metadata = { title: "القرآن الكريم — نور الوالدين" };

export default function QuranIndex() {
  let juzList = [];
  let surahList = [];
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "quran.json"), "utf8"));
    juzList = data.map((item) => ({ juz: item.juz, versesCount: item.verses.length }));
    const surahMap = new Map();
    data.flatMap((item) => item.verses).forEach((verse) => {
      if (!surahMap.has(verse.surahNumber)) surahMap.set(verse.surahNumber, { number: verse.surahNumber, name: getSurahName(verse.surahNumber), versesCount: 0 });
      surahMap.get(verse.surahNumber).versesCount += 1;
    });
    surahList = [...surahMap.values()];
  } catch {}

  return <><Nav /><main className="container page">
    <section className="card quran-source-card moroccan-frame">
      <div><h1>القرآن الكريم</h1><p className="muted">اقرأ أجزاء القرآن واستمع إليها من داخل نور الوالدين، أو افتح المصحف الإلكتروني المرجعي.</p></div>
      <div className="quran-source-actions">
        <a className="btn btn-primary" href="https://quran.islamonline.net/" target="_blank" rel="noreferrer">فتح القرآن على إسلام أون لاين</a>
        <a className="muted quran-source-link" href="https://tanzil.net/" target="_blank" rel="noreferrer">نص القرآن: مشروع تنزيل Tanzil</a>
      </div>
    </section>
    <section className="quran-reading-section"><div className="quran-section-heading"><span>قراءة كاملة من الآية الأولى</span><h2>السور القرآنية</h2><p className="muted">اختر السورة لقراءتها كاملة من الآية ١ حتى نهايتها، دون تقسيمها بين الأجزاء.</p></div>
      {surahList.length ? <div className="quran-grid">{surahList.map((surah) => <Link key={surah.number} href={`/quran/surah/${surah.number}`} className="quran-juz-link quran-surah-link"><span className="quran-surah-index">{surah.number}</span><span className="quran-juz-num">سورة {surah.name}</span><span className="quran-juz-count">{surah.versesCount} آية</span></Link>)}</div> : <div className="card muted">بيانات القرآن غير متاحة حاليًا.</div>}
    </section>
    <section className="quran-reading-section"><div className="quran-section-heading"><span>تقسيم الختمة</span><h2>الأجزاء الثلاثون</h2><p className="muted">الجزء قد يبدأ في منتصف سورة؛ لذلك يظهر رقم الآية الحقيقي مع عبارة «متابعة السورة».</p></div>
      {juzList.length ? <div className="quran-grid">{juzList.map((item) => <Link key={item.juz} href={`/quran/${item.juz}`} className="quran-juz-link"><span className="quran-juz-num">الجزء {item.juz}</span><span className="quran-juz-count">{item.versesCount} آية</span></Link>)}</div> : null}
    </section>
  </main></>;
}

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata = { title: "القرآن الكريم — نور الوالدين" };

export default function QuranIndex() {
  let juzList = [];
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "quran.json"), "utf8"));
    juzList = data.map((item) => ({ juz: item.juz, versesCount: item.verses.length }));
  } catch {}

  return <><Nav /><main className="container page">
    <section className="card quran-source-card moroccan-frame">
      <div><h1>القرآن الكريم</h1><p className="muted">اقرأ أجزاء القرآن واستمع إليها من داخل نور الوالدين، أو افتح المصحف الإلكتروني المرجعي.</p></div>
      <a className="btn btn-primary" href="https://quran.islamonline.net/" target="_blank" rel="noreferrer">فتح القرآن على إسلام أون لاين</a>
    </section>
    {juzList.length ? <section className="quran-grid">{juzList.map((item) => <Link key={item.juz} href={`/quran/${item.juz}`} className="quran-juz-link"><span className="quran-juz-num">الجزء {item.juz}</span><span className="quran-juz-count">{item.versesCount} آية</span></Link>)}</section> : <div className="card muted">بيانات القرآن غير متاحة حاليًا.</div>}
  </main></>;
}

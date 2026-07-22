export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import Link from "next/link";
import Nav from "@/components/Nav";
import QuranReader from "@/components/QuranReader";
import { notFound } from "next/navigation";

export default function SurahPage({ params }) {
  const surahNumber = Number(params.surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();
  let verses = [];
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "quran.json"), "utf8"));
    verses = data.flatMap((item) => item.verses).filter((verse) => verse.surahNumber === surahNumber).sort((a,b) => a.numberInSurah-b.numberInSurah);
  } catch {}
  if (!verses.length) notFound();
  return <><Nav /><main className="container page quran-surah-page">
    <div className="row quran-surah-nav"><Link href="/quran" className="btn btn-ghost btn-sm">العودة إلى فهرس القرآن</Link><span className="badge active">{verses.length} آية</span></div>
    <QuranReader verses={verses} initialFont={30} audioUrls={[]} />
  </main></>;
}

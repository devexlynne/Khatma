export const dynamic = "force-dynamic";

import Link from "next/link";
import Nav from "@/components/Nav";
import QuranReader from "@/components/QuranReader";
import { getSurahVerses } from "@/lib/quranData";
import { notFound } from "next/navigation";

export default function SurahPage({ params }) {
  const surahNumber = Number(params.surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  const verses = getSurahVerses(surahNumber);
  if (!verses.length) notFound();

  return (
    <>
      <Nav />
      <main className="container page quran-surah-page">
        <div className="row quran-surah-nav">
          <Link href="/quran" className="btn btn-ghost btn-sm">العودة إلى فهرس القرآن</Link>
          <span className="badge active">{verses.length} آية</span>
        </div>
        <QuranReader verses={verses} initialFont={30} />
      </main>
    </>
  );
}

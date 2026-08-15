export const dynamic = "force-dynamic";

import Link from "next/link";
import Nav from "@/components/Nav";
import QuranJuzPlayer from "../../../components/QuranJuzPlayer";
import KidsGardenSection from "../../../components/KidsGardenSection";
import { getJuzData } from "@/lib/quranData";

export default function JuzPage({ params }) {
  const juzNum = Number(params.juz || 1);
  const jdata = getJuzData(juzNum);

  if (!jdata) {
    return (
      <div className="container page">
        <div className="card quran-reader-card">
          <h1 className="section-title">الجزء {juzNum}</h1>
          <p className="muted">الجزء غير موجود في بيانات القرآن.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div className="container page quran-juz-page" style={{ maxWidth: 1240 }}>
        <style>{`
          @media (max-width: 760px) {
            .quran-juz-page {
              padding-left: 8px;
              padding-right: 8px;
            }

            .quran-reader-card {
              padding: 14px 12px 18px;
              border-radius: 10px;
            }
          }
        `}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Link href="/quran" className="btn btn-ghost btn-sm">
            ← رجوع
          </Link>
        </div>
        <div className="card quran-reader-card">
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px 0", color: "#7e22ce", textAlign: "center" }}>
              الجزء {juzNum}
            </h1>
            <p className="muted" style={{ fontSize: 14, margin: 0, textAlign: "center" }}>
              {jdata.verses.length} آية
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #f3e8f8 0%, #ede9fe 100%)", padding: 16, borderRadius: 14, marginBottom: 22, textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>استمتع بقراءة القرآن الكريم</p>
          </div>
          <div>
            <QuranJuzPlayer verses={jdata.verses} juzNum={juzNum} initialFont={28} />
          </div>
          <KidsGardenSection />
        </div>
      </div>
    </>
  );
}

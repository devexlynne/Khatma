export const dynamic = 'force-dynamic';
import fs from "fs";
import path from "path";
import Link from "next/link";
import QuranJuzPlayer from "../../../components/QuranJuzPlayer";
import KidsGardenSection from "../../../components/KidsGardenSection";

export default function JuzPage({ params }) {
  const juzNum = Number(params.juz || 1);
  const dataPath = path.join(process.cwd(), "data", "quran.json");
  if (!fs.existsSync(dataPath)) {
    return (
      <div className="container page">
        <div className="card quran-reader-card">
          <h1 className="section-title">الجزء {juzNum}</h1>
          <p className="muted">بيانات القرآن غير متوفرة محليًا.</p>
          <p className="muted">شغِّل <strong>npm run fetch-quran</strong> لإنشاء <code>data/quran.json</code>.</p>
        </div>
      </div>
    );
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  let arr = [];
  try { arr = JSON.parse(raw); } catch (err) { arr = []; }
  const jdata = arr.find((j) => j.juz === juzNum);
  if (!jdata) {
    return (
      <div className="container page">
        <div className="card quran-reader-card">
          <h1 className="section-title">الجزء {juzNum}</h1>
          <p className="muted">الجزء غير موجود في الملف.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page quran-juz-page" style={{ maxWidth: 820 }}>
      <style>{`
        .quran-verse {
          direction: rtl;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--line);
        }
        .quran-verse:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .verse-text {
          font-size: 26px;
          line-height: 1.9;
          color: var(--ink);
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.02em;
        }
        .verse-ref {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: var(--muted);
          font-weight: 700;
        }
        .surah-badge {
          background: var(--gold-soft);
          color: #a07d22;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 700;
        }
        .verse-num {
          background: #f3e8f8;
          color: #7e22ce;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
        }
        @media (max-width: 760px) {
          .quran-juz-page {
            padding-left: 8px;
            padding-right: 8px;
          }

          .quran-reader-card {
            padding: 14px 12px 18px;
            border-radius: 10px;
          }
        }      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/quran" className="btn btn-ghost btn-sm">
          ← رجوع
        </Link>
      </div>
      <div className="card quran-reader-card">
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px 0", color: "#7e22ce", textAlign: "center" }}>الجزء {juzNum}</h1>
          <p className="muted" style={{ fontSize: 14, margin: 0, textAlign: "center" }}>{jdata.verses.length} آية</p>
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
  );
}

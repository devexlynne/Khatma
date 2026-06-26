export const dynamic = 'force-dynamic';
import fs from "fs";
import path from "path";
import Link from "next/link";

export default function QuranIndex() {
  const dataPath = path.join(process.cwd(), "data", "quran.json");
  let juzList = null;
  if (fs.existsSync(dataPath)) {
    try {
      const raw = fs.readFileSync(dataPath, "utf8");
      const arr = JSON.parse(raw);
      juzList = arr.map((j) => ({ juz: j.juz, versesCount: j.verses.length }));
    } catch (err) {
      console.error("Failed to read quran.json", err);
    }
  }

  return (
    <div className="container page">
      <style>{`
        .quran-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        .quran-juz-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          border-radius: 18px;
          background: linear-gradient(135deg, #f3e8f8, #f8f3fc);
          border: 2px solid rgba(147, 51, 234, 0.2);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          min-height: 110px;
          color: var(--ink);
        }
        .quran-juz-link:hover {
          border-color: #9333ea;
          box-shadow: 0 8px 24px rgba(147, 51, 234, 0.2);
          transform: translateY(-4px);
          background: linear-gradient(135deg, #ede9fe, #f5f3ff);
        }
        .quran-juz-num {
          font-size: 28px;
          font-weight: 900;
          color: #7e22ce;
          margin-bottom: 6px;
        }
        .quran-juz-count {
          font-size: 13px;
          color: var(--muted);
          font-weight: 700;
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/" className="btn btn-ghost btn-sm">
          ← رجوع
        </Link>
      </div>
      <div className="card">
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px 0", color: "#7e22ce" }}>القرآن الكريم</h1>
        <p className="muted" style={{ fontSize: 15, marginBottom: 16 }}>استكشف أجزاء القرآن الـ 30 واختر جزءاً للعرض</p>
        {!juzList && (
          <div>
            <p className="muted">لم يتم العثور على بيانات القرآن محليًا.</p>
            <p className="muted">شغِّل <strong>npm run fetch-quran</strong> لإنشاء <code>data/quran.json</code>.</p>
          </div>
        )}
        {juzList && (
          <div className="quran-grid">
            {juzList.map((j) => (
              <Link key={j.juz} href={`/quran/${j.juz}`} className="quran-juz-link">
                <div className="quran-juz-num">الجزء {j.juz}</div>
                <div className="quran-juz-count">{j.versesCount} آية</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

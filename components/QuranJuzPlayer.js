"use client";

import { useEffect, useState } from "react";
import QuranReader from "./QuranReader";

const readers = [
  { ids: ["ar.alafasy"], label: "مشاري العفاسي" },
  { ids: ["ar.abdulbasitmurattal"], label: "عبد الباسط مرتل" },
  { ids: ["ar.abdulbasit"], label: "عبد الباسط" },
  { ids: ["ar.husary"], label: "محمود خليل الحصري" },
  { ids: ["ar.minshawy"], label: "محمد المنشاوي" },
  { ids: ["ar.hani"], label: "هاني" },
  { ids: ["ar.shaatree", "ar.ali_shaati", "ar.ash_shatree"], label: "أحمد الشاطري" },
  { ids: ["ar.maher"], label: "ماهر المعيقلي" },
  { ids: ["ar.sudais"], label: "عبد الرحمن السديس" },
  { ids: ["ar.khalil"], label: "خليل الحصري" },
  { ids: ["ar.tariq"], label: "طارق" },
  { ids: ["ar.abdulaziz_alkarani", "ar.abdulazizalkarani", "ar.abdulaziz_al_karani"], label: "عبد العزيز الكرعاني" },
  { ids: ["ar.ali_jaber", "ar.ali_gaber", "ar.ali_jabir"], label: "علي جابر" },
  { ids: ["ar.haytham_aldukhayyin", "ar.haitham_aldukhayn", "ar.haytham_aldokheen"], label: "هيثم الدخين" },
  { ids: ["ar.khalifa_al_tuniji", "ar.khalifa_altuniji", "ar.khalifa_tunaji"], label: "خليفة الطنيجي" },
  { ids: ["ar.nasser_kotami", "ar.nasser_alqatami", "ar.nasir_qatami"], label: "ناصر قطامي" },
];

export default function QuranJuzPlayer({ verses = [], juzNum = 1, initialFont = 26 }) {
  const [selectedReader, setSelectedReader] = useState("");
  const [audioUrls, setAudioUrls] = useState([]);
  const [availableReaders, setAvailableReaders] = useState([]);
  const [readerAudioMap, setReaderAudioMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAudio() {
      setLoading(true);
      setError("");
      setAudioUrls([]);
      setAvailableReaders([]);
      setReaderAudioMap({});

      try {
        const readerResults = await Promise.all(
          readers.map(async (reader) => {
            for (const id of reader.ids) {
              try {
                const res = await fetch(`https://api.alquran.cloud/v1/juz/${juzNum}/${id}`);
                if (!res.ok) continue;
                const json = await res.json();
                const urls = Array.isArray(json?.data?.ayahs)
                  ? json.data.ayahs.map((ayah) => ayah.audio).filter(Boolean)
                  : [];
                if (urls.length > 0) {
                  return { id, label: reader.label, urls };
                }
              } catch (err) {
                continue;
              }
            }
            return null;
          })
        );

        const available = readerResults.filter(Boolean);
        if (available.length === 0) {
          throw new Error("No available readers for this Juz");
        }

        const map = {};
        available.forEach((entry) => {
          map[entry.id] = entry.urls;
        });
        if (!cancelled) {
          setReaderAudioMap(map);
          setAvailableReaders(available.map((entry) => ({ id: entry.id, label: entry.label })));
          const initial = available[0].id;
          setSelectedReader(initial);
          setAudioUrls(map[initial]);
        }
      } catch (err) {
        if (!cancelled) {
          setError("تعذر تحميل الصوت لهذا القارئ. حاول قارئًا آخر.");
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAudio();
    return () => {
      cancelled = true;
    };
  }, [juzNum]);

  useEffect(() => {
    if (selectedReader && readerAudioMap[selectedReader]) {
      setAudioUrls(readerAudioMap[selectedReader]);
      setError("");
    }
  }, [selectedReader, readerAudioMap]);

  return (
    <div>
      <div style={{ marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <label htmlFor="reader-select" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>اختر القارئ</label>
          <select
            id="reader-select"
            value={selectedReader}
            onChange={(e) => setSelectedReader(e.target.value)}
            style={{ minWidth: 220, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
          >
                {availableReaders.length > 0
                  ? availableReaders.map((reader) => (
                      <option key={reader.id} value={reader.id}>{reader.label}</option>
                    ))
                  : readers.map((reader) => (
                      <option key={reader.ids[0]} value={reader.ids[0]}>{reader.label}</option>
                    ))}
          </select>
        </div>

        <div style={{ minWidth: 240, textAlign: "right" }}>
          {loading && <p style={{ margin: 0, color: "var(--muted)" }}>التحقق من القُرّاء المتاحين...</p>}
          {!loading && error && <p style={{ margin: 0, color: "#b74444" }}>{error}</p>}
          {!loading && !error && audioUrls.length === 0 && <p style={{ margin: 0, color: "var(--muted)" }}>لا توجد ملفات صوتية متاحة حاليًا.</p>}
          {!loading && !error && audioUrls.length > 0 && (
            <p style={{ margin: 0, color: "var(--muted)" }}>الصوت جاهز للتشغيل.</p>
          )}
        </div>
      </div>

      <QuranReader verses={verses} initialFont={initialFont} audioUrls={audioUrls} />
    </div>
  );
}

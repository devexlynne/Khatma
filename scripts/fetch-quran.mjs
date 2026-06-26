// scripts/fetch-quran.mjs
// Fetch all 30 juz Arabic text using the AlQuran Cloud public API
// Writes data/quran.json with structure: [{ juz: 1, verses: [{ surahNumber, surahName, numberInSurah, text, aya }...] }, ...]

import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "quran.json");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchJuz(juz) {
  const url = `https://api.alquran.cloud/v1/juz/${juz}/quran-uthmani`;
  console.log(`Fetching juz ${juz}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch juz ${juz}: ${res.status}`);
  const data = await res.json();
  // API may return verses in `data` or `data.ayahs` depending on endpoint
  const rawVerses = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.data?.ayahs)
    ? data.data.ayahs
    : Array.isArray(data.ayahs)
    ? data.ayahs
    : null;
  if (!rawVerses) throw new Error(`Unexpected response shape for juz ${juz}`);
  const verses = rawVerses.map((v) => ({
    surahNumber: v.surah.number,
    surahName: v.surah.name,
    surahEnglishName: v.surah.englishName,
    numberInSurah: v.numberInSurah,
    aya: v.number,
    text: v.text,
  }));
  return { juz, verses };
}

async function main() {
  const out = [];
  for (let j = 1; j <= 30; j++) {
    try {
      const jdata = await fetchJuz(j);
      out.push(jdata);
      // be polite
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${OUT_FILE}`);
}

main();

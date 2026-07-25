// scripts/fetch-quran.mjs
// Fetch Quran text from Tanzil Project Uthmani text.
// Tanzil terms require clear source attribution and prohibit changing the Quran text.
// The existing data/quran.json structure is preserved for juz grouping and metadata.
// Writes data/quran.json with structure: [{ juz: 1, verses: [{ surahNumber, surahName, numberInSurah, text, aya }...] }, ...]

import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "quran.json");
const TANZIL_SOURCE_URL =
  "https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&marks=true&sajdah=true&tatweel=true&agree=true";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchTanzilVerses() {
  const res = await fetch(TANZIL_SOURCE_URL, {
    headers: { "User-Agent": "khatma-quran-source-audit/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch Tanzil Quran text: ${res.status}`);
  const text = await res.text();
  const verses = new Map();

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const [surahRaw, ayahRaw, ...textParts] = line.split("|");
      const surahNumber = Number(surahRaw);
      const numberInSurah = Number(ayahRaw);
      const verseText = textParts.join("|").trim();
      if (!Number.isInteger(surahNumber) || !Number.isInteger(numberInSurah) || !verseText) {
        throw new Error(`Unexpected Tanzil line: ${line.slice(0, 80)}`);
      }
      verses.set(`${surahNumber}:${numberInSurah}`, verseText);
    });

  if (verses.size !== 6236) {
    throw new Error(`Expected 6236 ayat from Tanzil, got ${verses.size}`);
  }
  return verses;
}

function loadExistingStructure() {
  if (!fs.existsSync(OUT_FILE)) {
    throw new Error("data/quran.json is required as the local juz/surah structure template.");
  }
  const data = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  if (!Array.isArray(data) || data.length !== 30) {
    throw new Error("data/quran.json must contain 30 juz entries before replacing Quran text.");
  }
  return data;
}

async function main() {
  try {
    console.log("Fetching Tanzil Uthmani Quran text...");
    const tanzilVerses = await fetchTanzilVerses();
    const structure = loadExistingStructure();

    let globalAyah = 0;
    const out = structure.map((juz) => ({
      ...juz,
      verses: juz.verses.map((verse) => {
        globalAyah += 1;
        const key = `${verse.surahNumber}:${verse.numberInSurah}`;
        const text = tanzilVerses.get(key);
        if (!text) throw new Error(`Missing Tanzil text for ${key}`);
        return { ...verse, aya: globalAyah, text };
      }),
    }));

    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
    console.log(`Wrote ${OUT_FILE} from Tanzil Project Uthmani text.`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

main();

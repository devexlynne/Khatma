import fs from "node:fs";
import path from "node:path";
import { DUAS } from "../lib/dhikrData.js";

const QURAN_FILE = path.join(process.cwd(), "data", "quran.json");
const SOURCE_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";

function fail(message) {
  throw new Error(`Quran audit failed: ${message}`);
}

function cleanText(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}

function searchableArabic(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[ءٱأإآ]/g, "ا")
    .replace(/ا+/g, "ا")
    .replace(/ا/g, "")
    .replace(/ى/g, "")
    .replace(/ؤ/g, "و")
    .replace(/و+/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ي/g, "")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/[^ء-ي]/g, "");
}

function localVerses() {
  const juz = JSON.parse(fs.readFileSync(QURAN_FILE, "utf8"));
  if (!Array.isArray(juz) || juz.length !== 30) fail(`expected 30 Juz, found ${juz?.length ?? 0}`);
  juz.forEach((entry, index) => {
    if (entry.juz !== index + 1) fail(`Juz order is broken at position ${index + 1}`);
    if (!Array.isArray(entry.verses) || entry.verses.length === 0) fail(`Juz ${entry.juz} has no verses`);
  });
  return juz.flatMap((entry) => entry.verses);
}

function auditStructure(verses) {
  if (verses.length !== 6236) fail(`expected 6236 ayat, found ${verses.length}`);
  if (new Set(verses.map((verse) => verse.aya)).size !== 6236) fail("global ayah numbers are duplicated");

  const surahs = new Map();
  verses.forEach((verse, index) => {
    if (verse.aya !== index + 1) fail(`global numbering breaks at ayah ${index + 1}`);
    if (!surahs.has(verse.surahNumber)) surahs.set(verse.surahNumber, []);
    surahs.get(verse.surahNumber).push(verse);
  });
  if (surahs.size !== 114) fail(`expected 114 surahs, found ${surahs.size}`);

  for (let surah = 1; surah <= 114; surah += 1) {
    const ayat = surahs.get(surah);
    if (!ayat?.length) fail(`Surah ${surah} is missing`);
    ayat.forEach((verse, index) => {
      if (verse.numberInSurah !== index + 1) fail(`Surah ${surah} starts or continues with a wrong ayah number`);
      if (!cleanText(verse.text)) fail(`Surah ${surah}, ayah ${index + 1} has empty text`);
    });
  }
}

function auditDuaaContent(verses) {
  const expectedCounts = { deceased: 13, quran_completion: 1, parents: 4, morning: 23, evening: 21, sleep: 13, names: 1 };
  Object.entries(expectedCounts).forEach(([category, expected]) => {
    if (DUAS[category]?.length !== expected) fail(`${category} contains ${DUAS[category]?.length ?? 0} entries instead of ${expected}`);
  });
  if (DUAS.names[0]?.names?.length !== 99) fail("the Names of Allah chapter does not contain 99 names");

  const quranSearchText = searchableArabic(verses.map((verse) => verse.text).join(" "));
  const quotes = Object.values(DUAS)
    .flat()
    .flatMap((entry) => [...String(entry.text || "").matchAll(/﴿([^﴾]+)﴾/g)].map((match) => match[1]));

  quotes.forEach((quote) => {
    const normalized = searchableArabic(quote);
    if (!normalized || !quranSearchText.includes(normalized)) fail(`Quran quotation does not match the verified text: ${quote.slice(0, 60)} [normalized: ${normalized.slice(0, 100)}]`);
  });
}

async function auditAgainstSource(local) {
  const response = await fetch(SOURCE_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) fail(`verified source returned HTTP ${response.status}`);
  const payload = await response.json();
  const remote = payload?.data?.surahs?.flatMap((surah) => surah.ayahs.map((ayah) => ({
    surahNumber: surah.number,
    numberInSurah: ayah.numberInSurah,
    aya: ayah.number,
    text: cleanText(ayah.text),
  }))) || [];
  if (remote.length !== local.length) fail(`verified source has ${remote.length} ayat while the app has ${local.length}`);

  local.forEach((verse, index) => {
    const source = remote[index];
    if (verse.aya !== source.aya || verse.surahNumber !== source.surahNumber || verse.numberInSurah !== source.numberInSurah) {
      fail(`numbering differs from the verified source at global ayah ${index + 1}`);
    }
    if (cleanText(verse.text) !== source.text) {
      fail(`text differs from the verified source at ${verse.surahNumber}:${verse.numberInSurah}`);
    }
  });
}

const verses = localVerses();
auditStructure(verses);
auditDuaaContent(verses);
await auditAgainstSource(verses);
console.log(`Quran audit passed: ${verses.length} ayat, 114 surahs, 30 Juz, and all embedded Quran quotations match ${SOURCE_URL}.`);

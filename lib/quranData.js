import quranData from "@/data/quran.json";
import { getSurahName } from "./surahNames.js";

export function getQuranData() {
  return Array.isArray(quranData) ? quranData : [];
}

export function getJuzList() {
  return getQuranData().map((item) => ({
    juz: item.juz,
    versesCount: Array.isArray(item.verses) ? item.verses.length : 0,
  }));
}

export function getJuzData(juzNumber) {
  return getQuranData().find((item) => item.juz === Number(juzNumber)) || null;
}

export function getSurahList() {
  const surahMap = new Map();

  getQuranData()
    .flatMap((item) => item.verses || [])
    .forEach((verse) => {
      if (!surahMap.has(verse.surahNumber)) {
        surahMap.set(verse.surahNumber, {
          number: verse.surahNumber,
          name: getSurahName(verse.surahNumber),
          versesCount: 0,
        });
      }

      surahMap.get(verse.surahNumber).versesCount += 1;
    });

  return [...surahMap.values()];
}

export function getSurahVerses(surahNumber) {
  return getQuranData()
    .flatMap((item) => item.verses || [])
    .filter((verse) => verse.surahNumber === Number(surahNumber))
    .sort((a, b) => a.numberInSurah - b.numberInSurah);
}

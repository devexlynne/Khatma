export const QURAN_RECITERS = [
  { id: "alafasy", label: "مشاري العفاسي", baseUrl: "https://everyayah.com/data/Alafasy_128kbps" },
  { id: "abdulbasit", label: "عبد الباسط عبد الصمد", baseUrl: "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps" },
  { id: "husary", label: "محمود خليل الحصري", baseUrl: "https://everyayah.com/data/Husary_64kbps" },
  { id: "minshawy", label: "محمد صديق المنشاوي", baseUrl: "https://everyayah.com/data/Minshawy_Murattal_128kbps" },
  { id: "maher", label: "ماهر المعيقلي", baseUrl: "https://everyayah.com/data/MaherAlMuaiqly128kbps" },
];

export function quranAudioUrl(reciter, surahNumber, ayahNumber) {
  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");
  return `${reciter.baseUrl}/${surah}${ayah}.mp3`;
}

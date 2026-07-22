"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function QuranReader({ verses = [], initialFont = 26, audioUrls = [] }) {
  const [fontSize, setFontSize] = useState(initialFont);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [selectedAya, setSelectedAya] = useState(verses[0]?.aya ?? null);
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quranFontSize");
      if (saved) setFontSize(Number(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("quranFontSize", String(fontSize));
    } catch (e) {}
  }, [fontSize]);

  useEffect(() => {
    setSelectedAya(verses[0]?.aya ?? null);
    setCurrentTrack(0);
    trackIndexRef.current = 0;
  }, [verses]);

  const selectedIndex = useMemo(() => {
    return Math.max(0, verses.findIndex((verse) => verse.aya === selectedAya));
  }, [selectedAya, verses]);

  const activeAya = isPlaying ? verses[currentTrack]?.aya : selectedAya;

  const playAudio = async (startIndex = selectedIndex) => {
    const audio = audioRef.current;
    if (!audio || !audioUrls || audioUrls.length === 0) return;

    const safeIndex = Math.min(Math.max(startIndex, 0), audioUrls.length - 1);
    trackIndexRef.current = safeIndex;
    setCurrentTrack(safeIndex);
    setSelectedAya(verses[safeIndex]?.aya ?? null);
    audio.src = audioUrls[safeIndex];

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleAudioEnded = async () => {
    if (!audioUrls || audioUrls.length === 0) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = trackIndexRef.current + 1;
    if (nextIndex >= audioUrls.length) {
      setIsPlaying(false);
      trackIndexRef.current = 0;
      setCurrentTrack(0);
      return;
    }

    trackIndexRef.current = nextIndex;
    setCurrentTrack(nextIndex);
    setSelectedAya(verses[nextIndex]?.aya ?? null);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioUrls[nextIndex];
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const increase = () => setFontSize((size) => Math.min(42, size + 2));
  const decrease = () => setFontSize((size) => Math.max(18, size - 2));
  const reset = () => setFontSize(initialFont);
  const toArabicDigits = (value) => String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

  return (
    <div className="mushaf-reader">
      <style>{`
        .mushaf-reader {
          direction: rtl;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .mushaf-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          margin-bottom: 14px;
          padding: 10px;
          border-radius: 8px;
          background: #4f8a32;
          color: #fff;
          box-shadow: 0 8px 22px rgba(57, 102, 34, 0.2);
        }

        .mushaf-toolbar-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mushaf-btn {
          min-width: 42px;
          height: 38px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          transition: background 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }

        .mushaf-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
        }

        .mushaf-btn:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .mushaf-page {
          position: relative;
          width: 100%;
          max-width: 100%;
          min-height: 560px;
          padding: 38px 30px 48px;
          border-radius: 4px;
          background: #fff;
          border: 1px solid #edf2e8;
          box-shadow: 0 10px 32px rgba(42, 92, 150, 0.07);
          overflow: hidden;
        }

        .mushaf-page::before,
        .mushaf-page::after {
          display: none;
        }

        .mushaf-page::before { top: 16px; }
        .mushaf-page::after { bottom: 16px; }

        .mushaf-text {
          position: relative;
          z-index: 1;
          color: #0561b8;
          font-family: "Amiri Quran", "Amiri", "Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif;
          line-height: 2.35;
          text-align: justify;
          text-align-last: center;
          font-weight: 400;
          overflow-wrap: normal;
          word-spacing: 0.06em;
        }

        .mushaf-surah-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 18px auto 16px;
          color: #0561b8;
          font-family: "Amiri Quran", "Amiri", serif;
          font-size: 24px;
          line-height: 1.6;
          font-weight: 900;
          text-align: center;
        }

        .mushaf-surah-title::before,
        .mushaf-surah-title::after {
          content: "";
          width: min(120px, 22vw);
          height: 2px;
          background: linear-gradient(90deg, transparent, #dceecf, transparent);
        }

        .mushaf-ayah {
          display: inline;
          padding: 0 2px;
          border-radius: 8px;
          cursor: pointer;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        }

        .mushaf-ayah:hover,
        .mushaf-ayah:focus-visible {
          outline: none;
          background: rgba(226, 244, 213, 0.7);
        }

        .mushaf-ayah.is-active {
          background: rgba(226, 244, 213, 0.72);
          color: #48a6ce;
          box-shadow: none;
        }

        .mushaf-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.9em;
          height: 1.9em;
          margin: 0 0.15em;
          padding: 0 0.28em;
          color: #526e3c;
          border: 0;
          border-radius: 50%;
          font-family: "Amiri Quran", "Amiri", serif;
          font-size: 0.46em;
          font-weight: 700;
          vertical-align: 0.22em;
          background: #e3f3d8;
          white-space: nowrap;
        }

        .mushaf-marker::before,
        .mushaf-marker::after {
          content: "۞";
          font-size: 0.72em;
          color: #758a61;
          margin: 0 0.05em;
        }

        .mushaf-status {
          margin-top: 12px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        @media (max-width: 760px) {
          .mushaf-reader {
            margin-left: -12px;
            margin-right: -12px;
            width: calc(100% + 24px);
            max-width: calc(100% + 24px);
          }

          .mushaf-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 8px;
            border-radius: 0;
            margin-bottom: 10px;
          }

          .mushaf-page {
            min-height: 520px;
            padding: 24px 14px 34px;
            border-radius: 0;
          }

          .mushaf-text {
            line-height: 2.2;
            text-align: justify;
            text-align-last: center;
          }

          .mushaf-ayah {
            padding: 0 3px;
            border-radius: 7px;
          }

          .mushaf-surah-title {
            gap: 8px;
            margin: 14px auto 12px;
            font-size: 16px;
          }

          .mushaf-surah-title::before,
          .mushaf-surah-title::after {
            width: min(70px, 18vw);
          }
        }

        @media (max-width: 390px) {
          .mushaf-reader {
            margin-left: -16px;
            margin-right: -16px;
            width: calc(100% + 32px);
            max-width: calc(100% + 32px);
          }

          .mushaf-page {
            padding: 24px 10px 32px;
          }

          .mushaf-text {
            font-size: min(var(--mushaf-font-size), 24px) !important;
          }

          .mushaf-btn {
            min-width: 38px;
            height: 36px;
            padding: 0 10px;
          }
        }
      `}</style>

      <div className="mushaf-toolbar" aria-label="أدوات قارئ القرآن">
        <div className="mushaf-toolbar-group">
          <button className="mushaf-btn" onClick={decrease} aria-label="تقليل حجم الخط">A-</button>
          <button className="mushaf-btn" onClick={reset} aria-label="إعادة حجم الخط">إعادة</button>
          <button className="mushaf-btn" onClick={increase} aria-label="تكبير حجم الخط">A+</button>
        </div>

        <div className="mushaf-toolbar-group">
          {audioUrls?.length > 0 ? (
            <>
              <button className="mushaf-btn" onClick={() => playAudio(selectedIndex)} disabled={isPlaying}>
                تشغيل
              </button>
              <button className="mushaf-btn" onClick={stopPlayback} disabled={!isPlaying}>
                إيقاف
              </button>
            </>
          ) : null}
        </div>
      </div>

      <audio ref={audioRef} hidden onEnded={handleAudioEnded} />

      <div className="mushaf-page">
        <div className="mushaf-text" style={{ fontSize: `${fontSize}px`, "--mushaf-font-size": `${fontSize}px` }}>
          {verses.map((verse, index) => {
            const startsSurah = index === 0 || verse.surahNumber !== verses[index - 1]?.surahNumber;
            const isActive = verse.aya === activeAya;

            return (
              <span key={verse.aya}>
                {startsSurah ? (
                  <span className="mushaf-surah-title">{verse.numberInSurah === 1 ? verse.surahName : `متابعة ${verse.surahName} — من الآية ${toArabicDigits(verse.numberInSurah)}`}</span>
                ) : " "}
                <span
                  className={`mushaf-ayah${isActive ? " is-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setSelectedAya(verse.aya)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAya(verse.aya);
                    }
                  }}
                >
                  {verse.text?.replace(/^\uFEFF/, "")}
                  <span className="mushaf-marker" aria-label={`الآية ${verse.numberInSurah}`}>
                    {toArabicDigits(verse.numberInSurah)}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="mushaf-status">
        {activeAya ? `الآية المحددة ${verses.find((verse) => verse.aya === activeAya)?.numberInSurah ?? ""}` : "اختر آية"}
      </div>
    </div>
  );
}

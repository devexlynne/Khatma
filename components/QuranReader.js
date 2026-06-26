"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function QuranReader({ verses = [], initialFont = 26, audioUrls = [] }) {
  const [fontSize, setFontSize] = useState(initialFont);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
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

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrls || audioUrls.length === 0) return;

    trackIndexRef.current = 0;
    setCurrentTrack(0);
    audio.src = audioUrls[0];

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
    trackIndexRef.current = 0;
    setCurrentTrack(0);
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

  const increase = () => setFontSize((s) => Math.min(40, s + 2));
  const decrease = () => setFontSize((s) => Math.max(16, s - 2));
  const reset = () => setFontSize(initialFont);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-sm btn-ghost" onClick={decrease} aria-label="تقليل الخط">A-</button>
          <button className="btn btn-sm btn-ghost" onClick={reset} aria-label="إعادة ضبط">إعادة</button>
          <button className="btn btn-sm btn-primary" onClick={increase} aria-label="تكبير الخط">A+</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {audioUrls?.length > 0 ? (
            <>
              <button className="btn btn-sm btn-secondary" onClick={playAudio} disabled={isPlaying}>
                تشغيل التلاوة الصوتية
              </button>
              <button className="btn btn-sm btn-ghost" onClick={stopPlayback} disabled={!isPlaying}>
                إيقاف
              </button>
            </>
          ) : null}
        </div>
      </div>

      <audio ref={audioRef} hidden onEnded={handleAudioEnded} />

      <div>
        {verses.map((v) => (
          <div key={v.aya} className="quran-verse">
            <div
              className="verse-text"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.9,
                fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Arial', serif",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              {v.text}
            </div>
            <div className="verse-ref">
              <span className="surah-badge">{v.surahName}</span>
              <span className="verse-num">{v.numberInSurah}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

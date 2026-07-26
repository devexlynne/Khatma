"use client";

import QuranReader from "./QuranReader";

export default function QuranJuzPlayer({ verses = [], initialFont = 26 }) {
  return <QuranReader verses={verses} initialFont={initialFont} />;
}

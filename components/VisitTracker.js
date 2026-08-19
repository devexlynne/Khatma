"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    const path = `${pathname || "/"}${query ? `?${query}` : ""}`;
    const payload = JSON.stringify({
      path,
      referrer: document.referrer || "",
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/visits", blob);
      return;
    }

    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}

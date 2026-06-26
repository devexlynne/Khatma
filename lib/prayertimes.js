import fs from "fs";
import path from "path";

const CACHE_PATH = process.env.KHATMA_PRAYERS_CACHE || path.join(process.cwd(), "data", "prayertimes_cache.json");
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
}

function writeCache(cache) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
  } catch (e) {
    // ignore
  }
}

export async function getPrayerTimes({ city = "Beirut", country = "Lebanon", method = 2 } = {}) {
  const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const cacheKey = `${city}|${country}|${dateKey}|m${method}`;
  const cache = readCache();
  const entry = cache[cacheKey];
  const now = Date.now();
  if (entry && entry.fetched_at && now - entry.fetched_at < TTL_MS) {
    return entry.data;
  }

  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "khatma/1" } });
    if (!res.ok) throw new Error("fetch_failed");
    const json = await res.json();
    if (json && json.data) {
      const obj = {
        timings: json.data.timings,
        date: json.data.date,
        meta: json.data.meta,
      };
      cache[cacheKey] = { fetched_at: now, data: obj };
      writeCache(cache);
      return obj;
    }
  } catch (err) {
    // fallback to cache if available
    if (entry && entry.data) return entry.data;
    throw err;
  }
}

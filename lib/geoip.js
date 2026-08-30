const globalForGeoIp = globalThis;
const SUCCESS_CACHE_MS = 24 * 60 * 60 * 1000;
const FAILURE_CACHE_MS = 5 * 60 * 1000;

function isPrivateIp(ip) {
  if (!ip) return true;
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

function clean(value, limit = 80) {
  return String(value || "").trim().slice(0, limit) || null;
}

export function getClientIp(headerList) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return headerList.get("x-real-ip") || headerList.get("cf-connecting-ip") || null;
}

function countryNameFromCode(code) {
  const normalized = clean(code, 2)?.toUpperCase();
  if (!normalized || normalized === "XX" || normalized === "T1") return null;
  try {
    return new Intl.DisplayNames(["ar", "en"], { type: "region" }).of(normalized) || normalized;
  } catch {
    return normalized;
  }
}

export function getGeoFromHeaders(headerList) {
  const countryCode =
    headerList.get("x-vercel-ip-country") ||
    headerList.get("cf-ipcountry") ||
    headerList.get("cloudfront-viewer-country");
  const country = countryNameFromCode(countryCode);
  const city = clean(
    headerList.get("x-vercel-ip-city") ||
    headerList.get("cf-ipcity") ||
    headerList.get("cloudfront-viewer-city")
  );
  return { country, city };
}

async function fetchGeo(url, parse) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "Khatma/1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("geo_lookup_failed");
  return parse(await response.json());
}

export async function lookupIpGeo(ip, headerGeo = {}) {
  if (headerGeo.country) return { country: headerGeo.country, city: headerGeo.city || null };
  if (isPrivateIp(ip)) return { country: null, city: null };

  globalForGeoIp.__khatmaGeoIpCache ||= new Map();
  const cache = globalForGeoIp.__khatmaGeoIpCache;
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const providers = process.env.GEOIP_API_URL
    ? [{ url: process.env.GEOIP_API_URL.replace("{ip}", encodeURIComponent(ip)), parse: (data) => data }]
    : [
        {
          url: `https://ipwho.is/${encodeURIComponent(ip)}`,
          parse: (data) => data.success === false ? {} : data,
        },
        {
          url: `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
          parse: (data) => data,
        },
      ];

  for (const provider of providers) {
    try {
      const data = await fetchGeo(provider.url, provider.parse);
      const result = {
        country: clean(data.country_name || data.country || data.countryCode),
        city: clean(data.city || data.regionName || data.region),
      };
      if (!result.country) continue;
      cache.set(ip, { result, expiresAt: Date.now() + SUCCESS_CACHE_MS });
      return result;
    } catch {}
  }

  const result = { country: null, city: null };
  cache.set(ip, { result, expiresAt: Date.now() + FAILURE_CACHE_MS });
  return result;
}

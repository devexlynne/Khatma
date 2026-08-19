const globalForGeoIp = globalThis;

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

export async function lookupIpGeo(ip) {
  if (isPrivateIp(ip)) return { country: null, city: null };

  globalForGeoIp.__khatmaGeoIpCache ||= new Map();
  const cache = globalForGeoIp.__khatmaGeoIpCache;
  if (cache.has(ip)) return cache.get(ip);

  const endpoint = process.env.GEOIP_API_URL || `https://ipapi.co/${encodeURIComponent(ip)}/json/`;

  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error("geo_lookup_failed");
    const data = await response.json();
    const result = {
      country: clean(data.country_name || data.country || data.countryCode),
      city: clean(data.city || data.regionName || data.region),
    };
    cache.set(ip, result);
    return result;
  } catch {
    const result = { country: null, city: null };
    cache.set(ip, result);
    return result;
  }
}

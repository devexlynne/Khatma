import { cookies } from "next/headers";
import { userFromToken, COOKIE_NAME, isAdmin } from "./auth.js";

// Server-component helper: read the current logged-in user from the cookie.
// Kept separate from auth.js so auth.js stays free of next/headers and can
// be imported by plain Node scripts (e.g. the seed script).
export function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return userFromToken(token);
}

export function checkIsAdmin(user) {
  return isAdmin(user);
}

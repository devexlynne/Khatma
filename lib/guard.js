import { redirect } from "next/navigation";
import { getCurrentUser } from "./session.js";

// Use in server components for pages that require login.
export function requireUser() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

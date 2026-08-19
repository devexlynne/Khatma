import db from "./db.js";

export const VISITOR_COOKIE = "khatma_visitor";

export function attachVisitorToUser(visitorId, userId) {
  if (!visitorId || !userId) return;
  db.prepare(
    `UPDATE visit_logs
        SET user_id = ?
      WHERE visitor_id = ?
        AND user_id IS NULL`
  ).run(userId, visitorId);
}

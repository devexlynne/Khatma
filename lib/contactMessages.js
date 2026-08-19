import db from "./db.js";

export function listUserContactMessages(userId) {
  if (!userId) return [];
  return db.prepare(
    `SELECT id, sender_name, sender_email, phone, country, category, message, status,
            created_at, admin_reply, replied_at
       FROM contact_messages
      WHERE submitted_by = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 50`
  ).all(userId).map((row) => JSON.parse(JSON.stringify(row)));
}

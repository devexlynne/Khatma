// lib/dhikr.js

import "server-only";
import db from "./db.js";

// --- Dhikr Counter Operations ---
export function getDhikrCount(userId, dhikrText) {
  const row = db
    .prepare("SELECT * FROM dhikr_counts WHERE user_id = ? AND dhikr_text = ?")
    .get(userId, dhikrText);

  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export function updateDhikrCount(userId, dhikrText, goal) {
  const existing = getDhikrCount(userId, dhikrText);

  if (existing) {
    db.prepare(
      "UPDATE dhikr_counts SET count = count + 1, updated_at = datetime('now') WHERE user_id = ? AND dhikr_text = ?"
    ).run(userId, dhikrText);
  } else {
    db.prepare(
      "INSERT INTO dhikr_counts (user_id, dhikr_text, count, goal) VALUES (?, ?, 1, ?)"
    ).run(userId, dhikrText, goal);
  }

  return getDhikrCount(userId, dhikrText);
}

export function resetDhikrCount(userId, dhikrText) {
  db.prepare("DELETE FROM dhikr_counts WHERE user_id = ? AND dhikr_text = ?").run(
    userId,
    dhikrText
  );

  return true;
}

export function getUserDhikrStats(userId) {
  const rows = db
    .prepare(
      "SELECT dhikr_text, count, goal FROM dhikr_counts WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .all(userId);

  return rows ? rows.map((r) => JSON.parse(JSON.stringify(r))) : [];
}

// --- Group Dhikr Operations ---
export function getGroupDhikr(khatmaId, dhikrType) {
  const row = db
    .prepare("SELECT * FROM group_dhikr WHERE khatma_id = ? AND dhikr_type = ?")
    .get(khatmaId, dhikrType);

  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export function addGroupDhikrContribution(khatmaId, dhikrType, userId, count) {
  const tx = db.transaction(() => {
    const existing = getGroupDhikr(khatmaId, dhikrType);

    if (!existing) {
      db.prepare(
        "INSERT INTO group_dhikr (khatma_id, dhikr_type, total_count) VALUES (?, ?, 0)"
      ).run(khatmaId, dhikrType);
    }

    db.prepare(
      `INSERT INTO dhikr_contributions (group_dhikr_id, user_id, count)
       VALUES (
         (SELECT id FROM group_dhikr WHERE khatma_id = ? AND dhikr_type = ?),
         ?,
         ?
       )`
    ).run(khatmaId, dhikrType, userId, count);

    db.prepare(
      "UPDATE group_dhikr SET total_count = total_count + ? WHERE khatma_id = ? AND dhikr_type = ?"
    ).run(count, khatmaId, dhikrType);
  });

  tx();

  return getGroupDhikr(khatmaId, dhikrType);
}

export function getKhatmaGroupDhikrs(khatmaId) {
  const rows = db
    .prepare("SELECT * FROM group_dhikr WHERE khatma_id = ? ORDER BY created_at DESC")
    .all(khatmaId);

  return rows ? rows.map((r) => JSON.parse(JSON.stringify(r))) : [];
}

export function getGroupDhikrContributions(groupDhikrId) {
  const rows = db
    .prepare(
      `SELECT dc.*, u.full_name
       FROM dhikr_contributions dc
       JOIN users u ON u.id = dc.user_id
       WHERE dc.group_dhikr_id = ?
       ORDER BY dc.created_at DESC
       LIMIT 10`
    )
    .all(groupDhikrId);

  return rows ? rows.map((r) => JSON.parse(JSON.stringify(r))) : [];
}
import db from "./db.js";
import { randomId } from "./ids.js";
import { isAdmin } from "./auth.js";

// --- Create / read / update / delete khatmas ---

export function createKhatma(ownerId, title, description = "", honorName = null) {
  const publicId = randomId(8);
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        "INSERT INTO khatmas (owner_id, public_id, title, description, honor_name) VALUES (?, ?, ?, ?, ?)"
      )
      .run(ownerId, publicId, title.trim(), (description || "").trim(), honorName ? honorName.trim() : null);
    const khatmaId = Number(info.lastInsertRowid);
    const insertJuz = db.prepare(
      "INSERT INTO juz (khatma_id, number) VALUES (?, ?)"
    );
    for (let n = 1; n <= 30; n++) insertJuz.run(khatmaId, n);
    return khatmaId;
  });
  const id = Number(tx());
  return getKhatmaById(id);
}

export function getKhatmaById(id) {
  const row = db.prepare("SELECT * FROM khatmas WHERE id = ?").get(id);
  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export function getKhatmaByPublicId(publicId) {
  const row = db.prepare("SELECT * FROM khatmas WHERE public_id = ?").get(publicId);
  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export function getJuzList(khatmaId) {
  const rows = db
    .prepare("SELECT * FROM juz WHERE khatma_id = ? ORDER BY number")
    .all(khatmaId);
  return rows.map(row => JSON.parse(JSON.stringify(row)));
}

export function khatmaTimeline(khatmaId) {
  const rows = db
    .prepare(
      `SELECT number, participant_name, status, reserved_at, completed_at
       FROM juz WHERE khatma_id = ? AND (reserved_at IS NOT NULL OR completed_at IS NOT NULL)`
    )
    .all(khatmaId);

  const events = [];
  rows.forEach((row) => {
    if (row.reserved_at) {
      events.push({
        time: row.reserved_at,
        type: "reserved",
        number: row.number,
        name: row.participant_name || "مشارك مجهول",
      });
    }
    if (row.completed_at) {
      events.push({
        time: row.completed_at,
        type: "completed",
        number: row.number,
        name: row.participant_name || "مشارك مجهول",
      });
    }
  });
  return events
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 12);
}

export function khatmaParticipants(khatmaId) {
  const rows = db
    .prepare(
      `SELECT participant_name, status, COUNT(*) AS count
       FROM juz
       WHERE khatma_id = ? AND participant_name IS NOT NULL AND participant_name != ''
       GROUP BY participant_name
       ORDER BY count DESC, participant_name ASC
       LIMIT 6`
    )
    .all(khatmaId);
  return rows.map((row) => ({
    name: row.participant_name,
    count: row.count,
    completed: row.status === "completed",
  }));
}

export function khatmaInsights(khatmaId) {
  const p = khatmaProgress(khatmaId);
  const messages = [];
  if (p.completed === 0) {
    messages.push("ابدأ اليوم بحجز أول جزء ومشاركة الرابط مع أحبائك.");
  } else if (p.completed < 10) {
    messages.push("البداية موفقة! حافظ على قوتك عبر تشجيع المشاركين لتأكيد حصصهم.");
  } else if (p.completed < 20) {
    messages.push("نصف الطريق بات قريبًا؛ شارك تذكيرًا لطيفة للتقدّم نحو الاكتمال.");
  } else if (p.completed < 30) {
    messages.push("يا لها من خطوة قوية! الأجزاء الأخيرة تنتظر الإكمال، استمر بالأجر.");
  } else {
    messages.push("الحمد لله، الختمة مكتملة. شارك هذا الإنجاز مع الجميع وادعُ لهم.");
  }
  if (p.reserved > 0) {
    messages.push(`هناك ${p.reserved} جزءًا محجوزًا ينتظر إتمامًا من المساهمين.`);
  }
  return messages;
}

export function khatmaProgress(khatmaId) {
  const row = db
    .prepare(
      `SELECT
         SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN status='reserved'  THEN 1 ELSE 0 END) AS reserved,
         SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available
       FROM juz WHERE khatma_id = ?`
    )
    .get(khatmaId);
  const completed = row.completed || 0;
  return {
    completed,
    reserved: row.reserved || 0,
    available: row.available || 0,
    total: 30,
    percent: Math.round((completed / 30) * 100),
  };
}

export function listKhatmasByOwner(ownerId) {
  const khatmas = db
    .prepare("SELECT * FROM khatmas WHERE owner_id = ? ORDER BY created_at DESC")
    .all(ownerId);
  return khatmas.map((k) => {
    const plain = JSON.parse(JSON.stringify(k));
    return { ...plain, progress: khatmaProgress(plain.id) };
  });
}

export function updateKhatma(id, ownerId, { title, description, status, honorName }) {
  const k = getKhatmaById(id);
  if (!k || k.owner_id !== ownerId) return null;
  db.prepare(
    `UPDATE khatmas
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           honor_name = COALESCE(?, honor_name),
           status = COALESCE(?, status)
     WHERE id = ?`
  ).run(
    title != null ? title.trim() : null,
    description != null ? description.trim() : null,
    honorName != null ? honorName.trim() : null,
    status != null ? status : null,
    id
  );
  return getKhatmaById(id);
}

export function deleteKhatma(id, ownerId) {
  const k = getKhatmaById(id);
  if (!k || k.owner_id !== ownerId) return false;
  db.prepare("DELETE FROM khatmas WHERE id = ?").run(id);
  return true;
}

// Auto-mark a khatma completed once all 30 juz are completed.
function refreshKhatmaCompletion(khatmaId) {
  const p = khatmaProgress(khatmaId);
  const k = getKhatmaById(khatmaId);
  if (!k) return;
  if (p.completed === 30 && k.status !== "completed") {
    db.prepare("UPDATE khatmas SET status='completed' WHERE id=?").run(khatmaId);
  } else if (p.completed < 30 && k.status === "completed") {
    db.prepare("UPDATE khatmas SET status='active' WHERE id=?").run(khatmaId);
  }
}

// --- Public reservation logic (atomic, duplicate-safe) ---

export function reserveJuz(khatmaId, number, participantName) {
  const token = randomId(12);
  const tx = db.transaction(() => {
    // Conditional UPDATE: only succeeds if the juz is still 'available'.
    // Because this runs in a transaction with SQLite's write lock, two
    // concurrent reservations cannot both succeed — only the first wins.
    const info = db
      .prepare(
        `UPDATE juz
           SET status='reserved', participant_name=?, token=?, reserved_at=datetime('now')
         WHERE khatma_id=? AND number=? AND status='available'`
      )
      .run(participantName.trim(), token, khatmaId, number);
    return info.changes === 1;
  });
  const ok = tx();
  if (!ok) return { ok: false, reason: "taken" };
  return { ok: true, token };
}

export function completeJuzByToken(token) {
  const tx = db.transaction(() => {
    const juz = db.prepare("SELECT * FROM juz WHERE token = ?").get(token);
    if (!juz) return { ok: false, reason: "not_found" };
    const juzPlain = JSON.parse(JSON.stringify(juz));
    if (juzPlain.status === "completed")
      return { ok: true, already: true, juz: juzPlain };
    db.prepare(
      "UPDATE juz SET status='completed', completed_at=datetime('now') WHERE id=?"
    ).run(juz.id);
    const updated = db.prepare("SELECT * FROM juz WHERE id=?").get(juz.id);
    return { ok: true, juz: JSON.parse(JSON.stringify(updated)) };
  });
  const res = tx();
  if (res.ok && res.juz) refreshKhatmaCompletion(res.juz.khatma_id);
  return res;
}

export function getJuzByToken(token) {
  const row = db.prepare("SELECT * FROM juz WHERE token = ?").get(token);
  return row ? JSON.parse(JSON.stringify(row)) : null;
}

// --- Admin manual status control ---
// Owner or admin can force any juz to available / reserved / completed.
export function adminSetJuzStatus(khatmaId, user, number, status, name) {
  const k = getKhatmaById(khatmaId);
  if (!k || (k.owner_id !== user.id && !isAdmin(user))) return { ok: false, reason: "forbidden" };

  if (status === "available") {
    db.prepare(
      `UPDATE juz SET status='available', participant_name=NULL, token=NULL,
         reserved_at=NULL, completed_at=NULL
       WHERE khatma_id=? AND number=?`
    ).run(khatmaId, number);
  } else if (status === "reserved") {
    const token = randomId(12);
    db.prepare(
      `UPDATE juz SET status='reserved', participant_name=?, token=?,
         reserved_at=datetime('now'), completed_at=NULL
       WHERE khatma_id=? AND number=?`
    ).run((name || "—").trim(), token, khatmaId, number);
  } else if (status === "completed") {
    const token = randomId(12);
    db.prepare(
      `UPDATE juz SET status='completed', participant_name=COALESCE(NULLIF(?,''), participant_name, '—'),
         token=COALESCE(token, ?), completed_at=datetime('now'),
         reserved_at=COALESCE(reserved_at, datetime('now'))
       WHERE khatma_id=? AND number=?`
    ).run((name || "").trim(), token, khatmaId, number);
  } else {
    return { ok: false, reason: "bad_status" };
  }
  refreshKhatmaCompletion(khatmaId);
  return { ok: true };
}

export function ownerTopParticipants(ownerId) {
  const rows = db.prepare(
    `SELECT juz.participant_name AS name, COUNT(*) AS count
       FROM juz
       JOIN khatmas ON khatmas.id = juz.khatma_id
       WHERE khatmas.owner_id = ?
         AND juz.participant_name IS NOT NULL
         AND juz.participant_name != ''
       GROUP BY juz.participant_name
       ORDER BY count DESC, juz.participant_name ASC
       LIMIT 6`
  ).all(ownerId);
  return rows.map((row) => ({ name: row.name, count: row.count }));
}

export function ownerStats(ownerId) {
  const khatmas = listKhatmasByOwner(ownerId);
  const active = khatmas.filter((k) => k.status === "active").length;
  const completed = khatmas.filter((k) => k.status === "completed").length;
  const completedJuz = khatmas.reduce((s, k) => s + k.progress.completed, 0);
  const avg = khatmas.length
    ? Math.round(
        khatmas.reduce((s, k) => s + k.progress.percent, 0) / khatmas.length
      )
    : 0;
  const topParticipants = ownerTopParticipants(ownerId);
  return { total: khatmas.length, active, completed, completedJuz, avg, khatmas, topParticipants };
}

export function adminOverview() {
  const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count || 0;
  const totalKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas").get().count || 0;
  const activeKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas WHERE status='active'").get().count || 0;
  const completedKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas WHERE status='completed'").get().count || 0;
  const counts = db.prepare(
    `SELECT
       SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status='reserved' THEN 1 ELSE 0 END) AS reserved,
       SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available
     FROM juz`
  ).get();
  const recentKhatmas = db
    .prepare(
      `SELECT id, title, honor_name, status, created_at
       FROM khatmas
       ORDER BY created_at DESC
       LIMIT 5`
    )
    .all();

  return {
    totalUsers,
    totalKhatmas,
    activeKhatmas,
    completedKhatmas,
    completedJuz: counts.completed || 0,
    reservedJuz: counts.reserved || 0,
    availableJuz: counts.available || 0,
    recentKhatmas: recentKhatmas.map((k) => ({
      id: k.id,
      title: k.title,
      honorName: k.honor_name,
      status: k.status,
      createdAt: k.created_at,
    })),
  };
}

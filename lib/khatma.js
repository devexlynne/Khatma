import db from "./db.js";
import { randomId } from "./ids.js";
import { isAdmin } from "./auth.js";

// --- Create / read / update / delete khatmas ---

function cleanHonorName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120) || null;
}

export function createKhatma(ownerId, title, description = "", honorName = null, options = {}) {
  const publicId = randomId(8);
  const normalizedHonorName = cleanHonorName(honorName);
  const honorRelation = normalizedHonorName ? String(options.honorRelation || "").trim().slice(0, 50) || null : null;
  const honorStatus = normalizedHonorName && options.honorStatus === "living" ? "living" : "deceased";
  const requestId = Number(options.requestId) > 0 ? Number(options.requestId) : null;
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        "INSERT INTO khatmas (owner_id, public_id, title, description, honor_name, honor_relation, honor_status, request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(ownerId, publicId, title.trim(), (description || "").trim(), normalizedHonorName, honorRelation, honorStatus, requestId);
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

export function listPublicActiveKhatmas(excludeOwnerId) {
  const query = `SELECT k.*, u.full_name AS owner_name
                   FROM khatmas k
                   JOIN users u ON u.id = k.owner_id
                  WHERE k.status = 'active'
                  ${excludeOwnerId ? "AND k.owner_id != ?" : ""}
                  ORDER BY k.created_at DESC`;
  const statement = db.prepare(query);
  const khatmas = excludeOwnerId ? statement.all(excludeOwnerId) : statement.all();
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

export function khatmaGiftStats(honorName) {
  if (!honorName?.trim()) return { total: 0, completed: 0 };
  const row = db.prepare(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
       FROM khatmas
      WHERE TRIM(honor_name) = TRIM(?)`
  ).get(honorName);
  return { total: row?.total || 0, completed: row?.completed || 0 };
}

export function recipientSuggestions(ownerId) {
  return db.prepare(
    `SELECT honor_name AS name,
            MAX(NULLIF(honor_relation,'')) AS relationship,
            MAX(COALESCE(honor_status,'deceased')) AS honorStatus,
            COUNT(*) AS total,
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
       FROM khatmas
      WHERE owner_id=? AND honor_name IS NOT NULL AND TRIM(honor_name) != ''
      GROUP BY TRIM(honor_name)
      ORDER BY MAX(created_at) DESC, honor_name ASC`
  ).all(ownerId).map((row) => JSON.parse(JSON.stringify(row)));
}

export function recipientGiftStats(ownerId = null) {
  const rows = ownerId
    ? db.prepare(
        `SELECT honor_name AS name, MAX(NULLIF(honor_relation,'')) AS relationship,
                MAX(COALESCE(honor_status,'deceased')) AS honorStatus,
                COUNT(*) AS total,
                SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
           FROM khatmas WHERE owner_id=? AND honor_name IS NOT NULL AND TRIM(honor_name) != ''
          GROUP BY TRIM(honor_name) ORDER BY total DESC, name ASC`
      ).all(ownerId)
    : db.prepare(
        `SELECT honor_name AS name, MAX(NULLIF(honor_relation,'')) AS relationship,
                MAX(COALESCE(honor_status,'deceased')) AS honorStatus,
                COUNT(*) AS total,
                SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
           FROM khatmas WHERE honor_name IS NOT NULL AND TRIM(honor_name) != ''
          GROUP BY TRIM(honor_name) ORDER BY total DESC, name ASC`
      ).all();
  return rows.map((row) => JSON.parse(JSON.stringify(row)));
}

export function listKhatmaOwners() {
  return db.prepare("SELECT id, full_name, email, role FROM users ORDER BY full_name ASC, id ASC")
    .all().map((row) => JSON.parse(JSON.stringify(row)));
}

export function adminOverview() {
  const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count || 0;
  const totalVisits = db.prepare("SELECT COUNT(*) AS count FROM visit_logs").get().count || 0;
  const todayVisits = db.prepare("SELECT COUNT(*) AS count FROM visit_logs WHERE date(created_at) = date('now')").get().count || 0;
  const uniqueVisitors = db.prepare("SELECT COUNT(DISTINCT visitor_id) AS count FROM visit_logs").get().count || 0;
  const todayUniqueVisitors = db.prepare("SELECT COUNT(DISTINCT visitor_id) AS count FROM visit_logs WHERE date(created_at) = date('now')").get().count || 0;
  const totalKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas").get().count || 0;
  const activeKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas WHERE status='active'").get().count || 0;
  const completedKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas WHERE status='completed'").get().count || 0;
  const disabledKhatmas = db.prepare("SELECT COUNT(*) AS count FROM khatmas WHERE status='disabled'").get().count || 0;
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
  const dedicationCounts = db.prepare(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved
       FROM dedications`
  ).get();
  const participantCount = db.prepare(
    `SELECT COUNT(DISTINCT participant_name) AS count
       FROM juz
      WHERE participant_name IS NOT NULL AND TRIM(participant_name) != ''`
  ).get().count || 0;
  const dhikrTotal = db.prepare("SELECT COALESCE(SUM(total_count),0) AS count FROM group_dhikr").get().count || 0;
  const allKhatmas = db.prepare(
    `SELECT k.id, k.public_id, k.title, k.description, k.honor_name, k.status, k.created_at,
            u.full_name AS owner_name, u.email AS owner_email,
            SUM(CASE WHEN j.status='completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN j.status='reserved' THEN 1 ELSE 0 END) AS reserved,
            SUM(CASE WHEN j.status='available' THEN 1 ELSE 0 END) AS available,
            COUNT(DISTINCT CASE WHEN j.participant_name IS NOT NULL AND TRIM(j.participant_name) != '' THEN j.participant_name END) AS participants
       FROM khatmas k
       JOIN users u ON u.id = k.owner_id
       LEFT JOIN juz j ON j.khatma_id = k.id
      GROUP BY k.id
      ORDER BY k.created_at DESC, k.id DESC`
  ).all();
  const users = db.prepare(
    `SELECT u.id, u.full_name, u.email, u.role, u.created_at,
            (SELECT COUNT(*) FROM khatmas k WHERE k.owner_id = u.id) AS khatmas,
            (SELECT COUNT(*) FROM khatmas k WHERE k.owner_id = u.id AND k.status='completed') AS completed_khatmas,
            (SELECT COUNT(*)
               FROM juz j
               JOIN khatmas k ON k.id = j.khatma_id
              WHERE k.owner_id = u.id AND j.status='completed') AS completed_juz,
            (SELECT COUNT(*) FROM visit_logs vl WHERE vl.user_id = u.id) AS visit_count,
            (SELECT MAX(vl.created_at) FROM visit_logs vl WHERE vl.user_id = u.id) AS last_seen,
            (SELECT vl.path FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_path,
            (SELECT vl.ip_address FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_ip,
            (SELECT vl.ip_country FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_ip_country,
            (SELECT vl.ip_city FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_ip_city,
            (SELECT vl.referrer FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_referrer,
            (SELECT vl.user_agent FROM visit_logs vl WHERE vl.user_id = u.id ORDER BY vl.created_at DESC, vl.id DESC LIMIT 1) AS last_user_agent,
            (SELECT COUNT(*) FROM contact_messages cm WHERE cm.submitted_by = u.id) AS contact_count,
            (SELECT cm.phone FROM contact_messages cm WHERE cm.submitted_by = u.id ORDER BY cm.created_at DESC, cm.id DESC LIMIT 1) AS latest_phone,
            (SELECT cm.country FROM contact_messages cm WHERE cm.submitted_by = u.id ORDER BY cm.created_at DESC, cm.id DESC LIMIT 1) AS latest_country,
            (SELECT cm.message FROM contact_messages cm WHERE cm.submitted_by = u.id ORDER BY cm.created_at DESC, cm.id DESC LIMIT 1) AS latest_message,
            (SELECT cm.created_at FROM contact_messages cm WHERE cm.submitted_by = u.id ORDER BY cm.created_at DESC, cm.id DESC LIMIT 1) AS latest_message_at
       FROM users u
      ORDER BY COALESCE((SELECT MAX(vl.created_at) FROM visit_logs vl WHERE vl.user_id = u.id), u.created_at) DESC, u.id DESC`
  ).all();
  const recentParticipants = db.prepare(
    `SELECT j.id, j.number, j.status, j.participant_name, j.reserved_at, j.completed_at,
            k.id AS khatma_id, k.public_id, k.title AS khatma_title, k.honor_name,
            u.full_name AS owner_name, u.email AS owner_email
       FROM juz j
       JOIN khatmas k ON k.id = j.khatma_id
       JOIN users u ON u.id = k.owner_id
      WHERE j.participant_name IS NOT NULL AND TRIM(j.participant_name) != ''
      ORDER BY COALESCE(j.completed_at, j.reserved_at, k.created_at) DESC, j.id DESC
      LIMIT 80`
  ).all();
  const recentVisits = db.prepare(
    `SELECT vl.id, vl.visitor_id, vl.path, vl.referrer, vl.ip_address, vl.ip_country, vl.ip_city, vl.user_agent, vl.created_at,
            COALESCE(u.full_name, matched.full_name) AS full_name,
            COALESCE(u.email, matched.email) AS email,
            COALESCE(u.role, matched.role) AS role
       FROM visit_logs vl
       LEFT JOIN users u ON u.id = vl.user_id
       LEFT JOIN users matched ON matched.id = (
         SELECT vl2.user_id
           FROM visit_logs vl2
          WHERE vl2.visitor_id = vl.visitor_id AND vl2.user_id IS NOT NULL
          ORDER BY vl2.created_at DESC, vl2.id DESC
          LIMIT 1
       )
      ORDER BY vl.created_at DESC, vl.id DESC
      LIMIT 80`
  ).all();

  return {
    totalUsers,
    totalVisits,
    todayVisits,
    uniqueVisitors,
    todayUniqueVisitors,
    totalKhatmas,
    activeKhatmas,
    completedKhatmas,
    disabledKhatmas,
    completedJuz: counts.completed || 0,
    reservedJuz: counts.reserved || 0,
    availableJuz: counts.available || 0,
    totalDedications: dedicationCounts.total || 0,
    pendingDedications: dedicationCounts.pending || 0,
    approvedDedications: dedicationCounts.approved || 0,
    participantCount,
    dhikrTotal,
    allKhatmas: allKhatmas.map((k) => ({ ...k, percent: Math.round(((k.completed || 0) / 30) * 100) })),
    users: users.map((account) => JSON.parse(JSON.stringify(account))),
    recentParticipants: recentParticipants.map((participant) => JSON.parse(JSON.stringify(participant))),
    recentVisits: recentVisits.map((visit) => JSON.parse(JSON.stringify(visit))),
    recentKhatmas: recentKhatmas.map((k) => ({
      id: k.id,
      title: k.title,
      honorName: k.honor_name,
      status: k.status,
      createdAt: k.created_at,
    })),
  };
}

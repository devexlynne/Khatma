import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

// Uses Node 22's built-in SQLite (node:sqlite) — no native compilation needed.
// Run Next with the --experimental-sqlite flag (see package.json scripts).
//
// DB location is overridable via KHATMA_DB env var. Defaults to ./data/khatma.db.
const DB_PATH =
  process.env.KHATMA_DB || path.join(process.cwd(), "data", "khatma.db");
const DATA_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function init() {
  const db = new DatabaseSync(DB_PATH);
  // WAL improves concurrency but isn't supported on some network/virtual
  // filesystems. Try it, fall back silently if rejected — correctness
  // (no duplicate reservations) comes from the conditional UPDATE inside a
  // transaction, not from the journal mode.
  try { db.exec("PRAGMA journal_mode = WAL;"); } catch {}
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name     TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS khatmas (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id    INTEGER NOT NULL,
      public_id   TEXT NOT NULL UNIQUE,
      title       TEXT NOT NULL,
      description TEXT,
      honor_name  TEXT,
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS juz (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      khatma_id        INTEGER NOT NULL,
      number           INTEGER NOT NULL,
      status           TEXT NOT NULL DEFAULT 'available',
      participant_name TEXT,
      token            TEXT,
      reserved_at      TEXT,
      completed_at     TEXT,
      UNIQUE (khatma_id, number),
      FOREIGN KEY (khatma_id) REFERENCES khatmas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dhikr_counts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      dhikr_text   TEXT NOT NULL,
      count        INTEGER NOT NULL DEFAULT 0,
      goal         INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_dhikr (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      khatma_id    INTEGER NOT NULL,
      dhikr_type   TEXT NOT NULL,
      total_count  INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (khatma_id, dhikr_type),
      FOREIGN KEY (khatma_id) REFERENCES khatmas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dhikr_contributions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      group_dhikr_id INTEGER NOT NULL,
      user_id      INTEGER NOT NULL,
      count        INTEGER NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_dhikr_id) REFERENCES group_dhikr(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dedications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT,
      message      TEXT NOT NULL,
      image_url    TEXT,
      status       TEXT NOT NULL DEFAULT 'pending',
      submitted_by INTEGER,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      approved_at  TEXT,
      approver_id  INTEGER,
      FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_dedications_status ON dedications(status);
    CREATE INDEX IF NOT EXISTS idx_dedications_submitted_by ON dedications(submitted_by);

    CREATE INDEX IF NOT EXISTS idx_juz_khatma ON juz(khatma_id);
    CREATE INDEX IF NOT EXISTS idx_khatma_owner ON khatmas(owner_id);
    CREATE INDEX IF NOT EXISTS idx_dhikr_counts_user ON dhikr_counts(user_id);
    CREATE INDEX IF NOT EXISTS idx_group_dhikr_khatma ON group_dhikr(khatma_id);
    CREATE INDEX IF NOT EXISTS idx_contributions_user ON dhikr_contributions(user_id);
  `);

  const khatmaInfo = db.prepare("PRAGMA table_info(khatmas)").all();
  if (!khatmaInfo.some((col) => col.name === "honor_name")) {
    db.exec("ALTER TABLE khatmas ADD COLUMN honor_name TEXT;");
  }

  // Transaction helper so callers use db.transaction(fn)() like better-sqlite3.
  db.transaction = (fn) => {
    return (...args) => {
      db.exec("BEGIN");
      try {
        const result = fn(...args);
        db.exec("COMMIT");
        return result;
      } catch (e) {
        try { db.exec("ROLLBACK"); } catch {}
        throw e;
      }
    };
  };

  return db;
}

let db = globalThis.__khatmaDb;
if (!db) {
  db = init();
  globalThis.__khatmaDb = db;
}

export default db;

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const globalForDatabase = globalThis;

function addTransactionHelper(database) {
  database.transaction = (fn) => {
    return (...args) => {
      database.exec("BEGIN");
      try {
        const result = fn(...args);
        database.exec("COMMIT");
        return result;
      } catch (error) {
        try {
          database.exec("ROLLBACK");
        } catch {}
        throw error;
      }
    };
  };
}

export function initializeDatabase(database = getDatabase()) {
  database.exec(`
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
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      group_dhikr_id  INTEGER NOT NULL,
      user_id         INTEGER NOT NULL,
      count           INTEGER NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
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

  const khatmaInfo = database.prepare("PRAGMA table_info(khatmas)").all();
  if (!khatmaInfo.some((col) => col.name === "honor_name")) {
    database.exec("ALTER TABLE khatmas ADD COLUMN honor_name TEXT;");
  }
}

export function getDatabase() {
  if (!globalForDatabase.__khatmaDb) {
    const databasePath =
      process.env.DATABASE_PATH ||
      process.env.KHATMA_DB ||
      path.join(process.cwd(), "data", "khatma.sqlite");

    fs.mkdirSync(path.dirname(databasePath), {
      recursive: true,
    });

    const database = new DatabaseSync(databasePath);

    database.exec("PRAGMA busy_timeout = 5000;");
    database.exec("PRAGMA foreign_keys = ON;");
    addTransactionHelper(database);
    initializeDatabase(database);

    globalForDatabase.__khatmaDb = database;
  }

  return globalForDatabase.__khatmaDb;
}

const databaseProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const database = getDatabase();
      const value = database[prop];
      return typeof value === "function" ? value.bind(database) : value;
    },
  }
);

export default databaseProxy;

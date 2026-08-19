import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

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
      honor_relation TEXT,
      honor_status TEXT NOT NULL DEFAULT 'deceased',
      request_id  INTEGER,
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

    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_name  TEXT NOT NULL,
      contact_info TEXT,
      sender_email TEXT,
      phone        TEXT,
      country      TEXT,
      ip_address   TEXT,
      ip_country   TEXT,
      ip_city      TEXT,
      category     TEXT NOT NULL DEFAULT 'message',
      message      TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'new',
      submitted_by INTEGER,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      read_at      TEXT,
      admin_reply  TEXT,
      replied_at   TEXT,
      replied_by   INTEGER,
      FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS khatma_requests (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_user_id   INTEGER,
      requester_name      TEXT NOT NULL,
      contact_info        TEXT,
      beneficiary_name    TEXT NOT NULL,
      relationship        TEXT,
      beneficiary_status  TEXT NOT NULL DEFAULT 'deceased',
      suggested_title     TEXT,
      message             TEXT,
      status              TEXT NOT NULL DEFAULT 'pending',
      created_khatma_id   INTEGER,
      reviewed_by         INTEGER,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at         TEXT,
      FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_khatma_id) REFERENCES khatmas(id) ON DELETE SET NULL,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS visit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id  TEXT NOT NULL,
      user_id     INTEGER,
      path        TEXT NOT NULL,
      referrer    TEXT,
      ip_address  TEXT,
      ip_country  TEXT,
      ip_city     TEXT,
      user_agent  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    INSERT OR IGNORE INTO site_settings (key, value)
    VALUES ('announcement', 'اللهم اغفر لوالدينا وارحمهما كما ربيانا صغارًا');

    CREATE INDEX IF NOT EXISTS idx_dedications_status ON dedications(status);
    CREATE INDEX IF NOT EXISTS idx_dedications_submitted_by ON dedications(submitted_by);

    CREATE INDEX IF NOT EXISTS idx_juz_khatma ON juz(khatma_id);
    CREATE INDEX IF NOT EXISTS idx_khatma_owner ON khatmas(owner_id);
    CREATE INDEX IF NOT EXISTS idx_dhikr_counts_user ON dhikr_counts(user_id);
    CREATE INDEX IF NOT EXISTS idx_group_dhikr_khatma ON group_dhikr(khatma_id);
    CREATE INDEX IF NOT EXISTS idx_contributions_user ON dhikr_contributions(user_id);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_khatma_requests_status ON khatma_requests(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_khatma_requests_user ON khatma_requests(requester_user_id);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_created_at ON visit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_user ON visit_logs(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_visitor ON visit_logs(visitor_id, created_at);
  `);

  const khatmaInfo = database.prepare("PRAGMA table_info(khatmas)").all();
  if (!khatmaInfo.some((col) => col.name === "honor_name")) {
    database.exec("ALTER TABLE khatmas ADD COLUMN honor_name TEXT;");
  }
  if (!khatmaInfo.some((col) => col.name === "honor_relation")) {
    database.exec("ALTER TABLE khatmas ADD COLUMN honor_relation TEXT;");
  }
  if (!khatmaInfo.some((col) => col.name === "honor_status")) {
    database.exec("ALTER TABLE khatmas ADD COLUMN honor_status TEXT NOT NULL DEFAULT 'deceased';");
  }
  if (!khatmaInfo.some((col) => col.name === "request_id")) {
    database.exec("ALTER TABLE khatmas ADD COLUMN request_id INTEGER;");
  }

  database.prepare("UPDATE khatmas SET honor_name = ? WHERE honor_name = ?")
    .run("دلال محمد طاهر اللادقي", "دلال محمد طاهر اللاذقي");
  database.prepare("UPDATE khatma_requests SET beneficiary_name = ? WHERE beneficiary_name = ?")
    .run("دلال محمد طاهر اللادقي", "دلال محمد طاهر اللاذقي");

  const contactInfo = database.prepare("PRAGMA table_info(contact_messages)").all();
  if (!contactInfo.some((col) => col.name === "category")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN category TEXT NOT NULL DEFAULT 'message';");
  }
  if (!contactInfo.some((col) => col.name === "sender_email")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN sender_email TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "phone")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN phone TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "country")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN country TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "ip_address")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN ip_address TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "ip_country")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN ip_country TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "ip_city")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN ip_city TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "submitted_by")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN submitted_by INTEGER;");
  }
  if (!contactInfo.some((col) => col.name === "admin_reply")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN admin_reply TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "replied_at")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN replied_at TEXT;");
  }
  if (!contactInfo.some((col) => col.name === "replied_by")) {
    database.exec("ALTER TABLE contact_messages ADD COLUMN replied_by INTEGER;");
  }

  const visitInfo = database.prepare("PRAGMA table_info(visit_logs)").all();
  if (!visitInfo.some((col) => col.name === "ip_country")) {
    database.exec("ALTER TABLE visit_logs ADD COLUMN ip_country TEXT;");
  }
  if (!visitInfo.some((col) => col.name === "ip_city")) {
    database.exec("ALTER TABLE visit_logs ADD COLUMN ip_city TEXT;");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    database.prepare(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')
       ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, role='admin'`
    ).run(process.env.ADMIN_NAME?.trim() || "مدير نور الوالدين", adminEmail, passwordHash);
  }
}

export function getDatabase() {
  if (!globalForDatabase.__khatmaDb) {
    const railwayVolume = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    const databasePath =
      process.env.DATABASE_PATH ||
      process.env.KHATMA_DB ||
      (railwayVolume ? path.join(railwayVolume, "khatma.db") : path.join(process.cwd(), "data", "khatma.db"));

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

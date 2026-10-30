import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

let dbInstance = null;
let dbFilePath = null;

const DEFAULT_CONTAINERS = [
  { id: 'c-150', name: 'Small Glass', capacityMl: 150, icon: 'CupSoda', color: '#38BDF8', isDefault: 0 },
  { id: 'c-250', name: 'Normal Glass', capacityMl: 250, icon: 'GlassWater', color: '#329BFA', isDefault: 1 },
  { id: 'c-350', name: 'Large Glass', capacityMl: 350, icon: 'Coffee', color: '#2563EB', isDefault: 0 },
  { id: 'c-500', name: 'Bottle', capacityMl: 500, icon: 'BottleWater', color: '#0284C7', isDefault: 0 },
  { id: 'c-750', name: 'Large Bottle', capacityMl: 750, icon: 'Cylinder', color: '#0369A1', isDefault: 0 },
  { id: 'c-1000', name: 'Water Jug', capacityMl: 1000, icon: 'Milk', color: '#1769AA', isDefault: 0 },
];

const DEFAULT_SETTINGS = {
  notificationEnabled: 1, // 1 = ON, 0 = OFF (Master switch)
  focusModeEnabled: 0,
  waterReminderEnabled: 1,
  taskReminderEnabled: 1,
  soundEnabled: 1,
  popupPosition: 'top-right', // top-right, bottom-right, center, top-left, bottom-left
  popupDuration: 15, // seconds (0 for stay until closed)
  snoozeDuration: 10, // minutes
  startupEnabled: 0,
  closeToTray: 1,
  // Hydration settings
  dailyTargetMl: 2500,
  waterReminderInterval: 30, // minutes
  waterReminderStartTime: '08:00',
  waterReminderEndTime: '22:00',
  waterReminderDays: '1,2,3,4,5,6,7', // Mon-Sun
  defaultContainerId: 'c-250',
};

export async function initDatabase(userDataPath) {
  if (dbInstance) return dbInstance;

  if (userDataPath === ':memory:') {
    const SQL = await initSqlJs();
    dbInstance = new SQL.Database();
    createTables(dbInstance);
    seedInitialData(dbInstance);
    return dbInstance;
  }

  const dataDir = userDataPath || path.resolve('./data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbFilePath = path.join(dataDir, 'rio.sqlite');

  const SQL = await initSqlJs();

  let fileBuffer = null;
  if (fs.existsSync(dbFilePath)) {
    try {
      fileBuffer = fs.readFileSync(dbFilePath);
    } catch (err) {
      console.error('[DB] Failed to read existing database file:', err);
    }
  }

  dbInstance = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  createTables(dbInstance);
  seedInitialData(dbInstance);
  saveDatabase();

  return dbInstance;
}

export function saveDatabase() {
  if (!dbInstance || !dbFilePath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('[DB] Failed to save database to disk:', err);
  }
}

function createTables(db) {
  // 1. Water Goals
  db.run(`
    CREATE TABLE IF NOT EXISTS WaterGoals (
      id TEXT PRIMARY KEY,
      dailyTargetMl INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. Containers
  db.run(`
    CREATE TABLE IF NOT EXISTS Containers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacityMl INTEGER NOT NULL,
      icon TEXT,
      color TEXT,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // 3. Water Entries
  db.run(`
    CREATE TABLE IF NOT EXISTS WaterEntries (
      id TEXT PRIMARY KEY,
      amountMl INTEGER NOT NULL,
      containerId TEXT,
      timestamp TEXT NOT NULL,
      localDate TEXT NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 4. Reminders
  db.run(`
    CREATE TABLE IF NOT EXISTS Reminders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      scheduledDateTime TEXT NOT NULL,
      repeatRule TEXT DEFAULT 'once',
      category TEXT DEFAULT 'general',
      priority TEXT DEFAULT 'medium',
      enabled INTEGER DEFAULT 1,
      soundEnabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 5. Reminder History
  db.run(`
    CREATE TABLE IF NOT EXISTS ReminderHistory (
      id TEXT PRIMARY KEY,
      reminderId TEXT,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      triggeredAt TEXT NOT NULL,
      completedAt TEXT,
      status TEXT NOT NULL
    );
  `);

  // 6. Settings (Key-Value)
  db.run(`
    CREATE TABLE IF NOT EXISTS Settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 7. Processed occurrences to guarantee duplicate prevention
  db.run(`
    CREATE TABLE IF NOT EXISTS ProcessedOccurrences (
      occurrenceKey TEXT PRIMARY KEY,
      processedAt TEXT NOT NULL
    );
  `);
}

function seedInitialData(db) {
  // Seed Settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const res = db.exec(`SELECT value FROM Settings WHERE key = '${key}'`);
    if (res.length === 0 || res[0].values.length === 0) {
      db.run(`INSERT INTO Settings (key, value) VALUES (?, ?)`, [key, JSON.stringify(value)]);
    }
  }

  // Seed Initial Water Goal
  const goalCheck = db.exec(`SELECT id FROM WaterGoals LIMIT 1`);
  if (goalCheck.length === 0 || goalCheck[0].values.length === 0) {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO WaterGoals (id, dailyTargetMl, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      ['default-goal', DEFAULT_SETTINGS.dailyTargetMl, now, now]
    );
  }

  // Seed Default Containers
  const containerCheck = db.exec(`SELECT id FROM Containers LIMIT 1`);
  if (containerCheck.length === 0 || containerCheck[0].values.length === 0) {
    const now = new Date().toISOString();
    for (const c of DEFAULT_CONTAINERS) {
      db.run(
        `INSERT INTO Containers (id, name, capacityMl, icon, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.capacityMl, c.icon, c.color, c.isDefault, now]
      );
    }
  }
}

// Helper: Query rows as array of objects
export function queryAll(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function execute(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  saveDatabase();
}

export { dbInstance };

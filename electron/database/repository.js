import { queryAll, queryOne, execute, dbInstance, saveDatabase } from './db.js';

// ----------------------
// SETTINGS REPOSITORY
// ----------------------
export function getSettings() {
  const rows = queryAll(`SELECT key, value FROM Settings`);
  const settings = {};
  for (const row of rows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }
  return settings;
}

export function updateSetting(key, value) {
  execute(`INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)`, [key, JSON.stringify(value)]);
  return { key, value };
}

export function updateSettingsBulk(newSettings) {
  for (const [key, value] of Object.entries(newSettings)) {
    execute(`INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)`, [key, JSON.stringify(value)]);
  }
  return getSettings();
}

// ----------------------
// WATER GOALS
// ----------------------
export function getLatestWaterGoal() {
  const goal = queryOne(`SELECT * FROM WaterGoals ORDER BY updatedAt DESC LIMIT 1`);
  if (!goal) {
    return { id: 'default-goal', dailyTargetMl: 2500 };
  }
  return goal;
}

export function setWaterGoal(dailyTargetMl) {
  const target = Math.max(100, Math.min(10000, Number(dailyTargetMl) || 2500));
  const now = new Date().toISOString();
  const existing = queryOne(`SELECT id FROM WaterGoals LIMIT 1`);
  if (existing) {
    execute(`UPDATE WaterGoals SET dailyTargetMl = ?, updatedAt = ? WHERE id = ?`, [target, now, existing.id]);
  } else {
    execute(`INSERT INTO WaterGoals (id, dailyTargetMl, createdAt, updatedAt) VALUES (?, ?, ?, ?)`, ['goal-' + Date.now(), target, now, now]);
  }
  updateSetting('dailyTargetMl', target);
  return { dailyTargetMl: target, updatedAt: now };
}

// ----------------------
// CONTAINERS
// ----------------------
export function getContainers() {
  return queryAll(`SELECT * FROM Containers ORDER BY capacityMl ASC`);
}

export function getContainerById(id) {
  return queryOne(`SELECT * FROM Containers WHERE id = ?`, [id]);
}

export function createContainer({ name, capacityMl, icon = 'CupSoda', color = '#329BFA', isDefault = 0 }) {
  const id = 'cont-' + Date.now();
  const now = new Date().toISOString();
  const cap = Math.max(1, parseInt(capacityMl, 10));

  if (isDefault) {
    execute(`UPDATE Containers SET isDefault = 0`);
  }

  execute(
    `INSERT INTO Containers (id, name, capacityMl, icon, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name.trim(), cap, icon, color, isDefault ? 1 : 0, now]
  );

  if (isDefault) {
    updateSetting('defaultContainerId', id);
  }

  return getContainerById(id);
}

export function updateContainer(id, { name, capacityMl, icon, color, isDefault }) {
  const existing = getContainerById(id);
  if (!existing) throw new Error('Container not found');

  const now = new Date().toISOString();
  const cap = capacityMl ? Math.max(1, parseInt(capacityMl, 10)) : existing.capacityMl;
  const newName = name ? name.trim() : existing.name;
  const newIcon = icon || existing.icon;
  const newColor = color || existing.color;
  const newDefault = isDefault !== undefined ? (isDefault ? 1 : 0) : existing.isDefault;

  if (newDefault) {
    execute(`UPDATE Containers SET isDefault = 0`);
  }

  execute(
    `UPDATE Containers SET name = ?, capacityMl = ?, icon = ?, color = ?, isDefault = ? WHERE id = ?`,
    [newName, cap, newIcon, newColor, newDefault, id]
  );

  if (newDefault) {
    updateSetting('defaultContainerId', id);
  }

  return getContainerById(id);
}

export function deleteContainer(id) {
  // Deleting a container must not delete historical water entries
  execute(`DELETE FROM Containers WHERE id = ?`, [id]);
  return { success: true, id };
}

export function setDefaultContainer(id) {
  execute(`UPDATE Containers SET isDefault = 0`);
  execute(`UPDATE Containers SET isDefault = 1 WHERE id = ?`, [id]);
  updateSetting('defaultContainerId', id);
  return getContainerById(id);
}

// ----------------------
// WATER ENTRIES
// ----------------------
export function addWaterEntry({ amountMl, timestamp, localDate, containerId = null, note = '' }) {
  const id = 'wentry-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const amount = Math.max(1, parseInt(amountMl, 10));
  const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
  
  // Calculate local date (YYYY-MM-DD) consistently
  const dateObj = new Date(ts);
  const derivedLocalDate = localDate || [
    dateObj.getFullYear(),
    String(dateObj.getMonth() + 1).padStart(2, '0'),
    String(dateObj.getDate()).padStart(2, '0')
  ].join('-');

  const now = new Date().toISOString();

  execute(
    `INSERT INTO WaterEntries (id, amountMl, containerId, timestamp, localDate, note, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, amount, containerId, ts, derivedLocalDate, note || '', now, now]
  );

  return queryOne(`SELECT * FROM WaterEntries WHERE id = ?`, [id]);
}

export function updateWaterEntry(id, { amountMl, timestamp, localDate, containerId, note }) {
  const existing = queryOne(`SELECT * FROM WaterEntries WHERE id = ?`, [id]);
  if (!existing) throw new Error('Water entry not found');

  const amount = amountMl !== undefined ? Math.max(1, parseInt(amountMl, 10)) : existing.amountMl;
  const ts = timestamp ? new Date(timestamp).toISOString() : existing.timestamp;
  
  let dLocalDate = existing.localDate;
  if (localDate) {
    dLocalDate = localDate;
  } else if (timestamp) {
    const dateObj = new Date(ts);
    dLocalDate = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, '0'),
      String(dateObj.getDate()).padStart(2, '0')
    ].join('-');
  }

  const cid = containerId !== undefined ? containerId : existing.containerId;
  const n = note !== undefined ? note : existing.note;
  const now = new Date().toISOString();

  execute(
    `UPDATE WaterEntries SET amountMl = ?, timestamp = ?, localDate = ?, containerId = ?, note = ?, updatedAt = ? WHERE id = ?`,
    [amount, ts, dLocalDate, cid, n, now, id]
  );

  return queryOne(`SELECT * FROM WaterEntries WHERE id = ?`, [id]);
}

export function deleteWaterEntry(id) {
  execute(`DELETE FROM WaterEntries WHERE id = ?`, [id]);
  return { success: true, id };
}

export function getWaterEntriesForDate(localDate) {
  return queryAll(
    `SELECT e.*, c.name as containerName, c.icon as containerIcon, c.color as containerColor
     FROM WaterEntries e
     LEFT JOIN Containers c ON e.containerId = c.id
     WHERE e.localDate = ?
     ORDER BY e.timestamp ASC`,
    [localDate]
  );
}

export function getWaterEntriesRange(startDate, endDate) {
  return queryAll(
    `SELECT * FROM WaterEntries WHERE localDate >= ? AND localDate <= ? ORDER BY timestamp ASC`,
    [startDate, endDate]
  );
}

export function getAllWaterEntries() {
  return queryAll(`SELECT * FROM WaterEntries ORDER BY timestamp DESC`);
}

// ----------------------
// REMINDERS (TASKS)
// ----------------------
export function getReminders() {
  return queryAll(`SELECT * FROM Reminders ORDER BY scheduledDateTime ASC`);
}

export function getReminderById(id) {
  return queryOne(`SELECT * FROM Reminders WHERE id = ?`, [id]);
}

export function createReminder({ title, description = '', scheduledDateTime, repeatRule = 'once', category = 'general', priority = 'medium', enabled = 1, soundEnabled = 1 }) {
  const id = 'rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const now = new Date().toISOString();
  execute(
    `INSERT INTO Reminders (id, title, description, scheduledDateTime, repeatRule, category, priority, enabled, soundEnabled, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title.trim(), description.trim(), new Date(scheduledDateTime).toISOString(), repeatRule, category, priority, enabled ? 1 : 0, soundEnabled ? 1 : 0, now, now]
  );
  return getReminderById(id);
}

export function updateReminder(id, updates) {
  const existing = getReminderById(id);
  if (!existing) throw new Error('Reminder not found');

  const title = updates.title !== undefined ? updates.title.trim() : existing.title;
  const description = updates.description !== undefined ? updates.description.trim() : existing.description;
  const scheduledDateTime = updates.scheduledDateTime ? new Date(updates.scheduledDateTime).toISOString() : existing.scheduledDateTime;
  const repeatRule = updates.repeatRule !== undefined ? updates.repeatRule : existing.repeatRule;
  const category = updates.category !== undefined ? updates.category : existing.category;
  const priority = updates.priority !== undefined ? updates.priority : existing.priority;
  const enabled = updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : existing.enabled;
  const soundEnabled = updates.soundEnabled !== undefined ? (updates.soundEnabled ? 1 : 0) : existing.soundEnabled;
  const now = new Date().toISOString();

  execute(
    `UPDATE Reminders SET title = ?, description = ?, scheduledDateTime = ?, repeatRule = ?, category = ?, priority = ?, enabled = ?, soundEnabled = ?, updatedAt = ? WHERE id = ?`,
    [title, description, scheduledDateTime, repeatRule, category, priority, enabled, soundEnabled, now, id]
  );

  return getReminderById(id);
}

export function deleteReminder(id) {
  execute(`DELETE FROM Reminders WHERE id = ?`, [id]);
  execute(`DELETE FROM ReminderHistory WHERE reminderId = ?`, [id]);
  return { success: true, id };
}

export function recordReminderHistory({ reminderId, title, category, triggeredAt, completedAt = null, status = 'triggered' }) {
  const id = 'rh-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  execute(
    `INSERT INTO ReminderHistory (id, reminderId, title, category, triggeredAt, completedAt, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, reminderId, title, category || 'general', triggeredAt, completedAt, status]
  );
  return { id, reminderId, status };
}

export function completeReminder(reminderId) {
  const now = new Date().toISOString();
  // Update last history item or insert completed history
  execute(
    `UPDATE ReminderHistory SET completedAt = ?, status = 'completed' WHERE reminderId = ? AND status = 'triggered'`,
    [now, reminderId]
  );

  const reminder = getReminderById(reminderId);
  if (reminder) {
    if (reminder.repeatRule === 'once') {
      // Disable one-time reminders after completion
      updateReminder(reminderId, { enabled: 0 });
    }
  }

  return { success: true, completedAt: now };
}

export function getReminderHistory() {
  return queryAll(`SELECT * FROM ReminderHistory ORDER BY triggeredAt DESC LIMIT 100`);
}

// ----------------------
// EXPORT & IMPORT BACKUP
// ----------------------
export function exportAllData() {
  const waterGoals = queryAll(`SELECT * FROM WaterGoals`);
  const containers = queryAll(`SELECT * FROM Containers`);
  const waterEntries = queryAll(`SELECT * FROM WaterEntries`);
  const reminders = queryAll(`SELECT * FROM Reminders`);
  const reminderHistory = queryAll(`SELECT * FROM ReminderHistory`);
  const settings = getSettings();

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    waterGoals,
    containers,
    waterEntries,
    reminders,
    reminderHistory,
    settings,
  };
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file format');
  }

  if (Array.isArray(data.waterGoals)) {
    execute(`DELETE FROM WaterGoals`);
    for (const g of data.waterGoals) {
      execute(`INSERT INTO WaterGoals (id, dailyTargetMl, createdAt, updatedAt) VALUES (?, ?, ?, ?)`, [g.id, g.dailyTargetMl, g.createdAt, g.updatedAt]);
    }
  }

  if (Array.isArray(data.containers)) {
    execute(`DELETE FROM Containers`);
    for (const c of data.containers) {
      execute(`INSERT INTO Containers (id, name, capacityMl, icon, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`, [c.id, c.name, c.capacityMl, c.icon, c.color, c.isDefault, c.createdAt]);
    }
  }

  if (Array.isArray(data.waterEntries)) {
    execute(`DELETE FROM WaterEntries`);
    for (const w of data.waterEntries) {
      execute(`INSERT INTO WaterEntries (id, amountMl, containerId, timestamp, localDate, note, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [w.id, w.amountMl, w.containerId, w.timestamp, w.localDate, w.note, w.createdAt, w.updatedAt]);
    }
  }

  if (Array.isArray(data.reminders)) {
    execute(`DELETE FROM Reminders`);
    for (const r of data.reminders) {
      execute(`INSERT INTO Reminders (id, title, description, scheduledDateTime, repeatRule, category, priority, enabled, soundEnabled, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [r.id, r.title, r.description, r.scheduledDateTime, r.repeatRule, r.category, r.priority, r.enabled, r.soundEnabled, r.createdAt, r.updatedAt]);
    }
  }

  if (data.settings && typeof data.settings === 'object') {
    updateSettingsBulk(data.settings);
  }

  saveDatabase();
  return { success: true };
}

export function clearAllHistory() {
  execute(`DELETE FROM WaterEntries`);
  execute(`DELETE FROM ReminderHistory`);
  execute(`DELETE FROM ProcessedOccurrences`);
  saveDatabase();
  return { success: true };
}

import { app, BrowserWindow, ipcMain, powerMonitor, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase, saveDatabase } from './database/db.js';
import * as repo from './database/repository.js';
import { createOverlayWindow, showOverlayNotification, dismissOverlay, getOverlayWindow } from './windows/overlayWindow.js';
import { initScheduler, handleSystemWake, snoozeReminder } from './scheduler/reminderScheduler.js';
import { createTray, updateTrayMenu } from './tray/trayManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'RIO — Your Little Reminder Buddy',
    backgroundColor: '#F4F9FF',
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load Vite Dev Server in development or built index.html in production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    const settings = repo.getSettings();
    const closeToTray = settings.closeToTray !== undefined ? Number(settings.closeToTray) : 1;

    if (!app.isQuiting && closeToTray === 1) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  return mainWindow;
}

// -------------------------------------------------------------
// REGISTER SECURE IPC HANDLERS
// -------------------------------------------------------------
function registerIpcHandlers() {
  // Settings
  ipcMain.handle('settings:get', async () => repo.getSettings());
  ipcMain.handle('settings:update', async (_e, { key, value }) => {
    const res = repo.updateSetting(key, value);
    updateTrayMenu(mainWindow, handleQuickAddWater);
    return res;
  });
  ipcMain.handle('settings:updateBulk', async (_e, settings) => {
    const res = repo.updateSettingsBulk(settings);
    updateTrayMenu(mainWindow, handleQuickAddWater);
    return res;
  });

  // Water Goals
  ipcMain.handle('waterGoal:get', async () => repo.getLatestWaterGoal());
  ipcMain.handle('waterGoal:set', async (_e, targetMl) => repo.setWaterGoal(targetMl));

  // Containers
  ipcMain.handle('containers:get', async () => repo.getContainers());
  ipcMain.handle('containers:create', async (_e, cont) => repo.createContainer(cont));
  ipcMain.handle('containers:update', async (_e, { id, updates }) => repo.updateContainer(id, updates));
  ipcMain.handle('containers:delete', async (_e, id) => repo.deleteContainer(id));
  ipcMain.handle('containers:setDefault', async (_e, id) => repo.setDefaultContainer(id));

  // Water Entries
  ipcMain.handle('water:add', async (_e, entry) => {
    const result = repo.addWaterEntry(entry);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('water:updated', result);
    }
    return result;
  });
  ipcMain.handle('water:update', async (_e, { id, updates }) => {
    const result = repo.updateWaterEntry(id, updates);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('water:updated', result);
    }
    return result;
  });
  ipcMain.handle('water:delete', async (_e, id) => {
    const result = repo.deleteWaterEntry(id);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('water:updated', { deletedId: id });
    }
    return result;
  });
  ipcMain.handle('water:getByDate', async (_e, localDate) => repo.getWaterEntriesForDate(localDate));
  ipcMain.handle('water:getRange', async (_e, { startDate, endDate }) => repo.getWaterEntriesRange(startDate, endDate));
  ipcMain.handle('water:getAll', async () => repo.getAllWaterEntries());

  // Reminders
  ipcMain.handle('reminders:get', async () => repo.getReminders());
  ipcMain.handle('reminders:create', async (_e, rem) => repo.createReminder(rem));
  ipcMain.handle('reminders:update', async (_e, { id, updates }) => repo.updateReminder(id, updates));
  ipcMain.handle('reminders:delete', async (_e, id) => repo.deleteReminder(id));
  ipcMain.handle('reminders:complete', async (_e, id) => repo.completeReminder(id));
  ipcMain.handle('reminders:snooze', async (_e, { id, minutes }) => {
    snoozeReminder(id, minutes);
    return { success: true };
  });
  ipcMain.handle('reminders:getHistory', async () => repo.getReminderHistory());

  // Overlay Window Control
  ipcMain.handle('overlay:dismiss', async () => {
    dismissOverlay();
    return { success: true };
  });

  ipcMain.handle('overlay:test', async (_e, type = 'water') => {
    const settings = repo.getSettings();
    if (type === 'water') {
      const now = new Date();
      const localDateStr = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
      const entries = repo.getWaterEntriesForDate(localDateStr);
      const totalConsumed = entries.reduce((s, x) => s + (x.amountMl || 0), 0);
      const goal = repo.getLatestWaterGoal();
      const targetMl = goal ? goal.dailyTargetMl : 2500;
      const remainingMl = Math.max(0, targetMl - totalConsumed);

      showOverlayNotification({
        type: 'water',
        data: {
          title: 'Hey buddy! 💧',
          subtitle: 'Time to hydrate!',
          consumedMl: totalConsumed,
          targetMl: targetMl,
          remainingMl: remainingMl,
          servingsRemaining: Math.ceil(remainingMl / 250),
          defaultContainerCapacity: 250,
        }
      }, settings);
    } else {
      showOverlayNotification({
        type: 'task',
        data: {
          id: 'test-task-' + Date.now(),
          title: 'Complete your SQL assignment',
          description: 'Review database queries and submit the assignment module on time.',
          category: 'Work',
          priority: 'high',
          scheduledDateTime: new Date().toISOString(),
        }
      }, settings);
    }
    return { success: true };
  });

  // Export / Import
  ipcMain.handle('data:export', async () => repo.exportAllData());
  ipcMain.handle('data:import', async (_e, data) => repo.importAllData(data));
  ipcMain.handle('data:clearHistory', async () => repo.clearAllHistory());

  ipcMain.handle('dialog:saveExport', async (_e, { jsonString, suggestedName }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Rio Data',
      defaultPath: suggestedName || 'rio-backup.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    if (filePath) {
      fs.writeFileSync(filePath, jsonString, 'utf-8');
      return { success: true, filePath };
    }
    return { success: false };
  });

  // Window Controls
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
}

function handleQuickAddWater(amount = 250) {
  repo.addWaterEntry({
    amountMl: amount,
    timestamp: new Date().toISOString(),
    note: 'Quick added from System Tray'
  });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('water:updated', { amountMl: amount });
  }
}

// -------------------------------------------------------------
// APP LIFECYCLE
// -------------------------------------------------------------
app.whenReady().then(async () => {
  // Initialize Database
  const userDataPath = app.getPath('userData');
  await initDatabase(userDataPath);

  // Register IPC
  registerIpcHandlers();

  // Create Overlay window & Main window
  createOverlayWindow();
  await createMainWindow();

  // Create System Tray
  createTray({
    mainWindow,
    onQuickAddWater: handleQuickAddWater,
  });

  // Initialize Background Scheduler
  initScheduler({
    mainWindow,
    overlayWindow: getOverlayWindow(),
    showOverlayCallback: (payload) => {
      const settings = repo.getSettings();
      // Master switch & Focus Mode check
      if (Number(settings.notificationEnabled) === 0) return;
      if (Number(settings.focusModeEnabled) === 1) return;

      showOverlayNotification(payload, settings);
    }
  });

  // Power monitor to recover schedules safely after sleep/resume
  powerMonitor.on('resume', () => {
    handleSystemWake();
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  saveDatabase();
});

app.on('window-all-closed', () => {
  const settings = repo.getSettings();
  if (Number(settings.closeToTray) !== 1) {
    app.quit();
  }
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rioAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSetting: (key, value) => ipcRenderer.invoke('settings:update', { key, value }),
  updateSettingsBulk: (settings) => ipcRenderer.invoke('settings:updateBulk', settings),
  onSettingsUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('settings:updated', handler);
    return () => ipcRenderer.removeListener('settings:updated', handler);
  },

  // Hydration Goals
  getWaterGoal: () => ipcRenderer.invoke('waterGoal:get'),
  setWaterGoal: (targetMl) => ipcRenderer.invoke('waterGoal:set', targetMl),

  // Containers
  getContainers: () => ipcRenderer.invoke('containers:get'),
  createContainer: (container) => ipcRenderer.invoke('containers:create', container),
  updateContainer: (id, updates) => ipcRenderer.invoke('containers:update', { id, updates }),
  deleteContainer: (id) => ipcRenderer.invoke('containers:delete', id),
  setDefaultContainer: (id) => ipcRenderer.invoke('containers:setDefault', id),

  // Water Entries
  addWaterEntry: (entry) => ipcRenderer.invoke('water:add', entry),
  updateWaterEntry: (id, updates) => ipcRenderer.invoke('water:update', { id, updates }),
  deleteWaterEntry: (id) => ipcRenderer.invoke('water:delete', id),
  getWaterEntriesForDate: (localDate) => ipcRenderer.invoke('water:getByDate', localDate),
  getWaterEntriesRange: (startDate, endDate) => ipcRenderer.invoke('water:getRange', { startDate, endDate }),
  getAllWaterEntries: () => ipcRenderer.invoke('water:getAll'),
  onWaterUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('water:updated', handler);
    return () => ipcRenderer.removeListener('water:updated', handler);
  },

  // Task Reminders
  getReminders: () => ipcRenderer.invoke('reminders:get'),
  createReminder: (reminder) => ipcRenderer.invoke('reminders:create', reminder),
  updateReminder: (id, updates) => ipcRenderer.invoke('reminders:update', { id, updates }),
  deleteReminder: (id) => ipcRenderer.invoke('reminders:delete', id),
  completeReminder: (id) => ipcRenderer.invoke('reminders:complete', id),
  snoozeReminder: (id, minutes) => ipcRenderer.invoke('reminders:snooze', { id, minutes }),
  getReminderHistory: () => ipcRenderer.invoke('reminders:getHistory'),

  // Floating Overlay Control
  dismissOverlay: () => ipcRenderer.invoke('overlay:dismiss'),
  testNotification: (type) => ipcRenderer.invoke('overlay:test', type),
  onOverlayData: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('overlay:data', handler);
    return () => ipcRenderer.removeListener('overlay:data', handler);
  },

  // Export / Import Data
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: (data) => ipcRenderer.invoke('data:import', data),
  clearHistory: () => ipcRenderer.invoke('data:clearHistory'),
  saveExportFileDialog: (jsonString, suggestedName) => ipcRenderer.invoke('dialog:saveExport', { jsonString, suggestedName }),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
});

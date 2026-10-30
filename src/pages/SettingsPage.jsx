import React, { useState } from 'react';
import { useRio } from '../context/RioContext';
import { 
  Bell, 
  BellOff, 
  Moon, 
  Volume2, 
  Monitor, 
  Clock, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Sparkles,
  Layers,
  Save
} from 'lucide-react';

export const SettingsPage = () => {
  const {
    settings,
    updateSettingsBulk,
    toggleNotifications,
    toggleFocusMode,
    reloadData,
  } = useRio();

  const [form, setForm] = useState({
    waterReminderEnabled: settings.waterReminderEnabled ? 1 : 0,
    taskReminderEnabled: settings.taskReminderEnabled ? 1 : 0,
    soundEnabled: settings.soundEnabled ? 1 : 0,
    popupPosition: settings.popupPosition || 'top-right',
    popupDuration: settings.popupDuration || 15,
    snoozeDuration: settings.snoozeDuration || 10,
    closeToTray: settings.closeToTray ? 1 : 0,
    waterReminderInterval: settings.waterReminderInterval || 30,
    waterReminderStartTime: settings.waterReminderStartTime || '08:00',
    waterReminderEndTime: settings.waterReminderEndTime || '22:00',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const isMasterOn = Number(settings.notificationEnabled) === 1;
  const isFocusOn = Number(settings.focusModeEnabled) === 1;

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    await updateSettingsBulk(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestOverlay = async (type) => {
    if (window.rioAPI?.testNotification) {
      await window.rioAPI.testNotification(type);
    }
  };

  const handleExportJson = async () => {
    if (window.rioAPI?.exportData) {
      const data = await window.rioAPI.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      await window.rioAPI.saveExportFileDialog(jsonStr, `rio-backup-${Date.now()}.json`);
    }
  };

  const handleExportCsv = async () => {
    if (window.rioAPI?.getAllWaterEntries) {
      const entries = await window.rioAPI.getAllWaterEntries();
      const headers = 'ID,AmountML,Timestamp,LocalDate,Note\n';
      const rows = entries.map((e) => `"${e.id}",${e.amountMl},"${e.timestamp}","${e.localDate}","${e.note || ''}"`).join('\n');
      const csvContent = headers + rows;
      await window.rioAPI.saveExportFileDialog(csvContent, `rio-water-history-${Date.now()}.csv`);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all water history and logs? Custom containers and goals will be kept.')) {
      await window.rioAPI.clearHistory();
      await reloadData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-rio-navy">Preferences & Companion Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure reminder frequency, floating window position, focus mode, and backups
          </p>
        </div>
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Section 1: Master Controls */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft space-y-4">
          <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider mb-2">
            Master Gating Controls
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-rio-soft border border-rio-border">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isMasterOn ? 'bg-rio-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                {isMasterOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-rio-navy">Master Rio Popups Switch</h4>
                <p className="text-[11px] text-slate-400">
                  Instantly mutes every floating window and audio chime across Windows
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleNotifications}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                isMasterOn ? 'bg-rio-primary text-white border-rio-primary' : 'bg-white text-slate-500 border-slate-300'
              }`}
            >
              {isMasterOn ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isFocusOn ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-950">Focus Mode (No Interruptions)</h4>
                <p className="text-[11px] text-amber-700">
                  Ideal for exams, proctored assessments, or deep work sessions
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                isFocusOn ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-800 border-amber-300'
              }`}
            >
              {isFocusOn ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        </div>

        {/* Section 2: Water Reminder Frequency & Windows */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft space-y-4">
          <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider mb-2">
            Hydration Reminder Window & Frequency
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Interval Frequency</label>
              <select
                value={form.waterReminderInterval}
                onChange={(e) => setForm({ ...form, waterReminderInterval: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              >
                <option value="15">Every 15 minutes</option>
                <option value="20">Every 20 minutes</option>
                <option value="30">Every 30 minutes (Default)</option>
                <option value="45">Every 45 minutes</option>
                <option value="60">Every 60 minutes (1 hour)</option>
                <option value="90">Every 90 minutes</option>
                <option value="120">Every 120 minutes (2 hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Time</label>
              <input
                type="time"
                value={form.waterReminderStartTime}
                onChange={(e) => setForm({ ...form, waterReminderStartTime: e.target.value })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={form.waterReminderEndTime}
                onChange={(e) => setForm({ ...form, waterReminderEndTime: e.target.value })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Floating Overlay Position & Behavior */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">
              Floating Desktop Overlay Behavior
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTestOverlay('water')}
                className="px-3 py-1.5 rounded-xl bg-rio-secondary text-rio-primary border border-rio-border text-xs font-bold hover:bg-rio-primary hover:text-white transition-all"
              >
                Test Water Overlay
              </button>
              <button
                type="button"
                onClick={() => handleTestOverlay('task')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Test Task Overlay
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Screen Position</label>
              <select
                value={form.popupPosition}
                onChange={(e) => setForm({ ...form, popupPosition: e.target.value })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              >
                <option value="top-right">Top-Right (Default)</option>
                <option value="bottom-right">Bottom-Right</option>
                <option value="center">Center</option>
                <option value="top-left">Top-Left</option>
                <option value="bottom-left">Bottom-Left</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Auto-Dismiss Timer
              </label>
              <select
                value={form.popupDuration}
                onChange={(e) => setForm({ ...form, popupDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              >
                <option value="10">10 seconds</option>
                <option value="15">15 seconds (Recommended)</option>
                <option value="30">30 seconds</option>
                <option value="0">Stay until manually closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Close Window Behavior
              </label>
              <select
                value={form.closeToTray}
                onChange={(e) => setForm({ ...form, closeToTray: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-bold text-rio-navy outline-none"
              >
                <option value="1">Minimize to Windows Tray (Recommended)</option>
                <option value="0">Exit Application Completely</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Data Management & Backups */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft space-y-4">
          <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider mb-2">
            Data Backup & Portability
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl border border-rio-border bg-rio-soft hover:bg-rio-secondary text-rio-accent text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl border border-rio-border bg-rio-soft hover:bg-rio-secondary text-rio-accent text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Water History (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-2 transition-all ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History Logs</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-rio-primary hover:bg-rio-accent text-white text-xs font-extrabold shadow-lg shadow-rio-primary/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

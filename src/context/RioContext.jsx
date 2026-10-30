import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTodayLocalDate } from '../services/waterCalculator';

const RioContext = createContext(null);

export const RioProvider = ({ children }) => {
  // Core State
  const [settings, setSettings] = useState({
    notificationEnabled: 1,
    focusModeEnabled: 0,
    waterReminderEnabled: 1,
    taskReminderEnabled: 1,
    soundEnabled: 1,
    popupPosition: 'top-right',
    popupDuration: 15,
    snoozeDuration: 10,
    dailyTargetMl: 2500,
    waterReminderInterval: 30,
    waterReminderStartTime: '08:00',
    waterReminderEndTime: '22:00',
    defaultContainerId: 'c-250',
    closeToTray: 1,
  });

  const [waterGoal, setWaterGoal] = useState({ dailyTargetMl: 2500 });
  const [containers, setContainers] = useState([]);
  const [todayWaterEntries, setTodayWaterEntries] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [reminderHistory, setReminderHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [selectedDateEntries, setSelectedDateEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active modal state
  const [isCustomMlModalOpen, setIsCustomMlModalOpen] = useState(false);
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeEditingReminder, setActiveEditingReminder] = useState(null);

  // Load All Data from SQLite
  const reloadData = useCallback(async () => {
    if (!window.rioAPI) return;

    try {
      const [s, g, c, todayEntries, rems, hist, dateEntries] = await Promise.all([
        window.rioAPI.getSettings(),
        window.rioAPI.getWaterGoal(),
        window.rioAPI.getContainers(),
        window.rioAPI.getWaterEntriesForDate(getTodayLocalDate()),
        window.rioAPI.getReminders(),
        window.rioAPI.getReminderHistory(),
        window.rioAPI.getWaterEntriesForDate(selectedDate),
      ]);

      if (s) setSettings(s);
      if (g) setWaterGoal(g);
      if (c) setContainers(c);
      if (todayEntries) setTodayWaterEntries(todayEntries);
      if (rems) setReminders(rems);
      if (hist) setReminderHistory(hist);
      if (dateEntries) setSelectedDateEntries(dateEntries);
    } catch (err) {
      console.error('[RioContext] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    reloadData();

    // Listen for real-time IPC updates
    let unsubscribeWater = () => {};
    let unsubscribeSettings = () => {};

    if (window.rioAPI?.onWaterUpdated) {
      unsubscribeWater = window.rioAPI.onWaterUpdated(() => {
        reloadData();
      });
    }

    if (window.rioAPI?.onSettingsUpdated) {
      unsubscribeSettings = window.rioAPI.onSettingsUpdated((newSettings) => {
        setSettings(newSettings);
        reloadData();
      });
    }

    return () => {
      unsubscribeWater();
      unsubscribeSettings();
    };
  }, [reloadData]);

  // Update selected date entries whenever selected date changes
  useEffect(() => {
    if (window.rioAPI?.getWaterEntriesForDate) {
      window.rioAPI.getWaterEntriesForDate(selectedDate).then((entries) => {
        setSelectedDateEntries(entries || []);
      });
    }
  }, [selectedDate]);

  // ---------------------------------------------------
  // MUTATION ACTIONS (Fully functional & Database-backed)
  // ---------------------------------------------------
  const toggleNotifications = async () => {
    const newVal = Number(settings.notificationEnabled) === 1 ? 0 : 1;
    await window.rioAPI.updateSetting('notificationEnabled', newVal);
    setSettings((prev) => ({ ...prev, notificationEnabled: newVal }));
  };

  const toggleFocusMode = async () => {
    const newVal = Number(settings.focusModeEnabled) === 1 ? 0 : 1;
    await window.rioAPI.updateSetting('focusModeEnabled', newVal);
    setSettings((prev) => ({ ...prev, focusModeEnabled: newVal }));
  };

  const saveGoal = async (dailyTargetMl) => {
    const res = await window.rioAPI.setWaterGoal(dailyTargetMl);
    setWaterGoal(res);
    setSettings((prev) => ({ ...prev, dailyTargetMl: res.dailyTargetMl }));
    await reloadData();
  };

  const addWater = async ({ amountMl, timestamp, localDate, containerId, note }) => {
    await window.rioAPI.addWaterEntry({
      amountMl: parseInt(amountMl, 10),
      timestamp: timestamp || new Date().toISOString(),
      localDate: localDate || selectedDate,
      containerId: containerId || null,
      note: note || '',
    });
    await reloadData();
  };

  const updateWater = async (id, updates) => {
    await window.rioAPI.updateWaterEntry(id, updates);
    await reloadData();
  };

  const deleteWater = async (id) => {
    await window.rioAPI.deleteWaterEntry(id);
    await reloadData();
  };

  const saveContainer = async (containerData) => {
    if (containerData.id) {
      await window.rioAPI.updateContainer(containerData.id, containerData);
    } else {
      await window.rioAPI.createContainer(containerData);
    }
    await reloadData();
  };

  const deleteContainer = async (id) => {
    await window.rioAPI.deleteContainer(id);
    await reloadData();
  };

  const setDefaultContainer = async (id) => {
    await window.rioAPI.setDefaultContainer(id);
    await reloadData();
  };

  const saveReminder = async (remData) => {
    if (remData.id) {
      await window.rioAPI.updateReminder(remData.id, remData);
    } else {
      await window.rioAPI.createReminder(remData);
    }
    await reloadData();
  };

  const deleteReminder = async (id) => {
    await window.rioAPI.deleteReminder(id);
    await reloadData();
  };

  const completeReminder = async (id) => {
    await window.rioAPI.completeReminder(id);
    await reloadData();
  };

  const toggleReminderEnabled = async (id, currentEnabled) => {
    await window.rioAPI.updateReminder(id, { enabled: currentEnabled ? 0 : 1 });
    await reloadData();
  };

  const updateSettingsBulk = async (newSettings) => {
    const updated = await window.rioAPI.updateSettingsBulk(newSettings);
    setSettings(updated);
  };

  return (
    <RioContext.Provider
      value={{
        settings,
        setSettings,
        waterGoal,
        containers,
        todayWaterEntries,
        selectedDateEntries,
        reminders,
        reminderHistory,
        selectedDate,
        setSelectedDate,
        isLoading,
        reloadData,

        // Actions
        toggleNotifications,
        toggleFocusMode,
        saveGoal,
        addWater,
        updateWater,
        deleteWater,
        saveContainer,
        deleteContainer,
        setDefaultContainer,
        saveReminder,
        deleteReminder,
        completeReminder,
        toggleReminderEnabled,
        updateSettingsBulk,

        // Modal Controls
        isCustomMlModalOpen,
        setIsCustomMlModalOpen,
        isContainerModalOpen,
        setIsContainerModalOpen,
        isReminderModalOpen,
        setIsReminderModalOpen,
        activeEditingReminder,
        setActiveEditingReminder,
      }}
    >
      {children}
    </RioContext.Provider>
  );
};

export const useRio = () => {
  const context = useContext(RioContext);
  if (!context) {
    throw new Error('useRio must be used within a RioProvider');
  }
  return context;
};

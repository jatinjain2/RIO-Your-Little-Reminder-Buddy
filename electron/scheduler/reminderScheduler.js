import {
  getSettings,
  getReminders,
  recordReminderHistory,
  getWaterEntriesForDate,
  getLatestWaterGoal,
  getContainers
} from '../database/repository.js';
import { queryOne, execute } from '../database/db.js';

let schedulerInterval = null;
let mainWindowRef = null;
let overlayWindowRef = null;
let snoozeMap = new Map(); // reminderId -> snoozedUntilDate
let lastWaterReminderCheckMinute = -1;

export function initScheduler({ mainWindow, overlayWindow, showOverlayCallback }) {
  mainWindowRef = mainWindow;
  overlayWindowRef = overlayWindow;

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  // Run tick every 10 seconds to detect triggers with high precision
  schedulerInterval = setInterval(() => {
    checkSchedules(showOverlayCallback);
  }, 10000);

  // Immediately check upon startup/recovery
  setTimeout(() => {
    checkSchedules(showOverlayCallback);
  }, 1500);

  console.log('[Scheduler] Initialized background scheduler');
}

export function handleSystemWake() {
  console.log('[Scheduler] System resumed from sleep, performing immediate schedule sync');
  // Avoid flood of stale notifications by syncing current timestamp
  snoozeMap.clear();
}

export function snoozeReminder(id, minutes = 10) {
  const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
  snoozeMap.set(id, snoozedUntil);
  console.log(`[Scheduler] Reminder ${id} snoozed until ${snoozedUntil.toLocaleTimeString()}`);
}

export function isOccurrenceProcessed(occurrenceKey) {
  try {
    const row = queryOne(`SELECT occurrenceKey FROM ProcessedOccurrences WHERE occurrenceKey = ?`, [occurrenceKey]);
    return !!row;
  } catch (err) {
    return false;
  }
}

export function markOccurrenceProcessed(occurrenceKey) {
  try {
    execute(
      `INSERT OR REPLACE INTO ProcessedOccurrences (occurrenceKey, processedAt) VALUES (?, ?)`,
      [occurrenceKey, new Date().toISOString()]
    );
  } catch (err) {
    console.error('[Scheduler] Failed to mark occurrence processed:', err);
  }
}

export async function checkSchedules(showOverlayCallback) {
  try {
    const settings = getSettings();

    // 1. Master Notification Switch Check (CRITICAL)
    if (!settings.notificationEnabled || Number(settings.notificationEnabled) === 0) {
      return;
    }

    // 2. Focus Mode Check (CRITICAL)
    if (settings.focusModeEnabled && Number(settings.focusModeEnabled) === 1) {
      return;
    }

    const now = new Date();

    // A. CHECK WATER REMINDER
    if (settings.waterReminderEnabled && Number(settings.waterReminderEnabled) === 1) {
      checkWaterReminder(now, settings, showOverlayCallback);
    }

    // B. CHECK TASK REMINDERS
    if (settings.taskReminderEnabled && Number(settings.taskReminderEnabled) === 1) {
      checkTaskReminders(now, settings, showOverlayCallback);
    }
  } catch (err) {
    console.error('[Scheduler] Error in checkSchedules:', err);
  }
}

function checkWaterReminder(now, settings, showOverlayCallback) {
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon ... 7=Sun
  const activeDays = (settings.waterReminderDays || '1,2,3,4,5,6,7').split(',').map(Number);
  if (!activeDays.includes(currentDayOfWeek)) {
    return;
  }

  // Check Active Time Window (e.g. 08:00 - 22:00)
  const startTime = settings.waterReminderStartTime || '08:00';
  const endTime = settings.waterReminderEndTime || '22:00';

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return;
  }

  // Interval check (e.g. every 30 minutes: minute % interval === 0)
  const interval = Math.max(1, parseInt(settings.waterReminderInterval, 10) || 30);
  const currentMinuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${Math.floor(currentMinutes / interval)}`;

  // Prevent multiple popups within the same slot
  if (isOccurrenceProcessed(`water-${currentMinuteKey}`)) {
    return;
  }

  // Ensure minute is exactly on the interval or within 1 minute of starting
  if (currentMinutes % interval !== 0 && currentMinutes % interval !== 1) {
    return;
  }

  // Check if water reminder is snoozed
  if (snoozeMap.has('water-reminder')) {
    const snoozedUntil = snoozeMap.get('water-reminder');
    if (now < snoozedUntil) {
      return;
    }
    snoozeMap.delete('water-reminder');
  }

  // Calculate live hydration stats for notification overlay
  const localDateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  const entries = getWaterEntriesForDate(localDateStr);
  const totalConsumed = entries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
  const goal = getLatestWaterGoal();
  const dailyTargetMl = goal ? goal.dailyTargetMl : 2500;
  const remainingMl = Math.max(0, dailyTargetMl - totalConsumed);
  const containers = getContainers();
  const defaultContainer = containers.find(c => c.isDefault) || containers[0] || { capacityMl: 250, name: 'Normal Glass' };
  const servingsRemaining = Math.ceil(remainingMl / (defaultContainer.capacityMl || 250));

  markOccurrenceProcessed(`water-${currentMinuteKey}`);

  if (typeof showOverlayCallback === 'function') {
    showOverlayCallback({
      type: 'water',
      data: {
        title: 'Hey buddy! 💧',
        subtitle: 'Time to hydrate!',
        consumedMl: totalConsumed,
        targetMl: dailyTargetMl,
        remainingMl: remainingMl,
        servingsRemaining: servingsRemaining,
        defaultContainerCapacity: defaultContainer.capacityMl || 250,
      }
    });
  }
}

function checkTaskReminders(now, settings, showOverlayCallback) {
  const reminders = getReminders();

  for (const rem of reminders) {
    if (!rem.enabled) continue;

    // Check if snoozed
    if (snoozeMap.has(rem.id)) {
      const snoozedUntil = snoozeMap.get(rem.id);
      if (now < snoozedUntil) {
        continue;
      }
      snoozeMap.delete(rem.id);
    }

    const scheduled = new Date(rem.scheduledDateTime);
    const timeDiffMs = now.getTime() - scheduled.getTime();

    // Occurrence identifier based on recurrence
    let shouldTrigger = false;
    let occurrenceKey = '';

    if (rem.repeatRule === 'once') {
      occurrenceKey = `rem-${rem.id}-once`;
      // Allow trigger if within past 2 minutes (prevents stale backlog floods)
      if (timeDiffMs >= 0 && timeDiffMs < 2 * 60 * 1000 && !isOccurrenceProcessed(occurrenceKey)) {
        shouldTrigger = true;
      }
    } else if (rem.repeatRule === 'daily') {
      const datePart = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      occurrenceKey = `rem-${rem.id}-daily-${datePart}`;
      
      // Match hour and minute
      const sameHour = now.getHours() === scheduled.getHours();
      const sameMinute = Math.abs(now.getMinutes() - scheduled.getMinutes()) <= 1;

      if (sameHour && sameMinute && !isOccurrenceProcessed(occurrenceKey)) {
        shouldTrigger = true;
      }
    } else if (rem.repeatRule === 'weekly') {
      const weekPart = `${now.getFullYear()}-w${Math.floor(now.getDate() / 7)}`;
      occurrenceKey = `rem-${rem.id}-weekly-${weekPart}`;
      
      const sameDayOfWeek = now.getDay() === scheduled.getDay();
      const sameHour = now.getHours() === scheduled.getHours();
      const sameMinute = Math.abs(now.getMinutes() - scheduled.getMinutes()) <= 1;

      if (sameDayOfWeek && sameHour && sameMinute && !isOccurrenceProcessed(occurrenceKey)) {
        shouldTrigger = true;
      }
    } else if (rem.repeatRule === 'weekdays') {
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      const datePart = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      occurrenceKey = `rem-${rem.id}-weekday-${datePart}`;

      const sameHour = now.getHours() === scheduled.getHours();
      const sameMinute = Math.abs(now.getMinutes() - scheduled.getMinutes()) <= 1;

      if (isWeekday && sameHour && sameMinute && !isOccurrenceProcessed(occurrenceKey)) {
        shouldTrigger = true;
      }
    }

    if (shouldTrigger) {
      markOccurrenceProcessed(occurrenceKey);
      recordReminderHistory({
        reminderId: rem.id,
        title: rem.title,
        category: rem.category,
        triggeredAt: now.toISOString(),
        status: 'triggered'
      });

      if (typeof showOverlayCallback === 'function') {
        showOverlayCallback({
          type: 'task',
          data: {
            id: rem.id,
            title: rem.title,
            description: rem.description || "It's time for your scheduled task!",
            category: rem.category,
            priority: rem.priority,
            scheduledDateTime: rem.scheduledDateTime,
          }
        });
      }
    }
  }
}

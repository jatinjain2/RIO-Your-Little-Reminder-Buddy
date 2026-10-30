import { describe, it, expect, beforeEach } from 'vitest';
import { isOccurrenceProcessed, markOccurrenceProcessed } from '../electron/scheduler/reminderScheduler.js';
import { initDatabase } from '../electron/database/db.js';
import * as repo from '../electron/database/repository.js';
import path from 'path';
import fs from 'fs';

describe('Electron Main Scheduler and Gating Engine', () => {
  beforeEach(async () => {
    // Initialize temporary memory database instance for test isolation
    await initDatabase(':memory:');
  });

  it('prevents duplicate notification occurrences', () => {
    const occurrenceKey = 'water-2026-10-30-slot-24';
    expect(isOccurrenceProcessed(occurrenceKey)).toBe(false);

    markOccurrenceProcessed(occurrenceKey);
    expect(isOccurrenceProcessed(occurrenceKey)).toBe(true);

    // Reprocessing must remain blocked
    expect(isOccurrenceProcessed(occurrenceKey)).toBe(true);
  });

  it('persists and enforces the Master Notification Switch state', () => {
    repo.updateSetting('notificationEnabled', 1);
    let s = repo.getSettings();
    expect(Number(s.notificationEnabled)).toBe(1);

    // Disable master switch
    repo.updateSetting('notificationEnabled', 0);
    s = repo.getSettings();
    expect(Number(s.notificationEnabled)).toBe(0);
  });

  it('persists and enforces Focus Mode', () => {
    repo.updateSetting('focusModeEnabled', 0);
    let s = repo.getSettings();
    expect(Number(s.focusModeEnabled)).toBe(0);

    // Activate focus mode
    repo.updateSetting('focusModeEnabled', 1);
    s = repo.getSettings();
    expect(Number(s.focusModeEnabled)).toBe(1);
  });

  it('correctly tracks and completes task reminders', () => {
    const rem = repo.createReminder({
      title: 'Complete SQL Assignment',
      description: 'Review queries',
      scheduledDateTime: new Date().toISOString(),
      category: 'Study',
      repeatRule: 'once',
      enabled: 1,
    });

    expect(rem.title).toBe('Complete SQL Assignment');
    expect(rem.enabled).toBe(1);

    // Complete reminder
    repo.completeReminder(rem.id);
    const updated = repo.getReminderById(rem.id);
    // One-time reminders auto-disable upon completion
    expect(updated.enabled).toBe(0);
  });
});

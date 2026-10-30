import { describe, it, expect } from 'vitest';
import { calculateWaterStats, formatTime, getTodayLocalDate } from '../src/services/waterCalculator';

describe('Water Hydration Calculations', () => {
  it('correctly calculates remaining water and percentage for standard entries', () => {
    // Example from spec:
    // Daily goal: 2500 ml. Entries: 150 + 275 + 100 + 425 = 950 ml.
    // Consumed: 950 ml, Remaining: 1550 ml, Progress: 38%.
    const entries = [
      { amountMl: 150 },
      { amountMl: 275 },
      { amountMl: 100 },
      { amountMl: 425 },
    ];
    const stats = calculateWaterStats(entries, 2500, 250);

    expect(stats.totalConsumed).toBe(950);
    expect(stats.remainingWater).toBe(1550);
    expect(stats.progressPercentage).toBe(38);
    // Servings remaining = ceil(1550 / 250) = 7
    expect(stats.servingsRemaining).toBe(7);
    expect(stats.isGoalMet).toBe(false);
  });

  it('correctly supports any positive custom ML entry', () => {
    const customEntries = [
      { amountMl: 50 },
      { amountMl: 75 },
      { amountMl: 125 },
      { amountMl: 175 },
      { amountMl: 225 },
      { amountMl: 275 },
      { amountMl: 325 },
      { amountMl: 425 },
      { amountMl: 650 },
      { amountMl: 875 },
      { amountMl: 1200 },
    ];
    const sum = customEntries.reduce((a, b) => a + b.amountMl, 0); // 4400 ml
    const stats = calculateWaterStats(customEntries, 2500, 250);

    expect(stats.totalConsumed).toBe(sum);
    expect(stats.remainingWater).toBe(0); // Never negative remaining
    expect(stats.progressPercentage).toBe(176); // > 100% progress supported
    expect(stats.servingsRemaining).toBe(0);
    expect(stats.isGoalMet).toBe(true);
  });

  it('handles goal exceeded without negative values', () => {
    const entries = [{ amountMl: 3000 }];
    const stats = calculateWaterStats(entries, 2500, 250);

    expect(stats.totalConsumed).toBe(3000);
    expect(stats.remainingWater).toBe(0);
    expect(stats.isGoalMet).toBe(true);
  });

  it('formats dates consistently', () => {
    const today = getTodayLocalDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

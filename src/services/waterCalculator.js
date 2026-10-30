export function calculateWaterStats(entries = [], dailyGoalMl = 2500, containerCapacity = 250) {
  const goal = Math.max(100, Number(dailyGoalMl) || 2500);
  const container = Math.max(1, Number(containerCapacity) || 250);

  const totalConsumed = entries.reduce((acc, curr) => acc + (Number(curr.amountMl) || 0), 0);
  const remainingWater = Math.max(0, goal - totalConsumed);
  const progressPercentage = Math.round((totalConsumed / goal) * 100);
  const servingsRemaining = Math.ceil(remainingWater / container);
  const isGoalMet = totalConsumed >= goal;

  const count = entries.length;
  const averagePerEntry = count > 0 ? Math.round(totalConsumed / count) : 0;

  return {
    totalConsumed,
    dailyGoal: goal,
    remainingWater,
    progressPercentage,
    servingsRemaining,
    isGoalMet,
    entryCount: count,
    averagePerEntry,
  };
}

export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatShortDate(isoOrDateStr) {
  if (!isoOrDateStr) return '';
  const date = new Date(isoOrDateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function getTodayLocalDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
}

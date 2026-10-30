import React from 'react';
import { useRio } from '../context/RioContext';
import { calculateWaterStats, formatTime } from '../services/waterCalculator';
import { RioMascot } from '../components/mascot/RioMascot';
import { 
  Droplet, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  Sparkles,
  Coffee,
  Check
} from 'lucide-react';

export const Dashboard = ({ onNavigate }) => {
  const { 
    waterGoal, 
    containers, 
    todayWaterEntries, 
    reminders, 
    setIsCustomMlModalOpen,
    setIsReminderModalOpen,
    completeReminder,
    addWater
  } = useRio();

  const defaultCont = containers.find((c) => c.isDefault) || containers[0] || { capacityMl: 250, name: 'Normal Glass' };
  const stats = calculateWaterStats(todayWaterEntries, waterGoal.dailyTargetMl, defaultCont.capacityMl);

  // Mascot expression based on hydration level
  let mascotMood = 'happy';
  if (stats.progressPercentage >= 100) mascotMood = 'celebrating';
  else if (stats.progressPercentage >= 70) mascotMood = 'excited';
  else if (stats.progressPercentage >= 35) mascotMood = 'encouraging';
  else if (new Date().getHours() >= 21) mascotMood = 'sleeping';

  // Today's upcoming and pending tasks
  const now = new Date();
  const upcomingReminders = reminders
    .filter((r) => r.enabled)
    .sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime));

  const nextReminder = upcomingReminders[0] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Mascot Banner */}
      <div className="bg-gradient-to-r from-rio-secondary via-white to-rio-secondary/60 rounded-3xl p-6 border border-rio-border shadow-rio-soft flex items-center justify-between">
        <div className="flex items-center gap-6">
          <RioMascot expression={mascotMood} className="w-24 h-24" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rio-primary uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-rio-border shadow-sm">
                Rio Daily Status
              </span>
              {stats.isGoalMet && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Goal Achieved!
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-rio-navy mt-1 tracking-tight">
              {stats.isGoalMet
                ? "You did it! Keep shining, hydration champion!"
                : stats.totalConsumed === 0
                ? "Let's kick off today with a fresh glass of water!"
                : `You're ${stats.progressPercentage}% to your hydration target!`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Target: {stats.dailyGoal} ml &bull; Consumed: {stats.totalConsumed} ml &bull; {stats.remainingWater} ml left
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomMlModalOpen(true)}
            className="bg-white hover:bg-rio-soft text-rio-accent border border-rio-border font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-rio-primary" />
            <span>+ Custom ML</span>
          </button>
        </div>
      </div>

      {/* Grid Cards (A, B, C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card A: Today's Hydration */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rio-secondary text-rio-primary flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-rio-primary" />
              </div>
              <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">Today's Hydration</h3>
            </div>
            <span className="text-xs font-extrabold text-rio-primary bg-rio-soft px-2 py-0.5 rounded-lg border border-rio-border">
              {stats.progressPercentage}%
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-rio-navy">{stats.totalConsumed}</span>
              <span className="text-xs font-semibold text-slate-400 ml-1">/ {stats.dailyGoal} ml</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Remaining</span>
              <p className="text-sm font-extrabold text-rio-primary">{stats.remainingWater} ml</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-rio-soft rounded-full overflow-hidden border border-rio-border my-2">
            <div
              className="h-full bg-gradient-to-r from-rio-primary to-rio-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.progressPercentage)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Approx. <strong className="text-rio-navy">{stats.servingsRemaining}</strong> more servings ({defaultCont.capacityMl} ml {defaultCont.name})
          </p>

          {/* Quick Serving Add row */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => addWater({ amountMl: 250, note: 'Quick 250ml glass' })}
              className="flex-1 py-2 bg-rio-soft hover:bg-rio-secondary text-rio-accent rounded-xl text-xs font-bold transition-all text-center"
            >
              +250 ml
            </button>
            <button
              onClick={() => addWater({ amountMl: 500, note: 'Quick 500ml bottle' })}
              className="flex-1 py-2 bg-rio-soft hover:bg-rio-secondary text-rio-accent rounded-xl text-xs font-bold transition-all text-center"
            >
              +500 ml
            </button>
          </div>
        </div>

        {/* Card B: Next Reminder */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">Next Reminder</h3>
            </div>
            {nextReminder && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {nextReminder.category}
              </span>
            )}
          </div>

          {nextReminder ? (
            <div className="my-auto py-2">
              <h4 className="text-base font-bold text-rio-navy line-clamp-1">{nextReminder.title}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {nextReminder.description || 'Scheduled companion reminder.'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rio-primary">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(nextReminder.scheduledDateTime)}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="capitalize">{nextReminder.repeatRule}</span>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center py-4">
              <p className="text-xs font-medium text-slate-400">No pending reminders for today.</p>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="mt-2 text-xs font-bold text-rio-primary hover:underline"
              >
                + Schedule a reminder
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {upcomingReminders.length} active {upcomingReminders.length === 1 ? 'task' : 'tasks'}
            </span>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-bold text-rio-primary hover:text-rio-accent flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card C: Quick Container Favorites */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rio-secondary text-rio-primary flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">Drinking Containers</h3>
            </div>
            <button
              onClick={() => onNavigate('water')}
              className="text-xs font-bold text-rio-primary hover:text-rio-accent"
            >
              Manage
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {containers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => addWater({ amountMl: c.capacityMl, containerId: c.id, note: `Drank 1 ${c.name}` })}
                className="p-2.5 rounded-2xl bg-rio-soft border border-rio-border hover:bg-rio-secondary/60 hover:scale-[1.02] transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rio-navy group-hover:text-rio-accent line-clamp-1">
                    {c.name}
                  </span>
                  {c.isDefault === 1 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rio-primary" title="Default" />
                  )}
                </div>
                <p className="text-[11px] font-semibold text-rio-primary mt-0.5">+{c.capacityMl} ml</p>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Tap container to record instantly</span>
            <button
              onClick={() => setIsCustomMlModalOpen(true)}
              className="text-xs font-bold text-rio-primary hover:text-rio-accent"
            >
              + Custom ML
            </button>
          </div>
        </div>
      </div>

      {/* Timeline & Activity Feed (Card D & Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Water Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rio-secondary text-rio-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">
                Today's Water Activity
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {todayWaterEntries.length} {todayWaterEntries.length === 1 ? 'entry' : 'entries'} today
            </span>
          </div>

          {todayWaterEntries.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <RioMascot expression="encouraging" className="w-16 h-16 opacity-80" />
              <p className="text-sm font-semibold text-slate-500 mt-2">No water logged yet today!</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Stay refreshed and energized. Add your first glass or custom container.
              </p>
              <button
                onClick={() => setIsCustomMlModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-rio-primary text-white text-xs font-bold hover:bg-rio-accent transition-all shadow-sm"
              >
                + Log Water Now
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {todayWaterEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rio-soft border border-rio-border hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rio-secondary text-rio-primary flex items-center justify-center font-bold text-xs">
                      💧
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-rio-navy">{entry.amountMl} ml</span>
                        {entry.containerName && (
                          <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                            {entry.containerName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {formatTime(entry.timestamp)} {entry.note ? `• ${entry.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-rio-primary">
                    +{entry.amountMl} ml
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-rio-navy uppercase tracking-wider">Today's Tasks</h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="text-xs font-bold text-rio-primary hover:text-rio-accent"
              >
                + Add
              </button>
            </div>

            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No tasks scheduled for today.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {upcomingReminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-2xl bg-rio-soft border border-rio-border flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-rio-navy line-clamp-1">{rem.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatTime(rem.scheduledDateTime)} &bull; {rem.category}
                      </p>
                    </div>
                    <button
                      onClick={() => completeReminder(rem.id)}
                      title="Mark Completed"
                      className="w-7 h-7 rounded-xl bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 flex items-center justify-center transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('reminders')}
            className="w-full mt-4 py-2 rounded-xl bg-rio-soft hover:bg-rio-secondary text-rio-accent text-xs font-bold transition-all text-center"
          >
            Manage All Reminders &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

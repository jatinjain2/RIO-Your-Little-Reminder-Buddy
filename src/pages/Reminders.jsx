import React, { useState } from 'react';
import { useRio } from '../context/RioContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Bell, 
  Clock, 
  Repeat, 
  CheckCircle2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { formatTime, formatShortDate } from '../services/waterCalculator';

export const Reminders = () => {
  const {
    reminders,
    reminderHistory,
    deleteReminder,
    completeReminder,
    toggleReminderEnabled,
    setIsReminderModalOpen,
    setActiveEditingReminder,
  } = useRio();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

  const categories = ['All', 'Work', 'Study', 'Personal', 'Health', 'Errands'];

  const filteredReminders = reminders.filter((r) => {
    if (categoryFilter === 'All') return true;
    return r.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div>
          <h2 className="text-xl font-extrabold text-rio-navy">My Reminders & Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set alerts for assignments, meetings, calls, and daily productivity routines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-rio-soft p-1 rounded-xl border border-rio-border">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-rio-primary shadow-sm'
                  : 'text-slate-500 hover:text-rio-navy'
              }`}
            >
              Upcoming ({reminders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-rio-primary shadow-sm'
                  : 'text-slate-500 hover:text-rio-navy'
              }`}
            >
              Trigger History
            </button>
          </div>

          <button
            onClick={() => {
              setActiveEditingReminder(null);
              setIsReminderModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rio-primary text-white text-xs font-bold hover:bg-rio-accent transition-all shadow-md shadow-rio-primary/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reminder</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      {activeTab === 'upcoming' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === c
                  ? 'bg-rio-navy text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-rio-border hover:bg-rio-soft'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Main Content List */}
      {activeTab === 'upcoming' ? (
        filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-rio-border shadow-rio-soft">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rio-navy">No reminders in this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Never forget an important meeting, job application, or study session.
            </p>
            <button
              onClick={() => {
                setActiveEditingReminder(null);
                setIsReminderModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-rio-primary text-white text-xs font-bold hover:bg-rio-accent shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((rem) => {
              const isEnabled = Boolean(rem.enabled);
              const schedDate = new Date(rem.scheduledDateTime);
              const isPast = schedDate < new Date() && rem.repeatRule === 'once';

              return (
                <div
                  key={rem.id}
                  className={`bg-white rounded-3xl p-5 border transition-all flex items-center justify-between ${
                    isEnabled
                      ? 'border-rio-border shadow-rio-soft hover:border-rio-primary/40'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkmark Button */}
                    <button
                      onClick={() => completeReminder(rem.id)}
                      title="Mark Completed"
                      className="mt-0.5 w-6 h-6 rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-rio-navy">{rem.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rio-secondary text-rio-primary">
                          {rem.category}
                        </span>
                        {rem.priority === 'high' && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600">
                            High Priority
                          </span>
                        )}
                      </div>

                      {rem.description && (
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">{rem.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1 text-rio-primary">
                          <Clock className="w-3.5 h-3.5" />
                          {formatShortDate(rem.scheduledDateTime)} at {formatTime(rem.scheduledDateTime)}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 capitalize">
                          <Repeat className="w-3.5 h-3.5 text-slate-400" />
                          {rem.repeatRule}
                        </span>
                        {isPast && isEnabled && (
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Past due
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => toggleReminderEnabled(rem.id, isEnabled)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isEnabled ? 'Active' : 'Paused'}
                    </button>

                    <button
                      onClick={() => {
                        setActiveEditingReminder(rem);
                        setIsReminderModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Trigger History Tab */
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
          <h3 className="text-base font-extrabold text-rio-navy mb-4">Notification & Trigger Logs</h3>
          {reminderHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No trigger history recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reminderHistory.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rio-navy">{h.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      Triggered: {new Date(h.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      h.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rio-secondary text-rio-primary'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

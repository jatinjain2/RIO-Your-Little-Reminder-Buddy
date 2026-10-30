import React, { useState } from 'react';
import { useRio } from '../context/RioContext';
import { calculateWaterStats, formatTime, getTodayLocalDate } from '../services/waterCalculator';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Droplet, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Settings2,
  Check,
  Star
} from 'lucide-react';
import { ContainerModal } from '../components/modals/ContainerModal';

export const WaterTracker = () => {
  const {
    waterGoal,
    saveGoal,
    containers,
    selectedDate,
    setSelectedDate,
    selectedDateEntries,
    deleteWater,
    deleteContainer,
    setDefaultContainer,
    setIsCustomMlModalOpen,
    addWater,
  } = useRio();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(waterGoal.dailyTargetMl || 2500));
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);

  const defaultCont = containers.find((c) => c.isDefault) || containers[0] || { capacityMl: 250, name: 'Normal Glass' };
  const stats = calculateWaterStats(selectedDateEntries, waterGoal.dailyTargetMl, defaultCont.capacityMl);

  // Date navigation helpers
  const handleDateShift = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
    setSelectedDate(newStr);
  };

  const isToday = selectedDate === getTodayLocalDate();

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(goalInput, 10);
    if (val && val >= 100 && val <= 10000) {
      saveGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDateShift(-1)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-rio-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-rio-navy bg-transparent outline-none cursor-pointer text-sm"
            />
            {isToday && (
              <span className="text-[10px] font-bold bg-rio-secondary text-rio-primary px-2 py-0.5 rounded-full">
                TODAY
              </span>
            )}
          </div>

          <button
            onClick={() => handleDateShift(1)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(getTodayLocalDate())}
            className="px-3 py-2 rounded-xl border border-rio-border text-xs font-bold text-rio-primary hover:bg-rio-soft transition-all"
          >
            Go to Today
          </button>

          <button
            onClick={() => setIsCustomMlModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rio-primary text-white text-xs font-bold hover:bg-rio-accent transition-all shadow-md shadow-rio-primary/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Custom ML</span>
          </button>
        </div>
      </div>

      {/* Goal & Hydration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Goal</span>
            <button
              onClick={() => {
                setGoalInput(String(waterGoal.dailyTargetMl));
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-xs text-rio-primary hover:underline font-bold"
            >
              {isEditingGoal ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleGoalSubmit} className="mt-2 space-y-2">
              <input
                type="number"
                min="500"
                max="8000"
                step="50"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-rio-soft border border-rio-primary rounded-xl text-sm font-bold text-rio-navy outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-rio-primary text-white text-xs font-bold hover:bg-rio-accent"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-2xl font-extrabold text-rio-navy">{waterGoal.dailyTargetMl} ml</p>
              <p className="text-[11px] text-slate-400 mt-1">Configured daily target</p>
            </div>
          )}
        </div>

        {/* Total Consumed */}
        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consumed</span>
          <p className="text-2xl font-extrabold text-rio-navy mt-2">{stats.totalConsumed} ml</p>
          <p className="text-[11px] text-rio-primary font-bold mt-1">{stats.progressPercentage}% of goal</p>
        </div>

        {/* Remaining Water */}
        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
          <p className="text-2xl font-extrabold text-rio-navy mt-2">{stats.remainingWater} ml</p>
          <p className="text-[11px] text-slate-400 mt-1">
            ~{stats.servingsRemaining} servings ({defaultCont.capacityMl} ml)
          </p>
        </div>

        {/* Entries Count */}
        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Entries</span>
          <p className="text-2xl font-extrabold text-rio-navy mt-2">{stats.entryCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Avg {stats.averagePerEntry} ml / entry</p>
        </div>
      </div>

      {/* Containers Management Section (Requirement B) */}
      <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-rio-navy">Your Drinking Containers</h3>
            <p className="text-xs text-slate-400">Click container to log water, or manage sizes & defaults</p>
          </div>
          <button
            onClick={() => {
              setEditingContainer(null);
              setIsContainerModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rio-soft hover:bg-rio-secondary text-rio-accent text-xs font-bold border border-rio-border transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Container</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {containers.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                c.isDefault === 1
                  ? 'bg-gradient-to-b from-rio-secondary/60 to-white border-rio-primary/40 shadow-sm'
                  : 'bg-rio-soft/60 border-rio-border hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: c.color || '#329BFA' }}
                >
                  💧
                </div>
                {c.isDefault === 1 ? (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rio-primary text-white">
                    DEFAULT
                  </span>
                ) : (
                  <button
                    onClick={() => setDefaultContainer(c.id)}
                    title="Set as default serving"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500 transition-opacity"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="my-2 cursor-pointer" onClick={() => addWater({ amountMl: c.capacityMl, containerId: c.id, note: `Drank 1 ${c.name}` })}>
                <h4 className="text-xs font-bold text-rio-navy line-clamp-1">{c.name}</h4>
                <p className="text-sm font-extrabold text-rio-primary mt-0.5">{c.capacityMl} ml</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => addWater({ amountMl: c.capacityMl, containerId: c.id, note: `Drank 1 ${c.name}` })}
                  className="text-[10px] font-bold text-rio-primary hover:underline"
                >
                  + Add 1 cup
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingContainer(c);
                      setIsContainerModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteContainer(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological History Table for Selected Day (Requirement E) */}
      <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-rio-navy">
              Chronological Water History ({selectedDate})
            </h3>
            <p className="text-xs text-slate-400">
              Exact recorded timestamps for {isToday ? 'today' : selectedDate}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {selectedDateEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No consumption recorded for this date.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {selectedDateEntries.map((entry) => (
              <div key={entry.id} className="py-3 flex items-center justify-between hover:bg-rio-soft/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rio-secondary text-rio-primary font-bold flex items-center justify-center text-sm">
                    {formatTime(entry.timestamp)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-rio-navy">{entry.amountMl} ml</span>
                      {entry.containerName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-rio-border text-slate-600">
                          {entry.containerName}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteWater(entry.id)}
                    title="Delete Entry"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Container Create/Edit Modal */}
      <ContainerModal
        isOpen={isContainerModalOpen}
        onClose={() => {
          setIsContainerModalOpen(false);
          setEditingContainer(null);
        }}
        editingContainer={editingContainer}
      />
    </div>
  );
};

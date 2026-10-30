import React, { useState, useEffect } from 'react';
import { useRio } from '../context/RioContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplet, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { formatTime } from '../services/waterCalculator';

export const CalendarView = () => {
  const { setSelectedDate, reminders } = useRio();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthEntries, setMonthEntries] = useState([]);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load entries for entire visible month range
  useEffect(() => {
    if (!window.rioAPI) return;
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    window.rioAPI.getWaterEntriesRange(startDate, endDate).then((entries) => {
      setMonthEntries(entries || []);
    });
  }, [year, month]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Group water consumption by localDate
  const waterByDate = {};
  for (const entry of monthEntries) {
    waterByDate[entry.localDate] = (waterByDate[entry.localDate] || 0) + entry.amountMl;
  }

  const handleSelectDay = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(dateStr);

    const dayWater = waterByDate[dateStr] || 0;
    const dayTasks = reminders.filter((r) => {
      const d = new Date(r.scheduledDateTime);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === dayNum
      );
    });

    setSelectedDayInfo({
      dateStr,
      water: dayWater,
      tasks: dayTasks,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rio-secondary text-rio-primary flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-rio-navy">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">Monthly hydration & scheduled task planner</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl border border-rio-border text-xs font-bold text-rio-primary hover:bg-rio-soft"
          >
            Current Month
          </button>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {d}
              </span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={'blank-' + i} className="h-20 rounded-2xl bg-slate-50/50" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const water = waterByDate[dateKey] || 0;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`h-20 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:border-rio-primary hover:shadow-sm ${
                    isToday
                      ? 'bg-gradient-to-b from-rio-secondary/60 to-white border-rio-primary/50'
                      : 'bg-rio-soft/40 border-slate-100 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-rio-primary' : 'text-rio-navy'}`}>
                      {day}
                    </span>
                    {water > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rio-primary" />
                    )}
                  </div>

                  {water > 0 && (
                    <div className="text-[10px] font-bold text-rio-accent bg-rio-secondary/80 rounded-lg px-1.5 py-0.5 text-center">
                      {water} ml
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Info Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-rio-navy mb-4">
              Day Details {selectedDayInfo ? `(${selectedDayInfo.dateStr})` : ''}
            </h3>

            {selectedDayInfo ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rio-soft border border-rio-border">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hydration Recorded</span>
                  <p className="text-2xl font-extrabold text-rio-navy mt-1">
                    {selectedDayInfo.water} ml
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-rio-navy mb-2 uppercase tracking-wider">
                    Scheduled Tasks ({selectedDayInfo.tasks.length})
                  </h4>
                  {selectedDayInfo.tasks.length === 0 ? (
                    <p className="text-xs text-slate-400">No tasks on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayInfo.tasks.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs font-bold text-rio-navy">{t.title}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {formatTime(t.scheduledDateTime)} &bull; {t.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">
                Click any day on the calendar to view its hydration and tasks.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

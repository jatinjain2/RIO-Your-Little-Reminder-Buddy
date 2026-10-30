import React, { useState, useEffect } from 'react';
import { useRio } from '../context/RioContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { 
  BarChart2, 
  Droplet, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Zap
} from 'lucide-react';
import { calculateWaterStats } from '../services/waterCalculator';

export const Statistics = () => {
  const { waterGoal, reminders, reminderHistory } = useRio();
  const [allEntries, setAllEntries] = useState([]);
  const [timeRange, setTimeRange] = useState('7days'); // '7days' | '30days'

  useEffect(() => {
    if (window.rioAPI?.getAllWaterEntries) {
      window.rioAPI.getAllWaterEntries().then((entries) => {
        setAllEntries(entries || []);
      });
    }
  }, []);

  // Compute daily totals for the past 7 or 30 days
  const numDays = timeRange === '7days' ? 7 : 30;
  const chartData = [];
  const now = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');

    const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const dayEntries = allEntries.filter((e) => e.localDate === dateStr);
    const dayTotal = dayEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);

    chartData.push({
      date: dateStr,
      label,
      amountMl: dayTotal,
      goal: waterGoal.dailyTargetMl || 2500,
    });
  }

  // Summary Metrics
  const totalWaterAllTime = allEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
  const totalEntriesCount = allEntries.length;

  const dailyTotalsArray = chartData.map((c) => c.amountMl);
  const highestDayMl = dailyTotalsArray.length > 0 ? Math.max(...dailyTotalsArray) : 0;
  const averageDailyMl = dailyTotalsArray.length > 0
    ? Math.round(dailyTotalsArray.reduce((a, b) => a + b, 0) / dailyTotalsArray.length)
    : 0;

  const daysGoalAchieved = chartData.filter((c) => c.amountMl >= (waterGoal.dailyTargetMl || 2500)).length;
  const goalAchievementRate = numDays > 0 ? Math.round((daysGoalAchieved / numDays) * 100) : 0;

  // Task Completion Stats
  const completedTasksCount = reminderHistory.filter((h) => h.status === 'completed').length;
  const triggeredTasksCount = reminderHistory.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rio-secondary text-rio-primary flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-rio-navy">Hydration & Habit Analytics</h2>
            <p className="text-xs text-slate-400">Database-backed charts and performance indicators</p>
          </div>
        </div>

        <div className="flex bg-rio-soft p-1 rounded-xl border border-rio-border">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '7days' ? 'bg-white text-rio-primary shadow-sm' : 'text-slate-500 hover:text-rio-navy'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '30days' ? 'bg-white text-rio-primary shadow-sm' : 'text-slate-500 hover:text-rio-navy'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <TrendingUp className="w-4 h-4 text-rio-primary" />
            <span>Daily Average</span>
          </div>
          <p className="text-2xl font-extrabold text-rio-navy">{averageDailyMl} ml</p>
          <p className="text-[11px] text-slate-400 mt-1">Over past {numDays} days</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Highest Day</span>
          </div>
          <p className="text-2xl font-extrabold text-rio-navy">{highestDayMl} ml</p>
          <p className="text-[11px] text-slate-400 mt-1">Peak intake recorded</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Goal Success</span>
          </div>
          <p className="text-2xl font-extrabold text-rio-navy">{goalAchievementRate}%</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            {daysGoalAchieved} of {numDays} days target met
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rio-border shadow-rio-soft">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4 text-rio-primary" />
            <span>Tasks Completed</span>
          </div>
          <p className="text-2xl font-extrabold text-rio-navy">{completedTasksCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">{triggeredTasksCount} total triggered</p>
        </div>
      </div>

      {/* Main Hydration Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-rio-border shadow-rio-soft">
        <h3 className="text-base font-extrabold text-rio-navy mb-4">
          Daily Consumption vs Target (ml)
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F4FF" />
              <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A2540',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="amountMl" name="Water Consumed (ml)" fill="#329BFA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

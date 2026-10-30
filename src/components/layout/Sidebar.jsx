import React from 'react';
import { RioMascot } from '../mascot/RioMascot';
import { 
  LayoutDashboard, 
  Droplet, 
  Bell, 
  Calendar, 
  BarChart2, 
  Settings, 
  ShieldCheck, 
  Moon,
  Sparkles
} from 'lucide-react';
import { useRio } from '../../context/RioContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { settings, toggleFocusMode } = useRio();
  const isFocusMode = Number(settings.focusModeEnabled) === 1;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'water', label: 'Water Tracker', icon: Droplet },
    { id: 'reminders', label: 'My Reminders', icon: Bell },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'statistics', label: 'Statistics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-rio-border flex flex-col justify-between py-6 px-4 shadow-sm select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <RioMascot expression="happy" className="w-11 h-11" animated={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold text-rio-navy tracking-tight">RIO</h1>
              <span className="text-[10px] font-bold bg-rio-secondary text-rio-primary px-1.5 py-0.5 rounded-md">
                v1.0
              </span>
            </div>
            <p className="text-[11px] font-semibold text-rio-primary tracking-wide">
              Your Reminder Buddy
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-rio-primary text-white shadow-md shadow-rio-primary/25'
                    : 'text-slate-600 hover:text-rio-navy hover:bg-rio-soft'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Focus Mode Quick Banner in Sidebar */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div
          onClick={toggleFocusMode}
          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
            isFocusMode
              ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'
              : 'bg-rio-soft border-rio-border text-rio-navy hover:bg-rio-secondary/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Moon className={`w-3.5 h-3.5 ${isFocusMode ? 'text-amber-600' : 'text-rio-primary'}`} />
              <span className="text-xs font-bold">Focus Mode</span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                isFocusMode ? 'bg-amber-200 text-amber-900' : 'bg-white text-slate-500'
              }`}
            >
              {isFocusMode ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {isFocusMode ? 'All popups muted for focus' : 'Click to mute all notifications'}
          </p>
        </div>
      </div>
    </aside>
  );
};

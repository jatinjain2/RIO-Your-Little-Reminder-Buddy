import React from 'react';
import { useRio } from '../../context/RioContext';
import { Bell, BellOff, Plus, Droplet } from 'lucide-react';
import { RioMascot } from '../mascot/RioMascot';

export const Header = ({ onQuickAddClick }) => {
  const { settings, toggleNotifications } = useRio();
  const isNotificationsOn = Number(settings.notificationEnabled) === 1;

  // Localized Greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
  if (currentHour >= 17) greeting = 'Good evening';

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-rio-border px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Greeting & Date */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-rio-navy tracking-tight">
            {greeting}, Buddy! 👋
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">{todayStr}</p>
      </div>

      {/* Right: Master Notification Switch & Quick Action */}
      <div className="flex items-center gap-4">
        {/* Master Notification Switch */}
        <div className="flex items-center gap-3 bg-rio-soft border border-rio-border px-3.5 py-1.5 rounded-2xl">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-rio-navy uppercase tracking-wider">
              Rio Popups
            </span>
            <span
              className={`text-[10px] font-bold ${
                isNotificationsOn ? 'text-rio-primary' : 'text-slate-400'
              }`}
            >
              {isNotificationsOn ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <button
            onClick={toggleNotifications}
            title={
              isNotificationsOn
                ? 'Disable all Rio popups instantly'
                : 'Enable Rio popups'
            }
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              isNotificationsOn ? 'bg-rio-primary' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center ${
                isNotificationsOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {isNotificationsOn ? (
                <Bell className="w-3 h-3 text-rio-primary" />
              ) : (
                <BellOff className="w-3 h-3 text-slate-400" />
              )}
            </div>
          </button>
        </div>

        {/* Quick Add Custom ML button */}
        <button
          onClick={onQuickAddClick}
          className="flex items-center gap-1.5 bg-rio-primary hover:bg-rio-accent text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-rio-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Quick Water</span>
        </button>
      </div>
    </header>
  );
};

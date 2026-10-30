import React, { useState } from 'react';
import { useRio } from '../../context/RioContext';
import { X, Check, Bell } from 'lucide-react';

export const ReminderModal = ({ isOpen, onClose, editingReminder = null }) => {
  const { saveReminder } = useRio();

  const now = new Date();
  const defaultDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  
  // Default to 1 hour from now
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  const defaultTime = `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;

  const existingDateObj = editingReminder?.scheduledDateTime ? new Date(editingReminder.scheduledDateTime) : null;
  const initialDate = existingDateObj
    ? [existingDateObj.getFullYear(), String(existingDateObj.getMonth() + 1).padStart(2, '0'), String(existingDateObj.getDate()).padStart(2, '0')].join('-')
    : defaultDate;
  const initialTime = existingDateObj
    ? `${String(existingDateObj.getHours()).padStart(2, '0')}:${String(existingDateObj.getMinutes()).padStart(2, '0')}`
    : defaultTime;

  const [title, setTitle] = useState(editingReminder?.title || '');
  const [description, setDescription] = useState(editingReminder?.description || '');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [category, setCategory] = useState(editingReminder?.category || 'Work');
  const [priority, setPriority] = useState(editingReminder?.priority || 'medium');
  const [repeatRule, setRepeatRule] = useState(editingReminder?.repeatRule || 'once');
  const [soundEnabled, setSoundEnabled] = useState(editingReminder?.soundEnabled !== undefined ? Boolean(editingReminder.soundEnabled) : true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = ['Work', 'Study', 'Personal', 'Health', 'Errands'];
  const repeatOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Selected Weekdays (Mon-Fri)', value: 'weekdays' },
    { label: 'Weekly', value: 'weekly' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a reminder title');
      return;
    }

    const [h, m] = (time || '12:00').split(':').map(Number);
    const scheduled = new Date(date);
    scheduled.setHours(h, m, 0, 0);

    await saveReminder({
      id: editingReminder?.id,
      title: title.trim(),
      description: description.trim(),
      scheduledDateTime: scheduled.toISOString(),
      category,
      priority,
      repeatRule,
      soundEnabled: soundEnabled ? 1 : 0,
      enabled: 1,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rio-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-rio-floating border border-rio-border overflow-hidden">
        <div className="bg-gradient-to-r from-rio-secondary to-white px-6 py-4 flex items-center justify-between border-b border-rio-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rio-primary/15 text-rio-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-rio-navy">
              {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-rio-navy mb-1 uppercase tracking-wider">
              Reminder Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. Complete SQL assignment, Attend team sync..."
              className="w-full px-4 py-2.5 bg-rio-soft rounded-xl border border-rio-border text-sm font-semibold text-rio-navy outline-none focus:border-rio-primary"
              required
            />
            {error && <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links or instructions..."
              className="w-full px-4 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs text-rio-navy outline-none focus:border-rio-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Repeat Frequency</label>
            <select
              value={repeatRule}
              onChange={(e) => setRepeatRule(e.target.value)}
              className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
            >
              {repeatOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="soundRem"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-rio-primary accent-rio-primary cursor-pointer"
            />
            <label htmlFor="soundRem" className="text-xs font-semibold text-rio-navy cursor-pointer">
              Play gentle chime when this reminder triggers
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rio-primary hover:bg-rio-accent text-white text-xs font-bold shadow-md shadow-rio-primary/25 flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

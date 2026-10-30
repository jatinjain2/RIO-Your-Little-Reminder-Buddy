import React, { useState } from 'react';
import { useRio } from '../../context/RioContext';
import { X, Droplet, Clock, Calendar, Check } from 'lucide-react';
import { getTodayLocalDate } from '../../services/waterCalculator';

export const CustomMlModal = ({ isOpen, onClose }) => {
  const { addWater, containers } = useRio();

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');

  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [selectedTime, setSelectedTime] = useState(`${currentHours}:${currentMinutes}`);
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 150, 200, 250, 300, 500];

  const handleQuickSelect = (val) => {
    setAmount(String(val));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const val = parseInt(amount, 10);

    if (!val || isNaN(val) || val <= 0) {
      setError('Please enter a positive water amount (e.g., 275 ml)');
      return;
    }

    if (val > 5000) {
      setError('Amount exceeds 5000 ml limit for a single entry');
      return;
    }

    // Construct custom ISO timestamp based on picked date and time
    const [h, m] = (selectedTime || '12:00').split(':').map(Number);
    const dateObj = new Date(selectedDate);
    dateObj.setHours(h, m, 0, 0);

    await addWater({
      amountMl: val,
      timestamp: dateObj.toISOString(),
      localDate: selectedDate,
      containerId: selectedContainerId || null,
      note: note.trim(),
    });

    // Reset and close
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rio-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-rio-floating border border-rio-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rio-secondary to-white px-6 py-4 flex items-center justify-between border-b border-rio-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rio-primary/15 text-rio-primary flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-rio-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-rio-navy">How much water did you drink? 💧</h2>
              <p className="text-xs text-rio-primary font-medium">Record exact ml and custom timestamp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Main ML Input */}
          <div>
            <label className="block text-xs font-bold text-rio-navy mb-1.5 uppercase tracking-wider">
              Amount in Millilitres (ML) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="5000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="Enter amount in ml (e.g. 275)"
                className="w-full pl-4 pr-14 py-3 bg-rio-soft rounded-2xl border border-rio-border focus:border-rio-primary focus:ring-2 focus:ring-rio-primary/20 text-lg font-bold text-rio-navy outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-rio-primary">
                ml
              </span>
            </div>
            {error && <p className="text-xs text-rose-500 font-semibold mt-1.5">{error}</p>}
          </div>

          {/* Quick Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Quick Selection:
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickSelect(q)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    amount === String(q)
                      ? 'bg-rio-primary text-white border-rio-primary shadow-sm'
                      : 'bg-rio-soft text-rio-accent border-rio-border hover:bg-rio-secondary'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date & Time Entry (Requirement D) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rio-primary" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rio-primary" /> Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
              />
            </div>
          </div>

          {/* Optional Container Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Container Used (Optional)
            </label>
            <select
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(e.target.value)}
              className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs font-medium text-rio-navy outline-none focus:border-rio-primary"
            >
              <option value="">-- No specific container --</option>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.capacityMl} ml)
                </option>
              ))}
            </select>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. After morning run, at office..."
              maxLength={100}
              className="w-full px-3 py-2 bg-rio-soft rounded-xl border border-rio-border text-xs text-rio-navy outline-none focus:border-rio-primary placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rio-primary hover:bg-rio-accent text-white text-xs font-bold shadow-md shadow-rio-primary/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useRio } from '../../context/RioContext';
import { X, Check } from 'lucide-react';

export const ContainerModal = ({ isOpen, onClose, editingContainer = null }) => {
  const { saveContainer } = useRio();

  const [name, setName] = useState(editingContainer?.name || '');
  const [capacityMl, setCapacityMl] = useState(editingContainer?.capacityMl || '');
  const [icon, setIcon] = useState(editingContainer?.icon || 'GlassWater');
  const [color, setColor] = useState(editingContainer?.color || '#329BFA');
  const [isDefault, setIsDefault] = useState(editingContainer?.isDefault ? true : false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const colorPalette = ['#329BFA', '#38BDF8', '#0284C7', '#1769AA', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
  const iconOptions = ['GlassWater', 'CupSoda', 'Coffee', 'BottleWater', 'Cylinder', 'Milk'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a container name');
      return;
    }
    const cap = parseInt(capacityMl, 10);
    if (!cap || cap <= 0) {
      setError('Please enter a valid positive capacity in ml');
      return;
    }

    await saveContainer({
      id: editingContainer?.id,
      name: name.trim(),
      capacityMl: cap,
      icon,
      color,
      isDefault: isDefault ? 1 : 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rio-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-rio-floating border border-rio-border overflow-hidden">
        <div className="bg-gradient-to-r from-rio-secondary to-white px-6 py-4 flex items-center justify-between border-b border-rio-border">
          <h2 className="text-lg font-bold text-rio-navy">
            {editingContainer ? 'Edit Container' : 'New Drinking Container'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-rio-navy mb-1 uppercase tracking-wider">
              Container Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. My Gym Bottle, Office Mug..."
              className="w-full px-4 py-2.5 bg-rio-soft rounded-xl border border-rio-border text-sm font-semibold text-rio-navy outline-none focus:border-rio-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rio-navy mb-1 uppercase tracking-wider">
              Capacity in ML *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10000"
                value={capacityMl}
                onChange={(e) => {
                  setCapacityMl(e.target.value);
                  setError('');
                }}
                placeholder="e.g. 750"
                className="w-full px-4 pr-12 py-2.5 bg-rio-soft rounded-xl border border-rio-border text-sm font-semibold text-rio-navy outline-none focus:border-rio-primary"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rio-primary">
                ml
              </span>
            </div>
            {error && <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Select Color
            </label>
            <div className="flex gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-rio-primary' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultCont"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-rio-primary accent-rio-primary cursor-pointer"
            />
            <label htmlFor="isDefaultCont" className="text-xs font-semibold text-rio-navy cursor-pointer">
              Set as my default serving container
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
              <Check className="w-4 h-4" /> Save Container
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

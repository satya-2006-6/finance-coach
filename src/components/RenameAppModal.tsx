import React, { useState } from 'react';
import { X, Check, Sparkles, Pencil } from 'lucide-react';
import { triggerCelebration } from '../utils/formatters';

interface RenameAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppName: string;
  currentCoachName: string;
  onSaveName: (newAppName: string, newCoachName: string) => void;
}

const PRESET_NAMES = [
  { appName: 'PaisaWise AI', coachName: 'Coach Paisa', tagline: 'Smart action coach for Indian & global personal wealth' },
  { appName: 'FinPulse AI', coachName: 'Coach Pulse', tagline: 'Real-time financial vitals & leak prevention' },
  { appName: 'Artha AI', coachName: 'Coach Artha', tagline: 'Derived from ancient prosperity & financial clarity' },
  { appName: 'PennyPilot', coachName: 'Coach Pilot', tagline: 'Direct actionable navigation for every saved dollar & rupee' },
  { appName: 'FinCoach AI', coachName: 'Coach Alex', tagline: 'Hyper-personalized weekly wealth prescriptions' },
  { appName: 'Kuber AI', coachName: 'Coach Kuber', tagline: 'Guardian of emergency cushion & long-term wealth' },
];

export const RenameAppModal: React.FC<RenameAppModalProps> = ({
  isOpen,
  onClose,
  currentAppName,
  currentCoachName,
  onSaveName,
}) => {
  const [appName, setAppName] = useState(currentAppName);
  const [coachName, setCoachName] = useState(currentCoachName);

  if (!isOpen) return null;

  const handleSelectPreset = (presetApp: string, presetCoach: string) => {
    setAppName(presetApp);
    setCoachName(presetCoach);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;
    onSaveName(appName.trim(), coachName.trim() || 'Coach');
    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase mb-1">
          <Pencil className="w-4 h-4 text-emerald-600" />
          <span>Brand Identity Customizer</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">
          Customize Your App Name
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Personalize the application branding and your AI financial coach's persona.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              App Title / Brand
            </label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. PaisaWise AI, FinPulse, WealthPilot"
              className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              AI Coach Persona Name
            </label>
            <input
              type="text"
              required
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="e.g. Coach Paisa, Coach Artha, Coach Alex"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Or Pick a Popular Identity:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_NAMES.map((item) => (
                <button
                  key={item.appName}
                  type="button"
                  onClick={() => handleSelectPreset(item.appName, item.coachName)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    appName === item.appName
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{item.appName}</span>
                    {appName === item.appName && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.coachName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Name Everywhere</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

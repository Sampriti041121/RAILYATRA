import React, { useState } from 'react';
import { X, Settings, Bell, Sliders, Save, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'formal' | 'dark';
  onToggleTheme: (theme: 'formal' | 'dark') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onToggleTheme }) => {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoRefreshSec, setAutoRefreshSec] = useState(5);
  const [confidenceBand, setConfidenceBand] = useState('80');
  const [savedMsg, setSavedMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-blue-400/30">
              YATRA AI SYSTEM CONFIGURATION
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> Platform Settings
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {savedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {savedMsg}
            </div>
          )}

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">Appearance & Color Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleTheme('formal')}
                className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                  currentTheme === 'formal'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Formal White / Navy
              </button>

              <button
                onClick={() => onToggleTheme('dark')}
                className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                  currentTheme === 'dark'
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/50 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Midnight Dark
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600" /> Push Delay Alerts
              </span>
              <span className="text-[11px] text-slate-500 block">Receive instant notifications for bottleneck risks & delays &gt; 15m.</span>
            </div>
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="w-4 h-4 accent-blue-700 cursor-pointer"
            />
          </div>

          {/* Auto Refresh Frequency */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Telemetry Auto-Refresh Rate:</span>
              <span className="text-blue-700 font-mono">{autoRefreshSec}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="w-full accent-blue-700"
            />
          </div>

          {/* Confidence Intervals */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" /> Default Uncertainty Prediction Band
            </label>
            <select
              value={confidenceBand}
              onChange={(e) => setConfidenceBand(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="80">80% Confidence Interval (Operational Dispatch)</option>
              <option value="95">95% Confidence Interval (Conservative Passenger Window)</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

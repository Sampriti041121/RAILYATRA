import React, { useState } from 'react';
import { Sliders, RefreshCw, CheckCircle2, Zap, CloudFog, AlertTriangle } from 'lucide-react';
import { runWhatIfSimulation } from '../services/api';

interface WhatIfSimulatorProps {
  trainId: string;
  onSimulationResult?: (result: any) => void;
}

export const WhatIfSimulatorModule: React.FC<WhatIfSimulatorProps> = ({ trainId, onSimulationResult }) => {
  const [priorityBoost, setPriorityBoost] = useState<number>(1);
  const [dwellReduction, setDwellReduction] = useState<number>(3.0);
  const [congestionOverride, setCongestionOverride] = useState<number>(0.30);
  const [weatherOverride, setWeatherOverride] = useState<string>('Clear');
  const [clearConflict, setClearConflict] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const applyPreset = (type: 'VIP' | 'DWELL' | 'CONGESTION' | 'FOG') => {
    if (type === 'VIP') {
      setPriorityBoost(2);
      setDwellReduction(5.0);
      setCongestionOverride(0.15);
      setWeatherOverride('Clear');
      setClearConflict(true);
    } else if (type === 'DWELL') {
      setPriorityBoost(1);
      setDwellReduction(8.0);
      setCongestionOverride(0.30);
      setWeatherOverride('Clear');
      setClearConflict(false);
    } else if (type === 'CONGESTION') {
      setPriorityBoost(1);
      setDwellReduction(3.0);
      setCongestionOverride(0.10);
      setWeatherOverride('Clear');
      setClearConflict(true);
    } else if (type === 'FOG') {
      setPriorityBoost(0);
      setDwellReduction(1.0);
      setCongestionOverride(0.75);
      setWeatherOverride('Dense Fog');
      setClearConflict(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    const res = await runWhatIfSimulation({
      train_id: trainId,
      priority_boost: priorityBoost,
      dwell_reduction_min: dwellReduction,
      congestion_override: congestionOverride,
      weather_override: weatherOverride,
      clear_preceding_conflict: clearConflict
    });
    setResult(res);
    setLoading(false);
    if (onSimulationResult) onSimulationResult(res);
  };

  return (
    <div className="glass-panel p-5 border-l-4 border-l-cyan-500 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> Counterfactual "What-If" Operations Simulator
          </h3>
          <p className="text-xs text-gray-400">Simulate operational control interventions to discover real-time delay recovery opportunities.</p>
        </div>
        <span className="badge-cyan font-mono text-[10px]">LAYER 6 INTELLIGENCE</span>
      </div>

      {/* 1-Click Operational Scenario Presets Bar */}
      <div className="p-3 rounded-xl bg-[#111827] border border-[#1f293d] space-y-2">
        <span className="text-xs font-mono text-cyan-400 font-bold block">1-Click Interventional Presets:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('VIP')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> High Priority Clearance
          </button>

          <button
            onClick={() => applyPreset('DWELL')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Junction Dwell Recovery
          </button>

          <button
            onClick={() => applyPreset('CONGESTION')}
            className="px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Clear Freight Bottleneck
          </button>

          <button
            onClick={() => applyPreset('FOG')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <CloudFog className="w-3.5 h-3.5" /> Dense Fog Incident
          </button>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Boost */}
        <div className="space-y-1 bg-[#111827] p-3 rounded-lg border border-[#1f293d]">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-300">Operational Priority Boost:</span>
            <span className="text-cyan-400 font-bold">+{priorityBoost} Level</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={priorityBoost}
            onChange={(e) => setPriorityBoost(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Dwell Reduction */}
        <div className="space-y-1 bg-[#111827] p-3 rounded-lg border border-[#1f293d]">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-300">Station Dwell Optimization:</span>
            <span className="text-cyan-400 font-bold">-{dwellReduction} min</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={dwellReduction}
            onChange={(e) => setDwellReduction(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Congestion Override */}
        <div className="space-y-1 bg-[#111827] p-3 rounded-lg border border-[#1f293d]">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-300">Section Congestion Override:</span>
            <span className="text-cyan-400 font-bold">{(congestionOverride * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={congestionOverride}
            onChange={(e) => setCongestionOverride(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Weather & Conflict Toggles */}
        <div className="bg-[#111827] p-3 rounded-lg border border-[#1f293d] flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Weather Condition:</span>
            <select
              value={weatherOverride}
              onChange={(e) => setWeatherOverride(e.target.value)}
              className="bg-[#0b0f19] text-xs text-white border border-gray-700 rounded px-2 py-1"
            >
              <option value="Clear">Clear</option>
              <option value="Light Rain">Light Rain</option>
              <option value="Heavy Rain">Heavy Rain</option>
              <option value="Dense Fog">Dense Fog</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={clearConflict}
              onChange={(e) => setClearConflict(e.target.checked)}
              className="accent-cyan-400"
            />
            Clear Freight Conflict
          </label>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Recalculating YATRA AI Models...' : 'Run Counterfactual Simulation'}
      </button>

      {/* Counterfactual Output Display */}
      {result && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold">
              {result.label}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Potential Recovery: {result.potential_recovery_min} min
            </span>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#111827] border border-gray-800">
              <span className="text-gray-400 block mb-1">Original Baseline ETA:</span>
              <span className="text-lg font-bold text-rose-400">{result.base_eta}</span>
              <span className="text-gray-400 block text-[10px]">Delay: +{result.base_predicted_delay_min.toFixed(1)}m</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-cyan-500/40">
              <span className="text-gray-400 block mb-1">Simulated Counterfactual ETA:</span>
              <span className="text-lg font-bold text-emerald-400">{result.simulated_eta}</span>
              <span className="text-gray-400 block text-[10px]">Simulated Delay: +{result.simulated_predicted_delay_min.toFixed(1)}m</span>
            </div>
          </div>

          <p className="text-xs text-cyan-200 leading-relaxed italic border-t border-cyan-500/20 pt-2">
            {result.counterfactual_narrative}
          </p>
        </div>
      )}
    </div>
  );
};

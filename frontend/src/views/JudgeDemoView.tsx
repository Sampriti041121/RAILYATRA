import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Zap } from 'lucide-react';

interface JudgeDemoViewProps {
  onNavigateToTab: (tab: string) => void;
}

export const JudgeDemoView: React.FC<JudgeDemoViewProps> = ({ onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      step: 1,
      time: "14:00:00",
      title: "Step 1: Origin Departure & Initial Weather Delay",
      description: "Train 12001 (NDLS-HWH Vande Bharat Express) departs origin with a 7-minute weather delay. Static timetable predicts destination arrival at 18:40.",
      networkPressure: 38.0,
      pressureStatus: "LOW",
      trainDelay: 7.0,
      momentum: 0.0,
      aiForecast: 9.5,
      interval: "18:45 – 18:52",
      color: "cyan"
    },
    {
      step: 2,
      title: "Step 2: Section Congestion Spikes on SEC_CNB_PRYJ",
      time: "14:15:00",
      description: "At Kanpur Central (CNB), freight crossing conflicts cause section congestion to spike to 84%. Delay momentum turns positive (+0.42). YATRA AI expands destination ETA forecast to 19:07.",
      networkPressure: 56.5,
      pressureStatus: "HIGH",
      trainDelay: 14.0,
      momentum: 0.42,
      aiForecast: 27.0,
      interval: "19:01 – 19:14",
      color: "amber"
    },
    {
      step: 3,
      title: "Step 3: Downstream Network Cascade Triggered",
      time: "14:30:00",
      description: "Digital Twin Engine detects signal aspect hold propagation to Train 12005 (+9m) and Train 12626 (+5m). Total network cascade impact: 41 train-minutes.",
      networkPressure: 74.2,
      pressureStatus: "CRITICAL",
      trainDelay: 18.0,
      momentum: 0.38,
      aiForecast: 35.0,
      interval: "19:08 – 19:24",
      color: "rose"
    },
    {
      step: 4,
      title: "Step 4: Dispatcher Counterfactual Recovery Simulation",
      time: "14:32:00",
      description: "Dispatcher launches What-If Simulator: Optimizes dwell at CNB by 3 min & grants Section Priority (congestion 0.84 → 0.25). YATRA AI model predicts ETA recovery to 18:56 (11-minute recovery achieved!).",
      networkPressure: 45.0,
      pressureStatus: "NORMAL",
      trainDelay: 18.0,
      simulatedEta: "18:56",
      recoveryMin: 11.0,
      color: "emerald"
    }
  ];

  const curr = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-cyan font-mono text-[10px]">SIH 2026 JUDGE PITCH DEMO MODE</span>
            <span className="badge-emerald font-mono text-[10px]">60-SECOND OPERATIONAL STORY</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">YATRA AI Operational Storyline</h2>
          <p className="text-xs font-serif italic text-cyan-300">"Every Journey, Every Arrival Foreseen"</p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all ${
                currentStep === idx
                  ? 'bg-cyan-500 text-gray-950 shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-[#111827] text-gray-400 border border-[#1f293d] hover:text-white'
              }`}
            >
              0{s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Display Panel */}
      <div className="glass-panel p-6 space-y-6 glow-hover transition-all">
        {/* Step Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
              TIMESTAMP: {curr.time}
            </span>
            <h3 className="text-lg font-bold text-white">{curr.title}</h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-gray-400">Network Pressure:</span>
            <span className={curr.pressureStatus === 'CRITICAL' ? 'badge-rose' : (curr.pressureStatus === 'HIGH' ? 'badge-amber' : 'badge-emerald')}>
              {curr.networkPressure} ({curr.pressureStatus})
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-sm text-gray-200 leading-relaxed font-sans bg-[#111827] p-4 rounded-xl border border-[#1f293d]">
          {curr.description}
        </p>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1f293d] space-y-1">
            <span className="text-gray-400 block">Train 12001 Delay</span>
            <span className="text-xl font-bold text-rose-400">+{curr.trainDelay} min</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1f293d] space-y-1">
            <span className="text-gray-400 block">AI Predicted Dest Delay</span>
            <span className="text-xl font-bold text-cyan-400">+{curr.aiForecast} min</span>
          </div>

          {curr.interval && (
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1f293d] space-y-1">
              <span className="text-gray-400 block">80% Prediction Interval</span>
              <span className="text-lg font-bold text-violet-300">{curr.interval}</span>
            </div>
          )}

          {curr.simulatedEta && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
              <span className="text-emerald-300 block font-bold">Counterfactual ETA</span>
              <span className="text-xl font-bold text-emerald-400">{curr.simulatedEta} ({curr.recoveryMin}m saved)</span>
            </div>
          )}
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f293d]">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#162032] border border-[#1f293d] text-xs font-semibold text-gray-300 disabled:opacity-40 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigateToTab('what-if')}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Open Live What-If Simulator <Zap className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

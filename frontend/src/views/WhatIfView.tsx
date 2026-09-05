import React, { useState } from 'react';
import { WhatIfSimulatorModule } from '../components/WhatIfSimulatorModule';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const WhatIfView: React.FC = () => {
  const [selectedTrain, setSelectedTrain] = useState<string>("12001");

  return (
    <div className="space-y-6">
      {/* What-If Banner */}
      <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-cyan-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-cyan font-mono text-[10px]">LAYER 6 COUNTERFACTUAL INTELLIGENCE</span>
            <span className="badge-emerald font-mono text-[10px]">KEY DIFFERENTIATOR</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Counterfactual Operations Intelligence Center</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-3xl">
            Move beyond static ETA predictions. Simulate operational control interventions in real time: "What happens if this train receives section priority?", "What happens if dwell time is reduced at station CNB?", "What happens if section congestion clears?"
          </p>
        </div>

        <select
          value={selectedTrain}
          onChange={(e) => setSelectedTrain(e.target.value)}
          className="bg-[#111827] text-white font-mono text-sm border border-cyan-500/40 rounded-lg px-4 py-2"
        >
          <option value="12001">12001 — NDLS-HWH Vande Bharat Express</option>
          <option value="12005">12005 — NDLS-CNB Rajdhani Express</option>
          <option value="12626">12626 — SBC-NDLS Superfast Express</option>
          <option value="12840">12840 — CSMT-MAS Mail Special</option>
        </select>
      </div>

      {/* Main What-If Interactive Component */}
      <WhatIfSimulatorModule trainId={selectedTrain} />

      {/* Counterfactual Story Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
        <div className="glass-panel p-4 space-y-2">
          <h4 className="font-bold text-cyan-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Operational Priority Lever
          </h4>
          <p className="text-gray-300 leading-relaxed">
            Grants preferential signal aspect clearing over lower-priority freight and parcel specials on double-track lines, reducing section waiting time by 4–8 minutes.
          </p>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <h4 className="font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Dwell Time Optimization
          </h4>
          <p className="text-gray-300 leading-relaxed">
            Optimizes passenger boarding/alighting procedures and parcel loading at major junction stations to recover scheduled dwell buffer.
          </p>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <h4 className="font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Congestion Conflict Resolution
          </h4>
          <p className="text-gray-300 leading-relaxed">
            Simulates clearing preceding train occupancy on congested bottleneck sections, preventing delay momentum acceleration.
          </p>
        </div>
      </div>
    </div>
  );
};

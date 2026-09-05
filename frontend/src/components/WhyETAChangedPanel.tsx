import React from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ExplainabilityItem {
  feature: string;
  impact_min: number;
  type: string;
}

interface WhyETAChangedProps {
  explainability: ExplainabilityItem[];
  narrative?: string;
}

export const WhyETAChangedPanel: React.FC<WhyETAChangedProps> = ({ explainability, narrative }) => {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Why did the ETA change? (Explainable AI)
        </h3>
        <span className="badge-cyan font-mono text-[10px]">SHAP ATTRIBUTION</span>
      </div>

      {narrative && (
        <div className="p-3 mb-4 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed font-sans">
          <strong className="font-semibold text-cyan-400">AI Story Narrative: </strong> {narrative}
        </div>
      )}

      {/* Feature Contributions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {explainability.map((item, idx) => {
          const isPos = item.type === 'positive' || item.impact_min > 0;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isPos ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${isPos ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium text-gray-200">{item.feature}</span>
              </div>
              <span className={`font-mono text-xs font-bold ${isPos ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isPos ? `+${item.impact_min.toFixed(1)}m` : `${item.impact_min.toFixed(1)}m`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

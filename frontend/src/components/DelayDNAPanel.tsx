import React from 'react';
import { Dna, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DelayDNAProps {
  delayDna: {
    amplification_factor: number;
    amplification_status: string;
    dna_components: Array<{
      category: string;
      value_min: number;
      impact: string;
    }>;
  };
}

export const DelayDNAPanel: React.FC<DelayDNAProps> = ({ delayDna }) => {
  const getStatusIcon = (status: string) => {
    if (status === 'AMPLIFYING') return <TrendingUp className="w-4 h-4 text-rose-400" />;
    if (status === 'RECOVERING') return <TrendingDown className="w-4 h-4 text-emerald-400" />;
    return <Minus className="w-4 h-4 text-amber-400" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'AMPLIFYING') return 'badge-rose';
    if (status === 'RECOVERING') return 'badge-emerald';
    return 'badge-amber';
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Dna className="w-5 h-5 text-cyan-400" /> Train Delay DNA Breakdown
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Amplification:</span>
          <span className="font-mono font-bold text-cyan-400">{delayDna.amplification_factor.toFixed(2)}×</span>
          <span className={`flex items-center gap-1 ${getStatusBadge(delayDna.amplification_status)}`}>
            {getStatusIcon(delayDna.amplification_status)} {delayDna.amplification_status}
          </span>
        </div>
      </div>

      {/* DNA Components Progress Bars */}
      <div className="space-y-3">
        {delayDna.dna_components.map((comp, idx) => {
          const isNegative = comp.value_min < 0;
          const absVal = Math.abs(comp.value_min);
          const pct = Math.min(100, (absVal / 20.0) * 100);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300 font-medium">{comp.category}</span>
                <span className={isNegative ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {isNegative ? `${comp.value_min.toFixed(1)}m (Recovery)` : `+${comp.value_min.toFixed(1)}m`}
                </span>
              </div>
              <div className="h-2 w-full bg-[#162032] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isNegative ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.max(5, pct)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

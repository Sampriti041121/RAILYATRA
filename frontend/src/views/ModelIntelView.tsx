import React from 'react';
import { Cpu, ShieldCheck, Zap, GitBranch } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export const ModelIntelView: React.FC = () => {
  const featureImportances = [
    { feature: "Current Delay (current_delay_min)", importance: 0.385 },
    { feature: "Section Congestion Index", importance: 0.182 },
    { feature: "Delay Momentum Score", importance: 0.124 },
    { feature: "Rolling 3-Station Delay", importance: 0.095 },
    { feature: "Distance Remaining (km)", importance: 0.068 },
    { feature: "Preceding Conflict Min", importance: 0.052 },
    { feature: "Station Dwell Impact Min", importance: 0.041 },
    { feature: "Train Priority Level", importance: 0.032 },
    { feature: "Weather Impact Score", importance: 0.021 }
  ];

  const calibrationCurve = [
    { nominal: 50, observed: 52.4, ideal: 50 },
    { nominal: 70, observed: 71.8, ideal: 70 },
    { nominal: 80, observed: 84.5, ideal: 80 },
    { nominal: 90, observed: 91.2, ideal: 90 },
    { nominal: 95, observed: 96.2, ideal: 95 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Model Registry & Uncertainty Calibration</h2>
            <p className="text-xs text-gray-400">Model versioning, feature attribution, quantile calibration, and future architecture roadmap.</p>
          </div>
        </div>

        <span className="badge-cyan font-mono text-xs font-bold">REGISTRY VERSION: RAILCAST-GB-v1.4</span>
      </div>

      {/* Feature Importance & Calibration Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" /> SHAP Feature Attribution Importance
            </h3>
            <span className="badge-cyan font-mono text-[10px]">GBDT SHAP VALUES</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportances} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={9} width={150} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', color: '#fff' }} />
                <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Importance Weight" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantile Calibration Curve */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Empirical Uncertainty Calibration Curve
            </h3>
            <span className="badge-emerald font-mono text-[10px]">COVERAGE CALIBRATED</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calibrationCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="nominal" stroke="#9ca3af" fontSize={11} name="Nominal Confidence (%)" />
                <YAxis stroke="#9ca3af" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', color: '#fff' }} />
                <Line type="monotone" dataKey="ideal" stroke="#6b7280" strokeDasharray="5 5" name="Ideal Calibration" />
                <Line type="monotone" dataKey="observed" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} name="Observed Coverage (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Architecture & Future GNN Roadmap */}
      <div className="glass-panel p-5 border-l-4 border-l-violet-500">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <GitBranch className="w-5 h-5 text-violet-400" /> AI Architecture & Temporal Graph Neural Network (GNN) Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#111827] border border-cyan-500/30 space-y-1">
            <span className="badge-cyan text-[9px]">CURRENT PRODUCTION (STAGE 1)</span>
            <h4 className="font-bold text-white text-sm">GBDT + Quantile Regressors</h4>
            <p className="text-gray-400 font-sans">
              Fast, explainable LightGBM/Scikit-Learn ensemble trained on spatio-temporal delay features with sub-2ms inference latency.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-violet-500/30 space-y-1">
            <span className="badge-violet text-[9px]">STAGE 2 ROADMAP</span>
            <h4 className="font-bold text-white text-sm">Spatio-Temporal GNN (ST-GNN)</h4>
            <p className="text-gray-400 font-sans">
              Graph Convolutional Networks (GCN) + Temporal Attention to model dynamic network topological interactions explicitly across 10,000+ railway edges.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-amber-500/30 space-y-1">
            <span className="badge-amber text-[9px]">STAGE 3 ROADMAP</span>
            <h4 className="font-bold text-white text-sm">Temporal Fusion Transformer (TFT)</h4>
            <p className="text-gray-400 font-sans">
              Multi-horizon temporal attention architecture for simultaneous multi-train trajectory prediction under extreme weather disruptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

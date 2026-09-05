import React, { useEffect, useState } from 'react';
import { fetchTrains, fetchTrainPrediction } from '../services/api';
import { DelayDNAPanel } from '../components/DelayDNAPanel';
import { WhyETAChangedPanel } from '../components/WhyETAChangedPanel';
import { WhatIfSimulatorModule } from '../components/WhatIfSimulatorModule';
import { Train, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrainsViewProps {
  selectedTrainId?: string;
  onSelectTrain: (trainId: string) => void;
}

export const TrainsView: React.FC<TrainsViewProps> = ({ selectedTrainId = "12001", onSelectTrain }) => {
  const [trains, setTrains] = useState<any[]>([]);
  const [currentTrainId, setCurrentTrainId] = useState<string>(selectedTrainId);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTrainsList();
  }, []);

  useEffect(() => {
    if (currentTrainId) {
      loadPrediction(currentTrainId);
    }
  }, [currentTrainId]);

  const loadTrainsList = async () => {
    const list = await fetchTrains();
    setTrains(list);
  };

  const loadPrediction = async (id: string) => {
    setLoading(true);
    const pred = await fetchTrainPrediction(id);
    setPrediction(pred);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Train Selector Header */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Train Intelligence & Trajectory Forecast</h2>
            <p className="text-xs text-gray-400">Select a coaching train to inspect dynamic multi-horizon ETA forecasts, Delay DNA, and SHAP explanations.</p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <select
          value={currentTrainId}
          onChange={(e) => {
            setCurrentTrainId(e.target.value);
            onSelectTrain(e.target.value);
          }}
          className="bg-[#111827] text-white font-mono text-sm border border-cyan-500/40 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
        >
          {trains.map((t) => (
            <option key={t.train_id} value={t.train_id}>
              {t.train_id} — {t.train_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center text-cyan-400 font-mono animate-pulse">
          Loading AI Trajectory Predictions & Network Cascade Analysis...
        </div>
      ) : prediction ? (
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 border-l-4 border-l-cyan-500">
              <span className="text-xs text-gray-400 block mb-1">CURRENT LOCATION & DELAY</span>
              <h3 className="text-lg font-bold text-white">{prediction.current_station}</h3>
              <p className="text-sm font-mono font-bold text-rose-400 mt-1">+{prediction.current_delay_min.toFixed(1)} min Delay</p>
            </div>

            <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs text-gray-400 block mb-1">SCHEDULED DESTINATION ETA</span>
              <h3 className="text-lg font-bold text-gray-300 font-mono">{prediction.sched_destination_eta}</h3>
              <p className="text-xs text-gray-400 mt-1">Static Timetable Reference</p>
            </div>

            <div className="glass-panel p-4 border-l-4 border-l-cyan-500 glow-hover">
              <span className="text-xs text-cyan-400 font-bold block mb-1">RAILCAST AI PREDICTED ETA</span>
              <h3 className="text-2xl font-extrabold text-cyan-400 font-mono">{prediction.ai_predicted_destination_eta}</h3>
              <p className="text-xs font-mono font-semibold text-rose-400 mt-1">Predicted Delay: +{prediction.ai_predicted_delay_min.toFixed(1)}m</p>
            </div>

            <div className="glass-panel p-4 border-l-4 border-l-violet-500">
              <span className="text-xs text-gray-400 block mb-1">80% UNCERTAINTY INTERVAL</span>
              <h3 className="text-base font-bold text-violet-300 font-mono">{prediction.lower_bound_80_eta} – {prediction.upper_bound_80_eta}</h3>
              <p className="text-xs text-gray-400 mt-1">Confidence Score: <strong className="text-emerald-400 font-mono">{prediction.confidence_score}%</strong></p>
            </div>
          </div>

          {/* Trajectory Timeline Chart & Trajectory Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Multi-Horizon Trajectory Chart */}
            <div className="lg:col-span-2 glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Station-by-Station Delay Amplification Trajectory
                </h3>
                <span className="badge-cyan font-mono text-[10px]">MULTI-HORIZON FORECAST</span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prediction.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                    <XAxis dataKey="station_name" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} unit="m" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', color: '#fff' }} />
                    <Line type="monotone" dataKey="forecast_arr_delay_min" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} name="Predicted Delay (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trajectory Station Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs font-mono text-left text-gray-300">
                  <thead className="bg-[#111827] text-gray-400 border-b border-[#1f293d]">
                    <tr>
                      <th className="p-2">Station</th>
                      <th className="p-2">Sched Arr</th>
                      <th className="p-2">Actual / Forecast</th>
                      <th className="p-2">Delay (min)</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.trajectory.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#1f293d]/50 hover:bg-[#162032]">
                        <td className="p-2 font-bold text-white">{item.station_name} ({item.station_code})</td>
                        <td className="p-2 text-gray-400">{item.sched_arr}</td>
                        <td className="p-2 font-bold text-cyan-400">{item.actual_or_forecast_arr}</td>
                        <td className="p-2 text-rose-400 font-bold">+{item.forecast_arr_delay_min.toFixed(1)}m</td>
                        <td className="p-2">
                          <span className={item.status === 'ACTUAL' ? 'badge-emerald text-[9px]' : 'badge-cyan text-[9px]'}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Delay DNA Breakdown */}
            <div className="space-y-6">
              <DelayDNAPanel delayDna={prediction.delay_dna} />

              {/* Novel Metrics Card */}
              <div className="glass-panel p-5 space-y-3 font-mono text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Operational Novel Indicators
                </h4>

                <div className="flex justify-between items-center p-2 rounded bg-[#111827] border border-[#1f293d]">
                  <span className="text-gray-400">Delay Momentum Score:</span>
                  <span className="text-rose-400 font-bold">+{prediction.novel_metrics.delay_momentum} ({prediction.novel_metrics.delay_momentum_status})</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-[#111827] border border-[#1f293d]">
                  <span className="text-gray-400">ETA Trust Score:</span>
                  <span className="text-emerald-400 font-bold">{prediction.novel_metrics.eta_trust_score}/100</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-[#111827] border border-[#1f293d]">
                  <span className="text-gray-400">Model Disagreement:</span>
                  <span className="text-amber-400 font-bold">{prediction.novel_metrics.model_disagreement_min} min ({prediction.novel_metrics.model_disagreement_level})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI SHAP Panel */}
          <WhyETAChangedPanel explainability={prediction.explainability} narrative={prediction.ai_story_narrative} />

          {/* Downstream Cascade & What-If Simulator Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Downstream Network Cascade Prediction */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" /> Downstream Delay Cascade Impact
                </h3>
                <span className="badge-rose text-[10px]">LAYER 3 NETWORK CASCADE</span>
              </div>

              <div className="p-3 mb-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs font-mono">
                Propagated Delay: <strong className="text-rose-400">{prediction.cascade_prediction.total_propagated_train_minutes} train-minutes</strong> across {prediction.cascade_prediction.affected_trains_count} downstream trains.
              </div>

              <div className="space-y-2">
                {prediction.cascade_prediction.cascade_details.map((c: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#111827] border border-[#1f293d] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white">{c.affected_train_name}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.propagation_reason}</p>
                    </div>
                    <span className="text-rose-400 font-bold">+{c.estimated_delay_impact_min}m</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Counterfactual What-If Simulator */}
            <WhatIfSimulatorModule trainId={currentTrainId} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

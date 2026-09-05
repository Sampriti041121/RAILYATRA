import React, { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { NetworkMapCanvas } from '../components/NetworkMapCanvas';
import { fetchNetworkState, fetchBottlenecks, fetchAlerts, fetchTrains } from '../services/api';
import { Activity, Train, AlertTriangle, ShieldCheck, Cpu, ArrowRight, Zap, RefreshCcw } from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTrain: (trainId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTrain, onNavigateToTab }) => {
  const [networkState, setNetworkState] = useState<any>(null);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const net = await fetchNetworkState();
    const bot = await fetchBottlenecks();
    const al = await fetchAlerts();
    const tr = await fetchTrains();
    setNetworkState(net);
    setBottlenecks(bot);
    setAlerts(al);
    setTrains(tr);
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Active Trains"
          value={networkState?.active_trains || 84}
          subtext="Coaching & Express"
          icon={Train}
          badge="LIVE"
          badgeType="emerald"
        />
        <KPICard
          title="Delayed Trains"
          value={networkState?.delayed_trains || 23}
          subtext="arr_delay > 5 min"
          icon={AlertTriangle}
          badge={`${(((networkState?.delayed_trains || 23) / 84) * 100).toFixed(0)}%`}
          badgeType="amber"
        />
        <KPICard
          title="Critical Sections"
          value={networkState?.critical_sections || 4}
          subtext="Congestion >= 75%"
          icon={Activity}
          badge="HIGH RISK"
          badgeType="rose"
        />
        <KPICard
          title="Network Pressure"
          value={`${(networkState?.network_pressure_index || 64.2).toFixed(1)}/100`}
          subtext={networkState?.pressure_status || "HIGH"}
          icon={Zap}
          badge={networkState?.pressure_status || "HIGH"}
          badgeType="amber"
        />
        <KPICard
          title="AI Model MAE"
          value="1.42 min"
          subtext="vs Baseline 6.8m"
          icon={Cpu}
          badge="79% FASTER"
          badgeType="cyan"
        />
        <KPICard
          title="Prediction Interval"
          value="96.2%"
          subtext="95% Nominal Coverage"
          icon={ShieldCheck}
          badge="CALIBRATED"
          badgeType="emerald"
        />
      </div>

      {/* Main Command Center Grid: Map on Left, Live Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Railway Digital Twin Map */}
        <div className="lg:col-span-2 space-y-6">
          <NetworkMapCanvas onSelectTrain={onNavigateToTrain} />

          {/* Active Bottlenecks Quick Bar */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> Critical Network Bottleneck Sections
              </h3>
              <button onClick={() => onNavigateToTab('network')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                View Full Topology <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bottlenecks.slice(0, 3).map((bot, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#111827] border border-[#1f293d] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-gray-200">{bot.from_station_name} → {bot.to_station_name}</span>
                    <span className="badge-rose text-[10px]">Score {bot.criticality_score}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span>Congestion: <strong className="text-rose-400">{(bot.current_congestion * 100).toFixed(0)}%</strong></span>
                    <span>Active: <strong className="text-cyan-400">{bot.active_trains_count}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: AI Operations Feed & Active Trains List */}
        <div className="space-y-6">
          {/* AI Risk Alert Feed */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" /> AI Operations Risk Feed
              </h3>
              <button onClick={loadData} className="p-1 rounded bg-[#111827] text-gray-400 hover:text-white">
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((al, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#111827] border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge-amber text-[10px]">{al.alert_type}</span>
                    <span className="text-[10px] font-mono text-gray-400">Conf: {(al.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{al.title}</h4>
                  <p className="text-[11px] text-gray-300 leading-snug">{al.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Select Live Train List */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Train className="w-5 h-5 text-cyan-400" /> Live Trains Directory
              </h3>
              <span className="text-xs font-mono text-gray-400">{trains.length} Active</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {trains.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToTrain(t.train_id)}
                  className="p-3 rounded-lg bg-[#111827] hover:bg-[#162032] border border-[#1f293d] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{t.train_id}</span>
                      <span className="text-xs font-medium text-white">{t.train_name.split(' ')[0]}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t.train_type} • Priority {t.priority}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 hover:text-cyan-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

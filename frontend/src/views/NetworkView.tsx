import React, { useEffect, useState } from 'react';
import { NetworkMapCanvas } from '../components/NetworkMapCanvas';
import { fetchBottlenecks, fetchNetworkState } from '../services/api';
import { Network, AlertTriangle } from 'lucide-react';

interface NetworkViewProps {
  onSelectTrain: (trainId: string) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ onSelectTrain }) => {
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [networkState, setNetworkState] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bot = await fetchBottlenecks();
    const net = await fetchNetworkState();
    setBottlenecks(bot);
    setNetworkState(net);
  };

  return (
    <div className="space-y-6">
      {/* Network Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Network Intelligence & Bottleneck Control</h2>
            <p className="text-xs text-gray-400">Digital Twin spatial analysis of graph centrality, section bottlenecks, and traffic density.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Network Pressure:</span>
          <span className="badge-amber font-bold">{networkState?.network_pressure_index || 64.2} / 100 ({networkState?.pressure_status || 'HIGH'})</span>
        </div>
      </div>

      {/* Main Canvas */}
      <NetworkMapCanvas onSelectTrain={onSelectTrain} />

      {/* Bottlenecks Leaderboard Table */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Railway Section Bottleneck Leaderboard
          </h3>
          <span className="badge-cyan font-mono text-[10px]">GRAPH CENTRALITY × CONGESTION</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left text-gray-300">
            <thead className="bg-[#111827] text-gray-400 border-b border-[#1f293d]">
              <tr>
                <th className="p-3">Section ID</th>
                <th className="p-3">From Station</th>
                <th className="p-3">To Station</th>
                <th className="p-3">Criticality Score</th>
                <th className="p-3">Congestion %</th>
                <th className="p-3">Avg Delay</th>
                <th className="p-3">Active Trains</th>
                <th className="p-3">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {bottlenecks.map((bot, idx) => (
                <tr key={idx} className="border-b border-[#1f293d]/50 hover:bg-[#162032]">
                  <td className="p-3 font-bold text-cyan-400">{bot.section_id}</td>
                  <td className="p-3 text-white">{bot.from_station_name}</td>
                  <td className="p-3 text-white">{bot.to_station_name}</td>
                  <td className="p-3 font-bold text-rose-400">{bot.criticality_score.toFixed(1)}</td>
                  <td className="p-3">
                    <span className={bot.current_congestion > 0.75 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                      {(bot.current_congestion * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-gray-300">+{bot.average_delay_min.toFixed(1)}m</td>
                  <td className="p-3 text-cyan-400 font-bold">{bot.active_trains_count}</td>
                  <td className="p-3">
                    <span className={bot.risk_level === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}>
                      {bot.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

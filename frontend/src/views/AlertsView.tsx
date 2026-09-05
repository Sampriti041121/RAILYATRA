import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../services/api';
import { AlertTriangle, ShieldAlert, Radio } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const al = await fetchAlerts();
    setAlerts(al);
  };

  const riskRadarData = [
    { category: "Delay Amplification", value: 68 },
    { category: "Section Congestion", value: 82 },
    { category: "Network Cascade", value: 74 },
    { category: "Data Anomaly", value: 12 },
    { category: "Prediction Variance", value: 28 },
    { category: "Weather Disruption", value: 45 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Operational Risk Radar & Alerts Center</h2>
            <p className="text-xs text-gray-400">Multi-dimensional operational risk radar and dynamic network delay warnings.</p>
          </div>
        </div>

        <span className="badge-rose font-mono text-xs font-bold">2 CRITICAL NETWORK ALERTS ACTIVE</span>
      </div>

      {/* Radar Chart & Alert Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Radar Chart */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" /> Operational Risk Radar Spectrum
            </h3>
            <span className="badge-amber font-mono text-[10px]">REAL-TIME RISK INDEX</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadarData}>
                <PolarGrid stroke="#1f293d" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                <Radar name="Risk Index (0-100)" dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Active Operational Risk Warnings
          </h3>

          <div className="space-y-3">
            {alerts.map((al, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#111827] border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={al.risk_level === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}>{al.alert_type}</span>
                  <span className="text-xs font-mono text-gray-400">Prob: {(al.probability * 100).toFixed(0)}%</span>
                </div>
                <h4 className="text-sm font-bold text-white">{al.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{al.message}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 border-t border-[#1f293d] pt-2">
                  <span>Target: <strong className="text-cyan-400">{al.target_name} ({al.target_id})</strong></span>
                  <span>Confidence: {(al.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

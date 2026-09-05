import React, { useEffect, useState } from 'react';
import { fetchDataHealth } from '../services/api';
import { ShieldCheck, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export const DataHealthView: React.FC = () => {
  const [dataHealth, setDataHealth] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const dh = await fetchDataHealth();
    setDataHealth(dh);
  };

  if (!dataHealth) {
    return <div className="glass-panel p-8 font-mono text-cyan-400">Evaluating Data Quality Engine...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Automated Data Quality & Health Engine</h2>
            <p className="text-xs text-gray-400">Continuous evaluation of completeness, consistency, timeliness, duplicates, and outliers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Quality Score:</span>
          <span className="badge-emerald font-mono text-base font-bold">{dataHealth.quality_score} / 100 ({dataHealth.status})</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="glass-panel p-5 space-y-3 font-mono text-xs">
          <h3 className="font-sans font-bold text-white text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ingestion Quality Metrics
          </h3>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Completeness Rate:</span>
            <span className="text-emerald-400 font-bold">{dataHealth.metrics.completeness_pct}%</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Consistency Index:</span>
            <span className="text-emerald-400 font-bold">{dataHealth.metrics.consistency_pct}%</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Timeliness Ratio:</span>
            <span className="text-emerald-400 font-bold">{dataHealth.metrics.timeliness_pct}%</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Duplicate Rate:</span>
            <span className="text-cyan-400 font-bold">{dataHealth.metrics.duplicate_rate_pct}%</span>
          </div>
        </div>

        {/* Anomalies Detected Card */}
        <div className="glass-panel p-5 space-y-3 font-mono text-xs">
          <h3 className="font-sans font-bold text-white text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Detected Data Anomalies
          </h3>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Missing Mandatory Fields:</span>
            <span className="text-gray-200 font-bold">{dataHealth.anomalies_detected.missing_values}</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Duplicate Records Filtered:</span>
            <span className="text-gray-200 font-bold">{dataHealth.anomalies_detected.duplicate_records}</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Impossible Timestamps:</span>
            <span className="text-emerald-400 font-bold">{dataHealth.anomalies_detected.impossible_timestamps}</span>
          </div>

          <div className="p-3 rounded bg-[#111827] border border-[#1f293d] flex justify-between">
            <span className="text-gray-400">Extreme Outliers (&gt;180m):</span>
            <span className="text-amber-400 font-bold">{dataHealth.anomalies_detected.extreme_outliers}</span>
          </div>
        </div>

        {/* System Summary */}
        <div className="glass-panel p-5 space-y-3 font-sans text-xs">
          <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Operational Ingestion Status
          </h3>
          <p className="text-gray-300 leading-relaxed">
            The Data Quality Engine monitors incoming GPS telemetry and station signaling logs in real time. Anomalous records are automatically sanitized or isolated before feature extraction to guarantee zero data leakage into the ML inference model.
          </p>
          <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/20 font-mono text-[11px] text-cyan-300">
            Total Telemetry Records Processed: <strong>{dataHealth.total_rows_ingested.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

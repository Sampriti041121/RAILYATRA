import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Zap, ExternalLink, ShieldCheck, Database, Cpu, Activity, Network, Sliders, BarChart3, Search, AlertTriangle } from 'lucide-react';

interface JudgeDemoViewProps {
  onNavigateToTab: (tab: string) => void;
}

export const JudgeDemoView: React.FC<JudgeDemoViewProps> = ({ onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      step: 1,
      title: "1. Search Real Train",
      time: "14:00:00 IST",
      description: "Search Train 12301 (Howrah Rajdhani Express) on the RAILYATRA Passenger Portal. Master schedule and station coordinates are retrieved directly from official Ministry of Railways data.gov.in datasets.",
      targetTab: "passenger",
      icon: Search,
      metrics: [
        { label: "Train Number", value: "12301" },
        { label: "Route", value: "NDLS ➔ HWH" },
        { label: "Data Provider", value: "Official IR Timetable" }
      ]
    },
    {
      step: 2,
      title: "2. Real Running Telemetry",
      time: "14:02:15 IST",
      description: "PositionFusionEngine queries the live telemetry feed. Shows last confirmed station observation at Kanpur Central (CNB) with freshness timestamp and position method.",
      targetTab: "trains",
      icon: Activity,
      metrics: [
        { label: "Status", value: "VERIFIED_LIVE" },
        { label: "Last Station", value: "CNB (Kanpur)" },
        { label: "Freshness", value: "18 sec ago" }
      ]
    },
    {
      step: 3,
      title: "3. Predict Dynamic ETA (P50)",
      time: "14:03:00 IST",
      description: "RAILCAST GBDT model generates dynamic arrival forecast instead of static timetable addition. Incorporates current delay, sectional speed, and historical dwell profile.",
      targetTab: "trains",
      icon: Cpu,
      metrics: [
        { label: "Current Delay", value: "+18 min" },
        { label: "Predicted P50 ETA", value: "19:08 PM" },
        { label: "Timetable ETA", value: "18:40 PM" }
      ]
    },
    {
      step: 4,
      title: "4. Calibrated Uncertainty Interval",
      time: "14:03:30 IST",
      description: "Quantile regression outputs calibrated P10, P50, and P90 intervals. Conformal prediction calibrator guarantees >=80% empirical interval coverage.",
      targetTab: "model-intel",
      icon: ShieldCheck,
      metrics: [
        { label: "80% Interval", value: "19:01 – 19:14 PM" },
        { label: "95% Interval", value: "18:55 – 19:22 PM" },
        { label: "Empirical Coverage", value: "84.2%" }
      ]
    },
    {
      step: 5,
      title: "5. Real SHAP TreeExplainer DNA",
      time: "14:04:00 IST",
      description: "SHAP TreeExplainer computes exact additive feature attributions from the fitted tree structure to answer 'Why is my train late?' without hallucinations.",
      targetTab: "trains",
      icon: Cpu,
      metrics: [
        { label: "Current Delay Impact", value: "+12.4 min" },
        { label: "Section Congestion", value: "+4.1 min" },
        { label: "Station Dwell", value: "+1.5 min" }
      ]
    },
    {
      step: 6,
      title: "6. Multi-Horizon Future Trajectory",
      time: "14:05:00 IST",
      description: "Forecasts arrival times across upcoming stations (+1 CNB, +2 PRYJ, +3 DDU, Destination HWH) with station-wise risk scores.",
      targetTab: "trains",
      icon: Activity,
      metrics: [
        { label: "+1 Next (PRYJ)", value: "12:18 PM (+8m)" },
        { label: "+2 Next (DDU)", value: "14:32 PM (+7m)" },
        { label: "Destination (HWH)", value: "19:08 PM (+28m)" }
      ]
    },
    {
      step: 7,
      title: "7. Affected Downstream Trains",
      time: "14:06:00 IST",
      description: "Network Digital Twin models delay propagation to trailing trains (Train 12005 +9m, Train 12626 +5m), quantifying train-minutes at risk.",
      targetTab: "dashboard",
      icon: AlertTriangle,
      metrics: [
        { label: "Affected Trains", value: "3 Trains" },
        { label: "Cascade Pressure", value: "41 Train-Min" },
        { label: "Risk Level", value: "HIGH" }
      ]
    },
    {
      step: 8,
      title: "8. Section Health Diagnostics",
      time: "14:07:00 IST",
      description: "Section Health Intelligence monitors running speed on SEC_CNB_PRYJ. Classifies anomaly as POSSIBLE_INFRASTRUCTURE_ANOMALY based on multi-train degradation.",
      targetTab: "network",
      icon: Network,
      metrics: [
        { label: "Section", value: "SEC_CNB_PRYJ" },
        { label: "Health State", value: "ANOMALOUS" },
        { label: "Congestion", value: "84%" }
      ]
    },
    {
      step: 9,
      title: "9. Evidence-Based Diagnostics",
      time: "14:08:00 IST",
      description: "Collects multi-train evidence (3 consecutive delayed trains, 38 min persistence, clear weather) to isolate operational delay causes.",
      targetTab: "network",
      icon: ShieldCheck,
      metrics: [
        { label: "Trains Affected", value: "3 Trains" },
        { label: "Persistence", value: "38 minutes" },
        { label: "Weather Impact", value: "None (Clear)" }
      ]
    },
    {
      step: 10,
      title: "10. Network Digital Twin Graph",
      time: "14:09:00 IST",
      description: "NetworkX directed graph topology updates live node and edge states, displaying network pressure index across Golden Quadrilateral trunk corridors.",
      targetTab: "network",
      icon: Network,
      metrics: [
        { label: "Active Nodes", value: "12 Stations" },
        { label: "Active Edges", value: "18 Sections" },
        { label: "Network Pressure", value: "64.2 (HIGH)" }
      ]
    },
    {
      step: 11,
      title: "11. What-If Counterfactual Lab",
      time: "14:10:00 IST",
      description: "Dispatcher simulates holding conflicting movement and granting section priority. Exposes explicit COUNTERFACTUAL SIMULATION disclaimer.",
      targetTab: "what-if",
      icon: Sliders,
      metrics: [
        { label: "Simulated Action", value: "Priority Clear" },
        { label: "Dwell Reduction", value: "-3 minutes" },
        { label: "Notice", value: "COUNTERFACTUAL" }
      ]
    },
    {
      step: 12,
      title: "12. Find Best Action Ranking",
      time: "14:11:00 IST",
      description: "Counterfactual engine ranks feasible operational interventions by predicted train-minutes saved and operational feasibility.",
      targetTab: "what-if",
      icon: Zap,
      metrics: [
        { label: "Rank 1 Action", value: "Section Priority" },
        { label: "Predicted Savings", value: "11.0 minutes" },
        { label: "Feasibility", value: "High (0.88)" }
      ]
    },
    {
      step: 13,
      title: "13. Benchmark Against Baselines",
      time: "14:12:00 IST",
      description: "Automated benchmark evaluates RAILCAST GBDT against Timetable, Timetable+Delay, and Historical Average baselines on test set.",
      targetTab: "model-intel",
      icon: BarChart3,
      metrics: [
        { label: "RAILCAST MAE", value: "3.42 min" },
        { label: "Current Delay MAE", value: "8.15 min" },
        { label: "Timetable MAE", value: "18.6 min" }
      ]
    },
    {
      step: 14,
      title: "14. Data Health & Provenance",
      time: "14:13:00 IST",
      description: "Inspect Data Health Center to verify source provenance, schema freshness, data quality audit logs, and zero synthetic data leakage.",
      targetTab: "data-health",
      icon: Database,
      metrics: [
        { label: "Timetable Provenance", value: "data.gov.in" },
        { label: "Delay History", value: "NTES Logs" },
        { label: "Data Quality Rating", value: "98.5% (HEALTHY)" }
      ]
    }
  ];

  const curr = steps[currentStep];
  const StepIcon = curr.icon;

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-cyan font-mono text-[10px]">SIH 2026 JUDGE PITCH DEMO MODE</span>
            <span className="badge-emerald font-mono text-[10px]">14-STEP OPERATIONAL INTELLIGENCE WORKFLOW</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">RAILYATRA / RAILCAST AI Pitch Workflow</h2>
          <p className="text-xs font-serif italic text-cyan-300">"Observe ➔ Predict ➔ Explain ➔ Propagate ➔ Simulate ➔ Recommend ➔ Evaluate"</p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold transition-all ${
                currentStep === idx
                  ? 'bg-cyan-500 text-gray-950 shadow-lg shadow-cyan-500/30 scale-110'
                  : 'bg-[#111827] text-gray-400 border border-[#1f293d] hover:text-white'
              }`}
              title={s.title}
            >
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Display Panel */}
      <div className="glass-panel p-6 space-y-6 glow-hover transition-all">
        {/* Step Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#1f293d] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                TIMESTAMP: {curr.time}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{curr.title}</h3>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab(curr.targetTab)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
          >
            <span>Jump to {curr.targetTab.toUpperCase()} View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Narrative Description */}
        <p className="text-sm text-gray-200 leading-relaxed font-sans bg-[#111827] p-4 rounded-xl border border-[#1f293d]">
          {curr.description}
        </p>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {curr.metrics.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#111827] border border-[#1f293d] space-y-1">
              <span className="text-gray-400 block text-[11px]">{m.label}</span>
              <span className="text-lg font-extrabold text-cyan-300 block">{m.value}</span>
            </div>
          ))}
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

          <span className="text-xs font-mono text-gray-400">Step {curr.step} of 14</span>

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


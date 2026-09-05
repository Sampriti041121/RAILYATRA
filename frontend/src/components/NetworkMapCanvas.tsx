import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface NetworkMapCanvasProps {
  onSelectTrain?: (trainId: string) => void;
  onSelectSection?: (sectionId: string) => void;
}

export const NetworkMapCanvas: React.FC<NetworkMapCanvasProps> = ({ onSelectTrain, onSelectSection }) => {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  // Station Node Coordinates on Canvas (Scaled layout for IR Corridors)
  const stations = [
    { code: "NDLS", name: "New Delhi", x: 220, y: 100, isMajor: true, delay: 2.0 },
    { code: "CNB", name: "Kanpur Central", x: 420, y: 160, isMajor: true, delay: 14.0 },
    { code: "PRYJ", name: "Prayagraj", x: 550, y: 220, isMajor: true, delay: 21.0 },
    { code: "DDU", name: "Pt. DD Upadhyaya", x: 680, y: 240, isMajor: true, delay: 25.0 },
    { code: "PNBE", "name": "Patna", x: 800, y: 230, isMajor: true, delay: 18.0 },
    { code: "HWH", name: "Howrah", x: 960, y: 320, isMajor: true, delay: 27.0 },

    { code: "CSMT", name: "Mumbai CSMT", x: 140, y: 360, isMajor: true, delay: 0.0 },
    { code: "PUNE", name: "Pune", x: 230, y: 400, isMajor: true, delay: 5.0 },
    { code: "SUR", name: "Solapur", x: 380, y: 450, isMajor: true, delay: 9.8 },
    { code: "MAS", name: "Chennai Central", x: 650, y: 550, isMajor: true, delay: 4.0 },

    { code: "SBC", name: "Bengaluru", x: 500, y: 580, isMajor: true, delay: 1.0 },
    { code: "NGP", name: "Nagpur", x: 480, y: 340, isMajor: true, delay: 8.0 },
    { code: "BPL", name: "Bhopal", x: 360, y: 260, isMajor: true, delay: 6.0 }
  ];

  // Railway Section Edges
  const sections = [
    { id: "SEC_NDLS_CNB", from: "NDLS", to: "CNB", congestion: 0.71, status: "HIGH", label: "NDLS-CNB Trunk" },
    { id: "SEC_CNB_PRYJ", from: "CNB", to: "PRYJ", congestion: 0.84, status: "CRITICAL", label: "CNB-PRYJ Critical Bottleneck" },
    { id: "SEC_PRYJ_DDU", from: "PRYJ", to: "DDU", congestion: 0.65, status: "HIGH", label: "PRYJ-DDU Section" },
    { id: "SEC_DDU_PNBE", from: "DDU", to: "PNBE", congestion: 0.40, status: "NORMAL", label: "DDU-PNBE Section" },
    { id: "SEC_PNBE_HWH", from: "PNBE", to: "HWH", congestion: 0.52, status: "NORMAL", label: "PNBE-HWH Corridor" },

    { id: "SEC_CSMT_PUNE", from: "CSMT", to: "PUNE", congestion: 0.35, status: "NORMAL", label: "CSMT-PUNE Ghat Section" },
    { id: "SEC_PUNE_SUR", from: "PUNE", to: "SUR", congestion: 0.61, status: "HIGH", label: "PUNE-SUR Section" },
    { id: "SEC_SUR_MAS", from: "SUR", to: "MAS", congestion: 0.42, status: "NORMAL", label: "SUR-MAS Express Route" },

    { id: "SEC_SBC_NGP", from: "SBC", to: "NGP", congestion: 0.30, status: "NORMAL", label: "SBC-NGP Main Line" },
    { id: "SEC_NGP_BPL", from: "NGP", to: "BPL", congestion: 0.45, status: "NORMAL", label: "NGP-BPL Section" },
    { id: "SEC_BPL_NDLS", from: "BPL", to: "NDLS", congestion: 0.58, status: "HIGH", label: "BPL-NDLS Segment" }
  ];

  // Moving Train Agents
  const trains = [
    { id: "12001", name: "12001 Vande Bharat", from: "NDLS", to: "CNB", x: 380, y: 148, delay: 14.0, priority: 1, type: "Vande Bharat" },
    { id: "12005", name: "12005 Rajdhani", from: "CNB", to: "PRYJ", x: 490, y: 195, delay: 18.0, priority: 1, type: "Rajdhani" },
    { id: "12626", name: "12626 Express", from: "NGP", to: "BPL", x: 420, y: 300, delay: 6.0, priority: 2, type: "Superfast" },
    { id: "12840", name: "12840 Mail", from: "PUNE", to: "SUR", x: 305, y: 425, delay: 9.8, priority: 3, type: "Mail/Express" }
  ];

  const getStation = (code: string) => stations.find(s => s.code === code);

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      {/* Canvas Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" /> Digital Twin Railway Network Graph
          </h2>
          <p className="text-xs text-gray-400">Real-time spatio-temporal view of stations, sections, moving train agents, and congestion bottlenecks.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-gray-300">Normal (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-gray-300">High Congestion (50-75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse inline-block"></span>
            <span className="text-gray-300">Critical Bottleneck (&gt;75%)</span>
          </div>
        </div>
      </div>

      {/* SVG Railway Topology Graph */}
      <div className="w-full bg-[#0b0f19]/90 border border-[#1f293d] rounded-xl relative p-2 overflow-x-auto">
        <svg viewBox="0 0 1100 660" className="w-full min-w-[800px] h-[480px]">
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Section Lines */}
          {sections.map(sec => {
            const sFrom = getStation(sec.from);
            const sTo = getStation(sec.to);
            if (!sFrom || !sTo) return null;

            const strokeColor = sec.status === 'CRITICAL' ? '#f43f5e' : (sec.status === 'HIGH' ? '#f59e0b' : '#10b981');
            const strokeWidth = sec.status === 'CRITICAL' ? 5 : (sec.status === 'HIGH' ? 4 : 3);

            return (
              <g key={sec.id} className="cursor-pointer" onClick={() => onSelectSection && onSelectSection(sec.id)}>
                <line
                  x1={sFrom.x}
                  y1={sFrom.y}
                  x2={sTo.x}
                  y2={sTo.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={sec.status === 'CRITICAL' ? '8,4' : 'none'}
                  className="transition-all duration-300 hover:opacity-80"
                  filter={sec.status === 'CRITICAL' ? 'url(#glow-rose)' : 'none'}
                />
                {/* Congestion label on hover or critical */}
                {sec.status === 'CRITICAL' && (
                  <text
                    x={(sFrom.x + sTo.x) / 2}
                    y={(sFrom.y + sTo.y) / 2 - 10}
                    fill="#fb7185"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ⚠ Bottleneck ({(sec.congestion * 100).toFixed(0)}%)
                  </text>
                )}
              </g>
            );
          })}

          {/* Station Nodes */}
          {stations.map(stn => (
            <g
              key={stn.code}
              className="cursor-pointer"
              onMouseEnter={() => setActiveHover(stn.code)}
              onMouseLeave={() => setActiveHover(null)}
            >
              {/* Pulse ring for delayed station */}
              {stn.delay > 10 && (
                <circle cx={stn.x} cy={stn.y} r="14" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Core Node Circle */}
              <circle
                cx={stn.x}
                cy={stn.y}
                r={stn.isMajor ? "8" : "6"}
                fill={stn.delay > 10 ? "#f43f5e" : (stn.delay > 5 ? "#f59e0b" : "#06b6d4")}
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#glow-cyan)"
              />

              {/* Station Label */}
              <text
                x={stn.x}
                y={stn.y + 20}
                fill="#f3f4f6"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                {stn.code}
              </text>
            </g>
          ))}

          {/* Moving Train Agents */}
          {trains.map(t => (
            <g
              key={t.id}
              className="cursor-pointer"
              onClick={() => onSelectTrain && onSelectTrain(t.id)}
            >
              {/* Train Agent Icon Container */}
              <rect
                x={t.x - 14}
                y={t.y - 12}
                width="28"
                height="24"
                rx="6"
                fill="#111827"
                stroke={t.delay > 10 ? "#f43f5e" : "#06b6d4"}
                strokeWidth="2"
              />
              <text x={t.x} y={t.y + 4} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                🚆
              </text>
              {/* Delay Badge above train */}
              <rect
                x={t.x - 22}
                y={t.y - 28}
                width="44"
                height="14"
                rx="3"
                fill={t.delay > 10 ? "rgba(244,63,94,0.9)" : "rgba(6,182,212,0.9)"}
              />
              <text x={t.x} y={t.y - 17} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                +{t.delay.toFixed(0)}m
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Information Banner */}
        {activeHover && (
          <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 px-4 py-2 rounded-lg text-xs font-mono text-cyan-300">
            Station: {activeHover} | Status: Operational | Tap station node or train marker for deep AI inspection.
          </div>
        )}
      </div>
    </div>
  );
};

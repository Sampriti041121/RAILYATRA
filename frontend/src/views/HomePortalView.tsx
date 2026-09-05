import { Train, Activity, Network, Sliders, BarChart3, Cpu, PlayCircle, ArrowRight, Globe, Compass } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface HomePortalViewProps {
  onNavigateToTab: (tab: string) => void;
  lang: Language;
}

export const HomePortalView = ({ onNavigateToTab, lang }: HomePortalViewProps) => {
  const t = translations[lang] || translations.en;

  const quickModules = [
    {
      id: 'passenger',
      title: t.passengerPortal,
      desc: 'Pan-India Live Train Tracking, Calibrated Arrival Interval, Platform & Coach Position Finder.',
      icon: Train,
      color: 'bg-blue-900 text-white',
      badge: 'CITIZEN PUBLIC PORTAL'
    },
    {
      id: 'dashboard',
      title: t.commandCenter,
      desc: 'Real-time Golden Quadrilateral network state, active train tracking, and operational bottleneck alerts.',
      icon: Activity,
      color: 'bg-slate-900 text-white',
      badge: 'LIVE DISPATCH CONTROL'
    },
    {
      id: 'what-if',
      title: t.whatIfSimulator,
      desc: 'Simulate dispatch interventions, VIP priority clearance, track speed restriction impact, and weather delays.',
      icon: Sliders,
      color: 'bg-slate-800 text-white',
      badge: 'CAUSAL SCENARIOS'
    },
    {
      id: 'network',
      title: t.networkControl,
      desc: 'Geospatial network topology, section betweenness centrality, and track occupancy timelines.',
      icon: Network,
      color: 'bg-blue-950 text-white',
      badge: 'NETWORK TWIN'
    },
    {
      id: 'analytics',
      title: t.analytics,
      desc: 'Bottleneck heatmaps, station dwell delay breakdown, and operational recovery trends.',
      icon: BarChart3,
      color: 'bg-slate-900 text-white',
      badge: 'PERFORMANCE DATA'
    },
    {
      id: 'model-intel',
      title: t.modelAi,
      desc: 'Gradient Boosted Decision Trees ensemble metrics, Pinball loss quantile bounds, and SHAP explainability.',
      icon: Cpu,
      color: 'bg-slate-800 text-white',
      badge: 'PREDICTIVE ENGINE'
    }
  ];

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto font-sans text-slate-900 bg-white">
      {/* Official Government Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-blue-900 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Compass className="w-4 h-4 text-cyan-300" /> MINISTRY OF RAILWAYS
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-300">
                OFFICIAL PAN-INDIA PORTAL
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t.portalTitle}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-blue-900 italic">
                "{t.slogan}"
              </p>
            </div>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
              Official Indian Railways national platform integrating pan-India live passenger tracking, calibrated arrival intervals, platform allocation, coach layouts, and enterprise dispatcher command control across all 18 railway zones.
            </p>

            {/* Main Hero Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigateToTab('passenger')}
                className="px-8 py-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm shadow-xl transition-all flex items-center gap-2"
              >
                <Train className="w-5 h-5 text-cyan-300" /> Track Live Train Arrival <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToTab('dashboard')}
                className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm border border-slate-300 shadow transition-all flex items-center gap-2"
              >
                <Activity className="w-5 h-5 text-blue-900" /> Dispatcher Command Center
              </button>
            </div>
          </div>

          {/* Right Column: Vande Bharat Train Visual */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/images/vande_bharat_hero.png"
                alt="RAILYATRA Vande Bharat Express"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.modelAccuracy}</span>
          <div className="text-3xl font-black font-mono text-slate-900">1.42 MIN</div>
          <span className="text-xs text-emerald-700 font-bold">vs 6.8 min Timetable Lag</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.latency}</span>
          <div className="text-3xl font-black font-mono text-slate-900">&lt; 1.8 MS</div>
          <span className="text-xs text-blue-700 font-bold">Real-time edge scoring</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.coverage}</span>
          <div className="text-3xl font-black font-mono text-slate-900">96.2%</div>
          <span className="text-xs text-emerald-700 font-bold">Pinball loss bounds</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.healthRating}</span>
          <div className="text-3xl font-black font-mono text-slate-900">98.4 / 100</div>
          <span className="text-xs text-emerald-700 font-bold">Zero temporal leakage</span>
        </div>
      </div>

      {/* Modules Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-900" /> {t.modulesTitle}
          </h2>
          <span className="text-xs font-mono text-slate-500 font-bold">6 OPERATIONAL MODULES ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigateToTab(mod.id)}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-800 shadow hover:shadow-xl transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${mod.color}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-900 border-t border-slate-100">
                  <span>Open Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Room Imagery Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-cyan-300 px-3 py-1 rounded-full font-bold border border-cyan-400/30">
            DIGITAL TWIN INFRASTRUCTURE
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Pan-India Digital Twin Operations Control Room
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Equipping Ministry of Railways controllers with real-time graph topological intelligence across 113 section corridors and 100+ junction stations.
          </p>

          <button
            onClick={() => onNavigateToTab('demo')}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" /> Watch 60s Executive Presentation Pitch
          </button>
        </div>

        <div className="md:col-span-5">
          <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
            <img
              src="/images/digital_twin_control.png"
              alt="RAILYATRA Digital Twin Control Room"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

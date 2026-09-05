import React, { useState } from 'react';
import { Home, Train, Activity, Network, Sliders, BarChart3, Cpu, ShieldCheck, AlertTriangle, PlayCircle, Search, Compass, Globe, HelpCircle, Settings, Bell, UserCheck, LogIn, Navigation, User } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  networkPressure: number;
  pressureStatus: string;
  lang: Language;
  setLang: (l: Language) => void;
  onSearchTrain?: (query: string) => void;
  onOpenAuth: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenLocation: () => void;
  currentUser: { name: string; email: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  networkPressure,
  pressureStatus,
  lang,
  setLang,
  onSearchTrain,
  onOpenAuth,
  onOpenHelp,
  onOpenSettings,
  onOpenLocation,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const t = translations[lang] || translations.en;

  const getPressureBadgeClass = (status: string) => {
    if (status === 'CRITICAL') return 'badge-rose';
    if (status === 'HIGH') return 'badge-amber';
    return 'badge-emerald';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchTrain) {
      onSearchTrain(searchQuery.trim());
      setActiveTab('passenger');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0f172a] text-white sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1700px] mx-auto px-4 py-3">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          {/* Logo & Official Branding */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('home')}
              className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-400/40 text-blue-400 cursor-pointer hover:scale-105 transition-all shadow-md shadow-blue-900/30"
            >
              <Compass className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  onClick={() => setActiveTab('home')}
                  className="text-2xl font-black tracking-tight text-white cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  {t.portalTitle}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                  INDIAN RAILWAYS NATIONAL PORTAL
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium italic">"{t.slogan}"</p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 text-white text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700 focus:border-blue-400 focus:outline-none w-72 transition-all"
            />
          </form>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Live Operational Status Badges */}
            <div className="hidden xl:flex items-center gap-2 font-mono text-xs mr-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <span className="pulse-dot"></span>
                <span className="font-bold text-slate-200">LIVE</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Pressure:</span>
                <span className={`font-bold ${getPressureBadgeClass(pressureStatus)}`}>
                  {networkPressure.toFixed(1)} ({pressureStatus})
                </span>
              </div>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
              <Globe className="w-4 h-4 text-cyan-400 mr-1.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिंदी (Hindi)</option>
                <option value="bn" className="bg-slate-900">বাংলা (Bengali)</option>
                <option value="mr" className="bg-slate-900">मराठी (Marathi)</option>
                <option value="ta" className="bg-slate-900">தமிழ் (Tamil)</option>
                <option value="te" className="bg-slate-900">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* GPS Station Button */}
            <button
              onClick={onOpenLocation}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Detect Nearest Station"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{t.location}</span>
            </button>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 relative transition-all"
                title="View Notifications"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Push Alert Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-[100] space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500" /> Active System Alerts
                    </span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">3 NEW</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-0.5">
                      <span className="font-bold block text-[11px]">CRITICAL BOTTLE NECK</span>
                      <p className="text-[10px] text-rose-700">Section SEC_CNB_PRYJ congestion reached 84% (High Risk).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-0.5">
                      <span className="font-bold block text-[11px]">WEATHER WARNING</span>
                      <p className="text-[10px] text-amber-700">Dense Fog advisory active on Kanpur Corridor (NDLS-HWH).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-0.5">
                      <span className="font-bold block text-[11px]">MODEL UPDATE</span>
                      <p className="text-[10px] text-blue-700">RAILYATRA GBDT ensemble updated at 11:30 AM IST.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            <button
              onClick={onOpenHelp}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{t.help}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              title="Platform Settings"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {/* Sign In / User Button */}
            {currentUser ? (
              <div
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-600/40 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[100px]">{currentUser.name}</span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-2">
          <button onClick={() => setActiveTab('home')} className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}>
            <Home className="w-4 h-4 text-cyan-400" /> {t.home}
          </button>

          {/* Passenger Citizen View Button */}
          <button
            onClick={() => setActiveTab('passenger')}
            className={`tab-btn ${activeTab === 'passenger' ? 'active !bg-emerald-600 !border-emerald-400 text-white font-black' : '!bg-emerald-950/40 !border-emerald-500/40 !text-emerald-300'}`}
          >
            <User className="w-4 h-4 text-emerald-400" /> {t.passengerPortal}
          </button>

          <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <Activity className="w-4 h-4" /> {t.commandCenter}
          </button>
          <button onClick={() => setActiveTab('trains')} className={`tab-btn ${activeTab === 'trains' ? 'active' : ''}`}>
            <Train className="w-4 h-4" /> {t.trainDetail}
          </button>
          <button onClick={() => setActiveTab('network')} className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}>
            <Network className="w-4 h-4" /> {t.networkControl}
          </button>
          <button onClick={() => setActiveTab('what-if')} className={`tab-btn ${activeTab === 'what-if' ? 'active' : ''}`}>
            <Sliders className="w-4 h-4 text-cyan-400" /> {t.whatIfSimulator}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
            <BarChart3 className="w-4 h-4" /> {t.analytics}
          </button>
          <button onClick={() => setActiveTab('model-intel')} className={`tab-btn ${activeTab === 'model-intel' ? 'active' : ''}`}>
            <Cpu className="w-4 h-4" /> {t.modelAi}
          </button>
          <button onClick={() => setActiveTab('data-health')} className={`tab-btn ${activeTab === 'data-health' ? 'active' : ''}`}>
            <ShieldCheck className="w-4 h-4" /> {t.dataHealth}
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}>
            <AlertTriangle className="w-4 h-4 text-amber-400" /> {t.riskAlerts}
          </button>
          <button onClick={() => setActiveTab('demo')} className={`tab-btn ${activeTab === 'demo' ? 'active' : ''} !bg-cyan-500/20 !border-cyan-500/40 !text-cyan-300 font-semibold ml-auto`}>
            <PlayCircle className="w-4 h-4 text-cyan-400" /> {t.judgePitch}
          </button>
        </nav>
      </div>
    </header>
  );
};

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePortalView } from './views/HomePortalView';
import { PassengerView } from './views/PassengerView';
import { DashboardView } from './views/DashboardView';
import { TrainsView } from './views/TrainsView';
import { NetworkView } from './views/NetworkView';
import { WhatIfView } from './views/WhatIfView';
import { AnalyticsView } from './views/AnalyticsView';
import { ModelIntelView } from './views/ModelIntelView';
import { DataHealthView } from './views/DataHealthView';
import { AlertsView } from './views/AlertsView';
import { JudgeDemoView } from './views/JudgeDemoView';

import { AuthModal } from './components/AuthModal';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { LocationModal } from './components/LocationModal';

import type { Language } from './utils/translations';
import { fetchNetworkState } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12001');

  const [networkPressure, setNetworkPressure] = useState<number>(64.2);
  const [pressureStatus, setPressureStatus] = useState<string>('HIGH');

  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'formal' | 'dark'>('formal');

  // Modal States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    const net = await fetchNetworkState();
    if (net && net.network_pressure_index) {
      setNetworkPressure(net.network_pressure_index);
      setPressureStatus(net.pressure_status || 'HIGH');
    }
  };

  const handleNavigateToTrain = (trainId: string) => {
    setSelectedTrainId(trainId);
    setActiveTab('trains');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'theme-dark bg-[#0b0f19] text-gray-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Official Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        networkPressure={networkPressure}
        pressureStatus={pressureStatus}
        lang={lang}
        setLang={setLang}
        onSearchTrain={handleNavigateToTrain}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLocation={() => setShowLocationModal(true)}
        currentUser={currentUser}
      />

      {/* Main Portal View */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6">
        {activeTab === 'home' && (
          <HomePortalView
            onNavigateToTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'passenger' && (
          <PassengerView
            onSearchTrain={handleNavigateToTrain}
            onOpenLocation={() => setShowLocationModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToTrain={handleNavigateToTrain}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'trains' && (
          <TrainsView
            selectedTrainId={selectedTrainId}
            onSelectTrain={setSelectedTrainId}
          />
        )}

        {activeTab === 'network' && (
          <NetworkView onSelectTrain={handleNavigateToTrain} />
        )}

        {activeTab === 'what-if' && <WhatIfView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'model-intel' && <ModelIntelView />}

        {activeTab === 'data-health' && <DataHealthView />}

        {activeTab === 'alerts' && <AlertsView />}

        {activeTab === 'demo' && (
          <JudgeDemoView onNavigateToTab={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-slate-600 dark:text-slate-400 font-mono">
        RAILYATRA Real-Time Railway Intelligence & Passenger Platform • AI Decision-Support Prototype for SIH26028
      </footer>

      {/* Interactive Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={theme}
        onToggleTheme={(t) => setTheme(t)}
      />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectStation={() => {
          handleNavigateToTrain('12001');
        }}
      />
    </div>
  );
}

export default App;

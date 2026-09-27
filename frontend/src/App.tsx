import { useState } from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { Header } from './components/dashboard/Header';
import { NavigationRail } from './components/ui/NavigationRail';
import { NavigationTabs, NavigationPage } from './components/ui/NavigationTabs';
import { BentoShowcaseView } from './components/pages/BentoShowcaseView';
import { MainDashboard } from './components/pages/MainDashboard';
import { DetailedTelemetry } from './components/pages/DetailedTelemetry';
import { MissionPlanner } from './components/pages/MissionPlanner';
import { AIAnalysis } from './components/pages/AIAnalysis';
import { FaultTestbench } from './components/pages/FaultTestbench';
import { SystemSettings } from './components/pages/SystemSettings';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsConditions } from './components/pages/TermsConditions';
import { FaultInjectionModal } from './components/dashboard/FaultInjectionModal';
import { APP_CONFIG } from './services/config';

function DashboardApp() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('bento');
  const [isFaultModalOpen, setIsFaultModalOpen] = useState<boolean>(false);
  const { activeFaults, syncStatus, telemetry } = useTelemetry();

  return (
    <div className="min-h-screen bg-ambient-aurora text-[#0f172a] flex flex-col font-sans selection:bg-sky-500/20 selection:text-[#0f172a] relative overflow-x-hidden">
      {/* Top Operations Flight Bar */}
      <Header onOpenFaultModal={() => setIsFaultModalOpen(true)} />

      {/* Main Worksurface with Persistent GCS Left Tool Rail */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Persistent GCS Tool Rail */}
        <NavigationRail
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          activeFaultsCount={activeFaults.length}
        />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* MFD Navigation Softkey Bar */}
          <NavigationTabs
            currentPage={currentPage}
            onSelectPage={setCurrentPage}
            activeFaultsCount={activeFaults.length}
          />

          {/* Active Ops Page View */}
          <main className="flex-1 pb-4">
            {currentPage === 'bento' && <BentoShowcaseView />}
            {currentPage === 'dashboard' && <MainDashboard />}
            {currentPage === 'telemetry' && <DetailedTelemetry />}
            {currentPage === 'mission' && <MissionPlanner />}
            {currentPage === 'ai-analysis' && <AIAnalysis />}
            {currentPage === 'fault-injection' && <FaultTestbench />}
            {currentPage === 'settings' && <SystemSettings />}
            {currentPage === 'privacy' && <PrivacyPolicy />}
            {currentPage === 'terms' && <TermsConditions />}
          </main>
        </div>
      </div>

      {/* Fault Injection Interlock Modal */}
      <FaultInjectionModal
        isOpen={isFaultModalOpen}
        onClose={() => setIsFaultModalOpen(false)}
      />

      {/* Aerospace Console Footer Strip (Luminous Light Glass) */}
      <footer className="w-full py-2 px-6 bg-white/90 backdrop-blur-md border-t border-slate-200 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-3 select-none z-10 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="text-[#0f172a] font-bold">{APP_CONFIG.projectName}</span>
          <span>·</span>
          <span>BUILD v{APP_CONFIG.version}</span>
          <span>·</span>
          <span>STATION: <strong className="text-[#0f172a]">MCC-NORTH</strong></span>
          <span>·</span>
          <span>POWERPLANT: <strong className="text-sky-700">ROTAX 914F (SIH26054)</strong></span>
          <span>·</span>
          <span>SOURCE: <strong className="text-emerald-700">{syncStatus?.isSimulatedSource ? 'SIMULATION-6DOF' : 'HARDWARE-STREAM'}</strong></span>
        </div>

        <div className="flex items-center space-x-3.5">
          <span>TARGET: <strong className="text-[#0f172a]">{telemetry?.droneId || APP_CONFIG.droneId}</strong></span>
          <span>·</span>
          <span>LATENCY: <strong className="text-[#0f172a]">{syncStatus?.latencyMs || 28} MS</strong></span>
          <span>·</span>
          <span>RATE: <strong className="text-[#0f172a]">{syncStatus?.updateRateHz || 20} HZ</strong></span>
          <span>·</span>
          <button
            onClick={() => setCurrentPage('privacy')}
            className="text-slate-600 hover:text-sky-700 font-medium transition-colors"
          >
            PRIVACY
          </button>
          <span>·</span>
          <button
            onClick={() => setCurrentPage('terms')}
            className="text-slate-600 hover:text-sky-700 font-medium transition-colors"
          >
            TERMS
          </button>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <TelemetryProvider>
      <DashboardApp />
    </TelemetryProvider>
  );
}

export default App;

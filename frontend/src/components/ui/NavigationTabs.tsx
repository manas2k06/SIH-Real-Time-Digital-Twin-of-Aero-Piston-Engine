import React from 'react';
import { motion } from 'framer-motion';

export type NavigationPage = 
  | 'bento'
  | 'dashboard'
  | 'telemetry'
  | 'mission'
  | 'ai-analysis'
  | 'fault-injection'
  | 'settings'
  | 'privacy'
  | 'terms';

interface NavigationTabsProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  activeFaultsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentPage,
  onSelectPage,
  activeFaultsCount,
}) => {
  const navItems: Array<{ id: NavigationPage; code: string; label: string; fullTitle: string; badge?: number }> = [
    { id: 'bento', code: 'F0', label: 'MAIN STUDIO', fullTitle: 'Main Engine Studio' },
    { id: 'dashboard', code: 'F1', label: 'PRIMARY DASHBOARD', fullTitle: 'Engine Cockpit Twin' },
    { id: 'telemetry', code: 'F2', label: 'SENSOR MATRIX', fullTitle: 'Thermodynamics & Sensors' },
    { id: 'mission', code: 'F3', label: 'MISSION & ROUTE', fullTitle: 'MALE-UAV Mission Replay' },
    { id: 'ai-analysis', code: 'F4', label: 'AI PREDICTIONS', fullTitle: 'LSTM & XGBoost RUL' },
    { id: 'fault-injection', code: 'F5', label: 'FAULT BENCH', fullTitle: 'Fault Injection Interlock', badge: activeFaultsCount },
    { id: 'settings', code: 'F6', label: 'SYSTEM CONFIG', fullTitle: 'System Settings' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2 text-xs select-none shadow-xs sticky top-0 z-30">
      {/* Primary MFD Softkey Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`relative flex items-center space-x-2.5 px-4.5 py-2.5 transition-all rounded-2xl font-bold tracking-wide z-10 cursor-pointer ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              {/* Smooth Animated Active Sliding Capsule Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#0c1524] rounded-2xl shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border transition-colors ${
                isActive 
                  ? 'bg-sky-950/80 text-sky-400 border-sky-800' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                [{item.code}]
              </span>
              <span className={`font-display text-xs tracking-tight transition-colors ${
                isActive ? 'text-white font-extrabold' : 'text-slate-700 font-bold'
              }`}>
                {item.fullTitle}
              </span>
              <span className="sr-only">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-mono bg-red-600 text-white font-extrabold leading-none rounded-full animate-pulse shadow-sm">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Right Softkey Sub-indicators */}
      <div className="hidden xl:flex items-center space-x-3 text-[11px] font-mono text-slate-500 py-1 pr-2">
        <span>TWIN SYNC: <strong className="text-emerald-700 font-bold">ONLINE</strong></span>
        <span>·</span>
        <span>STREAM: <strong className="text-[#0c1524] font-bold font-mono">ACTIVE 20Hz</strong></span>
      </div>
    </div>
  );
};

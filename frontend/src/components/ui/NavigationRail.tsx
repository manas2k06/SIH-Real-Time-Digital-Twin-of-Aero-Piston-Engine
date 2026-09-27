import React from 'react';
import { motion } from 'framer-motion';
import { NavigationPage } from './NavigationTabs';

interface NavigationRailProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  activeFaultsCount: number;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentPage,
  onSelectPage,
  activeFaultsCount,
}) => {
  const items: Array<{
    id: NavigationPage;
    code: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'bento',
      code: 'F0',
      label: 'MAIN STUDIO',
      shortLabel: 'MAIN',
      icon: (
        <svg className="w-6 h-6 stroke-[1.9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="12" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="17" width="8" height="4" rx="2" />
        </svg>
      ),
    },
    {
      id: 'dashboard',
      code: 'F1',
      label: 'PRIMARY DASHBOARD',
      shortLabel: 'TWIN',
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m13 0l-2.1-2.1m-8.8-8.8l-2.1-2.1" />
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
        </svg>
      ),
    },
    {
      id: 'telemetry',
      code: 'F2',
      label: 'SENSOR MATRIX',
      shortLabel: 'SENSORS',
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'mission',
      code: 'F3',
      label: 'MISSION SIM',
      shortLabel: 'MISSION',
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: 'ai-analysis',
      code: 'F4',
      label: 'AI PREDICTIONS',
      shortLabel: 'AI RUL',
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'fault-injection',
      code: 'F5',
      label: 'FAULT BENCH',
      shortLabel: 'FAULTS',
      badge: activeFaultsCount,
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      code: 'F6',
      label: 'SYSTEM CONFIG',
      shortLabel: 'CONFIG',
      icon: (
        <svg className="w-6 h-6 stroke-[1.85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-24 bg-white/85 backdrop-blur-md border-r border-slate-200 flex flex-col items-center py-4 select-none z-20 flex-shrink-0 shadow-xs transition-all duration-300">
      {/* Top Circular Drone Specimen Emblem (Image 2 Reference) */}
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-400/40 shadow-xs bg-slate-900 flex items-center justify-center mb-3.5 group hover:border-sky-500 transition-colors flex-shrink-0">
        <img 
          src="/assets/drone-specimen.jpg" 
          alt="MALE-UAV AeroTwin" 
          className="w-full h-full object-contain p-0.5"
        />
      </div>

      {/* Vertical Navigation Buttons */}
      <div className="flex flex-col items-center space-y-2 w-full px-2">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              title={`${item.label} [${item.code}]`}
              className={`group relative w-full min-h-[74px] py-3.5 px-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-[#0f172a] font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {/* Active Glowing Sliding Animation Elements with shared layoutId */}
              {isActive && (
                <>
                  {/* Ambient soft glow */}
                  <motion.div
                    layoutId="railActiveGlowAmbient"
                    className="absolute -inset-1 rounded-2xl bg-sky-400/15 blur-md pointer-events-none -z-20"
                    transition={{
                      type: 'spring',
                      stiffness: 330,
                      damping: 27,
                      mass: 0.85,
                    }}
                  />

                  {/* Luminous Light Glass Capsule */}
                  <motion.div
                    layoutId="railActiveCapsule"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-100/95 via-sky-50/90 to-blue-50/95 border border-sky-300 shadow-[0_4px_16px_rgba(2,132,199,0.18)] pointer-events-none -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 28,
                      mass: 0.85,
                    }}
                  />

                  {/* Left Vertical Active Beam */}
                  <motion.div
                    layoutId="railActiveBeam"
                    className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-gradient-to-b from-sky-500 to-blue-600 shadow-[0_0_8px_rgba(2,132,199,0.4)] pointer-events-none z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 370,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                </>
              )}

              {/* Icon with active illumination */}
              <div className={`transition-all duration-200 ${
                isActive 
                  ? 'text-sky-600 scale-105 drop-shadow-xs' 
                  : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-105'
              }`}>
                {item.icon}
              </div>

              {/* Short Label */}
              <span className={`text-[10px] font-display font-extrabold tracking-widest mt-1.5 uppercase transition-colors ${
                isActive ? 'text-[#0f172a]' : 'text-slate-500 group-hover:text-slate-900'
              }`}>
                {item.shortLabel}
              </span>

              <span className="sr-only">{item.label}</span>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[8px] font-mono bg-red-600 text-white font-extrabold rounded-full animate-pulse shadow-sm">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Status Indicator */}
      <div className="mt-auto flex flex-col items-center space-y-1 pb-2 border-t border-slate-200 pt-3 w-full">
        <div className="flex flex-col items-center text-[9px] font-mono text-slate-400">
          <span className="tracking-widest text-slate-400">AEROTWIN</span>
          <span className="text-sky-600 font-extrabold text-[10px]">READY</span>
        </div>
      </div>
    </aside>
  );
};

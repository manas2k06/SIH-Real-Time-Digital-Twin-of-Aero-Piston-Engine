import React from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../context/TelemetryContext';
import { Play, Pause, RotateCcw, Wind, FastForward, Activity, Gauge } from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const {
    isRunning,
    simSpeed,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setWind,
    setThrottle,
    telemetry,
  } = useTelemetry();

  const currentWindSpeed = telemetry?.environment.windSpeed || 8.4;
  const currentWindDir = telemetry?.environment.windDirection || 245;
  const currentThrottle = telemetry?.engine?.operating.throttlePosition ?? 65;

  return (
    <div className="card-surface-pop rounded-3xl p-5 flex flex-col justify-between select-none shadow-sm font-mono space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
        <div className="flex items-center space-x-2.5">
          <Activity className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span className="font-display font-extrabold text-[#0c1524] text-sm tracking-wide">
            Simulation & Physics Controls
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-extrabold border border-sky-200 flex-shrink-0">
          6-DOF KINEMATICS + DIGITAL TWIN
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        
        {/* 1. Engine State Controls (Guaranteed Zero-Clipping, Robust Flex Layout) */}
        <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2.5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase">
            <span>ENGINE STATE</span>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          </div>

          <div className="flex items-center gap-2 w-full">
            {isRunning ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={pauseSimulation}
                className="flex-1 min-w-0 py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-white flex-shrink-0" />
                <span className="truncate">PAUSE SIM</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={startSimulation}
                className="flex-1 min-w-0 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#0c1524] hover:bg-[#16243b] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all border border-slate-700"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 flex-shrink-0" />
                <span className="truncate">START SIM</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={resetSimulation}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs flex items-center justify-center flex-shrink-0 transition-all"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </motion.button>
          </div>
        </div>

        {/* 2. Speed Multiplier (Clean Segmented Pill Bar, Zero-Bulge / Zero-Clip) */}
        <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2.5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase">
            <span>SPEED MULTIPLIER</span>
            <FastForward className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between p-1 bg-slate-200/70 rounded-xl w-full gap-1 min-w-0">
            {([0.5, 1, 2, 5] as const).map((speed) => {
              const isActive = simSpeed === speed;
              return (
                <motion.button
                  key={speed}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`flex-1 min-w-0 py-1.5 rounded-lg text-center text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-[#0c1524] text-sky-400 shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="truncate block">{speed}×</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3. Injected Wind Gust */}
        <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold uppercase">
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              GUST
            </span>
            <span className="text-[#0c1524] font-extrabold text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              {currentWindSpeed.toFixed(1)} M/S
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={currentWindSpeed}
              onChange={(e) => setWind(parseFloat(e.target.value), currentWindDir)}
              className="w-full accent-[#0c1524] bg-slate-200 h-1.5 rounded-full cursor-pointer transition-all"
            />
            <div className="flex justify-between text-[8px] text-slate-400 font-extrabold">
              <span>0 (CALM)</span>
              <span>12 (BREEZE)</span>
              <span>25 (GALE)</span>
            </div>
          </div>
        </div>

        {/* 4. Aero-Piston Throttle Lever (Direct Digital Twin Control) */}
        <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold uppercase">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              THROTTLE
            </span>
            <span className="text-[#0c1524] font-extrabold text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              {currentThrottle.toFixed(0)}%
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={currentThrottle}
              onChange={(e) => setThrottle(parseFloat(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 h-1.5 rounded-full cursor-pointer transition-all"
            />
            <div className="flex justify-between text-[8px] text-slate-400 font-extrabold">
              <span>IDLE (0%)</span>
              <span>CRUISE (65%)</span>
              <span>MAX (100%)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';

// Technical SVG Placeholder Visuals for AeroTwin AI (SIH26054)
// High-precision vector schematics conforming to aerospace engineering standards

export const EngineCutawayPlaceholder: React.FC<{ className?: string }> = ({ 
  className = "w-full h-full"
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/50 flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Blueprint Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>

      {/* Radial Atmospheric Glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      {/* SVG Engine Schematic */}
      <svg viewBox="0 0 400 240" className="w-full h-auto max-h-[200px] z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Engine Crankcase Outline */}
        <rect x="130" y="80" width="140" height="90" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
        <text x="200" y="130" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">CRANKCASE CORE</text>
        <text x="200" y="145" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">ROTAX 914F DUAL-SPARK</text>

        {/* Cylinder 1 & 3 (Left Boxer) */}
        <rect x="50" y="70" width="80" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="50" y="125" width="80" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="90" cy="91" r="14" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b15" />
        <circle cx="90" cy="146" r="14" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b15" />
        <text x="90" y="94" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">CYL 1</text>
        <text x="90" y="149" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">CYL 3</text>

        {/* Cylinder 2 & 4 (Right Boxer) */}
        <rect x="270" y="70" width="80" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="270" y="125" width="80" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="310" cy="91" r="14" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b15" />
        <circle cx="310" cy="146" r="14" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b15" />
        <text x="310" y="94" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">CYL 2</text>
        <text x="310" y="149" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">CYL 4</text>

        {/* Turbocharger & Wastegate Unit */}
        <circle cx="200" cy="40" r="22" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        <path d="M 188 40 A 12 12 0 0 1 212 40" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <text x="200" y="44" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="JetBrains Mono">TURBO</text>

        {/* Propeller Reduction Gearbox (PRGB) */}
        <rect x="160" y="170" width="80" height="35" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
        <line x1="200" y1="205" x2="200" y2="230" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <text x="200" y="192" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="JetBrains Mono">REDUCTION GEAR</text>

        {/* Oil Sump / Lubrication Sensor Point */}
        <circle cx="245" cy="160" r="5" fill="#38bdf8" className="animate-pulse" />
        <line x1="245" y1="160" x2="280" y2="185" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        <text x="285" y="190" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">OIL P/T TRANSDUCER</text>
      </svg>

      {/* Bottom Technical Caption */}
      <div className="z-10 mt-2 flex items-center justify-between w-full px-2 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          SCHEMATIC: AERO-PISTON 4-CYL BOXER
        </span>
        <span className="text-sky-400 font-semibold">TBO: 2,000 HRS</span>
      </div>
    </div>
  );
};

export const ThermalGradientPlaceholder: React.FC<{ className?: string }> = ({ 
  className = "w-full h-full" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/50 p-4 flex flex-col justify-between ${className}`}>
      {/* Background radial thermal bloom */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(239, 68, 68, 0.45) 0%, rgba(245, 158, 11, 0.25) 45%, transparent 75%)'
        }}
      />

      <div className="z-10 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">THERMOCOUPLE GRADIENT</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          CHT · EGT MATRIX
        </span>
      </div>

      {/* Thermal Heatmap Bars */}
      <div className="z-10 space-y-2.5 my-3">
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
            <span>CYL 1 CHT</span>
            <span className="text-amber-400 font-bold">124°C (NOMINAL)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
            <span>CYL 2 CHT</span>
            <span className="text-emerald-400 font-bold">119°C (NOMINAL)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
            <span>CYL 3 EGT (EXHAUST)</span>
            <span className="text-red-400 font-bold">818°C (OPTIMAL STOICH)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
            <span>CYL 4 EGT (EXHAUST)</span>
            <span className="text-red-400 font-bold">806°C (OPTIMAL STOICH)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
      </div>

      <div className="z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <span>MAX CHT LIMIT: 135°C</span>
        <span>EGT PEAK LIMIT: 880°C</span>
      </div>
    </div>
  );
};

export const VibrationFFTPlaceholder: React.FC<{ className?: string }> = ({ 
  className = "w-full h-full" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/50 p-4 flex flex-col justify-between ${className}`}>
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="fft-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fft-grid)" />
      </svg>

      <div className="z-10 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">SPECTRAL VIBRATION (FFT)</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
          RMS: 2.1 mm/s
        </span>
      </div>

      {/* Simulated FFT Frequency Curve */}
      <div className="z-10 my-3">
        <svg viewBox="0 0 300 90" className="w-full h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Baseline threshold */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
          <text x="290" y="16" textAnchor="end" fill="#ef4444" fontSize="7" fontFamily="JetBrains Mono">CRITICAL VIB LIMIT</text>

          {/* FFT Area with radial gradient effect */}
          <path 
            d="M 10 75 Q 30 73 50 68 Q 65 30 75 70 Q 110 74 135 65 Q 150 15 160 68 Q 200 74 220 55 Q 235 42 245 72 L 290 75" 
            stroke="#38bdf8" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M 10 75 Q 30 73 50 68 Q 65 30 75 70 Q 110 74 135 65 Q 150 15 160 68 Q 200 74 220 55 Q 235 42 245 72 L 290 75 L 290 85 L 10 85 Z" 
            fill="rgba(56, 189, 248, 0.12)" 
          />

          {/* Harmonic Peak Labels */}
          <circle cx="75" cy="30" r="3" fill="#38bdf8" />
          <text x="75" y="24" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="JetBrains Mono">1X (90Hz)</text>

          <circle cx="150" cy="15" r="3.5" fill="#f59e0b" />
          <text x="150" y="10" textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="JetBrains Mono">2X HARMONIC</text>
        </svg>
      </div>

      <div className="z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
        <span>SAMPLING: 2,000 HZ</span>
        <span className="text-emerald-400">BEARING WEAR: NOMINAL</span>
      </div>
    </div>
  );
};

export const RULDegradationPlaceholder: React.FC<{ className?: string }> = ({ 
  className = "w-full h-full" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/50 p-4 flex flex-col justify-between ${className}`}>
      <div className="z-10 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">XGBOOST RUL TRAJECTORY</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          CONF: 96.4%
        </span>
      </div>

      {/* Degradation Curve SVG */}
      <div className="z-10 my-3">
        <svg viewBox="0 0 300 90" className="w-full h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* TBO Threshold line */}
          <line x1="0" y1="75" x2="300" y2="75" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x="290" y="70" textAnchor="end" fill="#ef4444" fontSize="7" fontFamily="JetBrains Mono">MAINTENANCE KNEE (TBO)</text>

          {/* Past Health Trajectory */}
          <path d="M 10 20 Q 80 25 150 35" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Current State Marker */}
          <circle cx="150" cy="35" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="150" y1="0" x2="150" y2="85" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="150" y="10" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="JetBrains Mono">NOW (1,420h)</text>

          {/* Predicted Projected RUL (XGBoost) */}
          <path d="M 150 35 Q 220 48 270 75" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* 95% Confidence Band */}
          <path d="M 150 35 Q 220 42 270 65 L 270 85 Q 220 54 150 35 Z" fill="rgba(56, 189, 248, 0.15)" />
        </svg>
      </div>

      <div className="z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800">
        <span>CURRENT HEALTH: <strong className="text-emerald-400">92.4%</strong></span>
        <span>EST. RUL: <strong className="text-sky-300">580.0 HRS</strong></span>
      </div>
    </div>
  );
};

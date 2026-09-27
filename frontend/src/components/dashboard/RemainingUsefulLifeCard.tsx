import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { RULStatus } from '../../types/prediction';

export const RemainingUsefulLifeCard: React.FC = () => {
  const { predictions } = useTelemetry();
  const rulState = predictions?.rul;
  const [filter, setFilter] = useState<'ALL' | 'POWERPLANT' | 'PROPULSION' | 'ESC' | 'BATTERY'>('ALL');

  if (!rulState) {
    return (
      <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 text-xs text-[#786c5f]">
        Awaiting airworthiness prognostics telemetry...
      </div>
    );
  }

  const {
    fleetAirworthinessScore,
    criticalPathRemainingHours,
    criticalPathName,
    nextScheduledMaintenanceHours,
    components,
  } = rulState;

  const filteredComponents = components.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'POWERPLANT') {
      return (
        c.subsystem === 'Engine Core' ||
        c.subsystem === 'Turbocharger' ||
        c.subsystem === 'Lubrication Pump' ||
        c.subsystem === 'Alternator'
      );
    }
    if (filter === 'PROPULSION') return c.subsystem === 'Propulsion';
    if (filter === 'ESC') return c.subsystem === 'ESC';
    if (filter === 'BATTERY') return c.subsystem === 'Battery';
    return true;
  });

  const getStatusBadge = (status: RULStatus) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#fee2e2] text-[#dc2626] rounded-full border border-[#fca5a5]">
            CRITICAL
          </span>
        );
      case 'DEGRADED':
      case 'MONITOR':
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#fef3c7] text-[#d97706] rounded-full border border-[#fde68a]">
            MONITOR
          </span>
        );
      case 'NOMINAL':
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#2d6a4f]/10 text-[#2d6a4f] rounded-full border border-[#2d6a4f]/20">
            NOMINAL
          </span>
        );
    }
  };

  const isCriticalPathAlert = criticalPathRemainingHours < 150;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl flex flex-col select-none shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-[#e5dfd3] flex items-center justify-between bg-[#efeae2]">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold tracking-wide text-[#1c1917]">
            Remaining Useful Life (RUL) & Prognostics
          </span>
          <span className="text-[9px] font-mono text-[#786c5f] bg-white px-2 py-0.5 rounded-full border border-[#ded5c7]">
            ISO-13374
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-[#786c5f]">Health Index:</span>
          <span
            className={`font-bold px-2 py-0.5 text-[10px] rounded-full border ${
              fleetAirworthinessScore < 40
                ? 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]'
                : fleetAirworthinessScore < 70
                ? 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]'
                : 'bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/20'
            }`}
          >
            {fleetAirworthinessScore}%
          </span>
        </div>
      </div>

      {/* Critical Path Bottleneck Banner */}
      <div
        className={`px-4 py-2.5 text-[11px] border-b flex items-center justify-between ${
          isCriticalPathAlert
            ? 'bg-[#fee2e2]/70 border-[#fca5a5] text-[#b91c1c]'
            : 'bg-[#f8f5ee] border-[#e5dfd3] text-[#5c544d]'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCriticalPathAlert ? 'bg-[#dc2626] animate-pulse' : 'bg-[#d8533c]'
            }`}
          />
          <span className="font-mono">
            Bottleneck:{' '}
            <strong className="text-[#1c1917] font-bold">{criticalPathName}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span>
            RUL:{' '}
            <strong className={isCriticalPathAlert ? 'text-[#dc2626]' : 'text-[#1c1917]'}>
              {criticalPathRemainingHours} hrs
            </strong>
          </span>
          <span className="text-[#ded5c7]">|</span>
          <span>
            Due:{' '}
            <strong className="text-[#1c1917]">{nextScheduledMaintenanceHours.toFixed(1)} hrs</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-2.5 pb-2 flex items-center justify-between border-b border-[#e5dfd3] text-[10px] bg-[#faf8f5]">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {(['ALL', 'POWERPLANT', 'PROPULSION', 'ESC', 'BATTERY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-white text-[#d8533c] border border-[#d8d0c2] shadow-xs'
                  : 'text-[#786c5f] hover:text-[#1c1917]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[9px] text-[#8c8074] font-mono shrink-0 ml-2">
          {filteredComponents.length} UNITS TRACKED
        </span>
      </div>

      {/* Component Airworthiness Matrix */}
      <div className="divide-y divide-[#efeae2] overflow-y-auto max-h-[300px]">
        {filteredComponents.map((comp) => {
          const isWarning = comp.status === 'CRITICAL' || comp.status === 'DEGRADED';
          return (
            <div
              key={comp.id}
              className={`px-4 py-2 text-[11px] flex items-center justify-between transition-colors font-mono ${
                isWarning ? 'bg-[#fee2e2]/30 hover:bg-[#fee2e2]/50' : 'hover:bg-[#efeae2]/40'
              }`}
            >
              {/* Col 1: Name and stress factor */}
              <div className="w-[34%] min-w-0 pr-2">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="text-[#1c1917] font-bold text-[11px] truncate">
                    {comp.name}
                  </span>
                  {comp.isSimulatedPrediction && (
                    <span className="text-[7.5px] px-1 py-0.2 bg-[#ded5c7] text-[#5c544d] rounded font-bold shrink-0">
                      SIM
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-[#8c8074] truncate font-mono">
                  {comp.stressFactor}
                </div>
              </div>

              {/* Col 2: Degradation Trend Sparkline */}
              <div className="w-[18%] flex flex-col items-center justify-center px-1">
                <svg className="w-16 h-4" viewBox="0 0 70 16">
                  <line
                    x1="0"
                    y1="8"
                    x2="70"
                    y2="8"
                    stroke="#ded5c7"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <polyline
                    fill="none"
                    stroke={isWarning ? '#dc2626' : '#2d6a4f'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={comp.sparkline
                      .map((val, idx) => {
                        const x = (idx / (comp.sparkline.length - 1)) * 66 + 2;
                        const y = 14 - (val / 100) * 12;
                        return `${x},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                </svg>
                <span className="text-[8px] font-mono text-[#8c8074]">
                  {comp.trend.toLowerCase()}
                </span>
              </div>

              {/* Col 3: RUL Value */}
              <div className="w-[24%] text-right font-mono px-2">
                <div
                  className={`text-[11px] font-bold ${
                    isWarning ? 'text-[#dc2626]' : 'text-[#1c1917]'
                  }`}
                >
                  {comp.rulValue}{' '}
                  <span className="text-[9px] text-[#8c8074] font-normal">{comp.rulUnit}</span>
                </div>
                <div className="text-[9px] text-[#8c8074]">
                  burn: {comp.degradationRate}x
                </div>
              </div>

              {/* Col 4: Status and Health Bar */}
              <div className="w-[24%] flex flex-col items-end pl-1 space-y-1">
                {getStatusBadge(comp.status)}
                {/* Horizontal Health Mini-Bar */}
                <div className="w-full bg-[#ded5c7] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      comp.healthPercent < 35
                        ? 'bg-[#dc2626]'
                        : comp.healthPercent < 60
                        ? 'bg-[#d97706]'
                        : 'bg-[#2d6a4f]'
                    }`}
                    style={{ width: `${comp.healthPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Meta Strip */}
      <div className="px-4 py-2 border-t border-[#e5dfd3] bg-[#efeae2] flex items-center justify-between text-[9px] text-[#786c5f] font-mono">
        <span>INFERENCE: 14.8ms • KALMAN-RUL [PROGNOSTIC MODEL]</span>
        <span>AERO-PISTON DEMO/SIMULATED DATA</span>
      </div>
    </div>
  );
};

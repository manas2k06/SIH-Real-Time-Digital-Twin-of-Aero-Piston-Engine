import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const PropulsionCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { propulsion } = telemetry;
  const { motors } = propulsion;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Propulsion & ESC Bus (4× BLDC)
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#786c5f]">
          Rotor Balance: <span className="font-bold text-[#1c1917]">{propulsion.rotorBalance}%</span>
        </div>
      </div>

      {/* 4-Motor Physical Airframe Layout Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5 pt-3">
        {[motors[1], motors[0], motors[3], motors[2]].map((m) => {
          const isFault = m.status === 'FAULT';
          const isDegraded = m.status === 'DEGRADED';

          const cardBorder = isFault ? 'border-[#fca5a5] bg-[#fee2e2]/60' : isDegraded ? 'border-[#fde68a] bg-[#fef3c7]/60' : 'border-[#ded5c7] bg-[#efeae2]/60';
          const rpmColor = isFault ? 'text-[#dc2626]' : isDegraded ? 'text-[#d97706]' : 'text-[#1c1917]';
          const barColor = isFault ? 'bg-[#dc2626]' : isDegraded ? 'bg-[#d97706]' : 'bg-[#d8533c]';

          return (
            <div key={m.id} className={`p-2.5 border ${cardBorder} flex flex-col justify-between space-y-2 rounded-xl transition-all`}>
              {/* Motor Header Strip */}
              <div className="flex items-center justify-between border-b border-[#ded5c7] pb-1 text-[10px]">
                <div className="flex items-center space-x-1.5 font-mono">
                  <span className="font-bold text-[#1c1917] text-[11px]">{m.name}</span>
                  <span className="text-[#8c8074] text-[9px]">({m.position.split('-')[0]})</span>
                  <span className="text-[#5c544d] text-[9px] px-1 py-0.2 bg-white rounded border border-[#ddd5c7] font-semibold">{m.direction}</span>
                </div>
                <span
                  className={`px-1.5 py-[1px] text-[8px] font-mono font-bold rounded-full ${
                    isFault ? 'bg-[#dc2626] text-white' : isDegraded ? 'bg-[#d97706] text-white' : 'bg-[#2d6a4f]/10 text-[#2d6a4f] border border-[#2d6a4f]/20'
                  }`}
                >
                  {isFault ? 'FAULT' : isDegraded ? 'DEGRADED' : 'NOMINAL'}
                </span>
              </div>

              {/* RPM & Throttle Load Bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-[#786c5f] uppercase">Rotor Speed</span>
                  <span className={`text-sm font-mono font-bold tracking-tight ${rpmColor}`}>
                    {m.rpm.toLocaleString()} <span className="text-[9px] font-normal text-[#8c8074]">RPM</span>
                  </span>
                </div>
                {/* Micro Throttle Bar */}
                <div className="w-full bg-[#e5ded2] h-2 rounded-full overflow-hidden border border-[#d5ccbe] p-[1px]">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, m.loadPercent))}%` }}
                  />
                </div>
              </div>

              {/* Electrical & Thermal Triad */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-[#786c5f] border-t border-[#ded5c7] font-mono">
                <div>
                  <span className="block text-[8px] uppercase text-[#8c8074]">Load</span>
                  <span className="text-[#1c1917] font-bold text-[10px]">{m.loadPercent}%</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-[#8c8074]">Current</span>
                  <span className="text-[#1c1917] font-bold text-[10px]">{m.current.toFixed(1)} A</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-[#8c8074]">Temp</span>
                  <span className={`font-bold text-[10px] ${m.temperature > 55 ? 'text-[#dc2626]' : 'text-[#1c1917]'}`}>
                    {m.temperature.toFixed(0)} °C
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

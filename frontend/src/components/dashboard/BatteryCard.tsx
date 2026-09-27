import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const BatteryCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { battery } = telemetry;

  const isCritical = battery.percentage < 15 || battery.voltage < 21.0 || battery.temperature > 50;
  const isCaution = (battery.percentage < 30 || battery.temperature > 42) && !isCritical;

  const socColor = isCritical ? 'text-[#dc2626]' : isCaution ? 'text-[#d97706]' : 'text-[#1c1917]';
  const barColor = isCritical ? 'bg-[#dc2626]' : isCaution ? 'bg-[#d97706]' : 'bg-[#2d6a4f]';

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Power System (6S LiPo BMS)
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#786c5f]">
          Bus: <span className="text-[#1c1917] font-bold">{battery.voltage.toFixed(1)}V</span> · <span className="text-[#5c544d]">{battery.current.toFixed(1)}A</span>
        </div>
      </div>

      <div className="pt-3 space-y-3">
        {/* Main SOC & Remaining Flight Time Readout */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-mono font-black tracking-tight ${socColor}`}>
              {battery.percentage.toFixed(0)}%
            </span>
            <span className="text-[10px] text-[#786c5f] font-mono font-bold uppercase">State of Charge</span>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-[#786c5f] font-mono font-bold uppercase">Est. Endurance</div>
            <div className="text-[12px] font-mono font-bold text-[#1c1917]">
              {battery.remainingFlightTimeMinutes} min remaining
            </div>
          </div>
        </div>

        {/* High-Precision Segmented Battery Bar */}
        <div className="space-y-1">
          <div className="w-full bg-[#e5ded2] h-2.5 rounded-full overflow-hidden p-[1px] border border-[#d5ccbe]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${Math.max(0, Math.min(100, battery.percentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#786c5f]">
            <span>CAPACITY: {battery.remainingCapacityMah} / {battery.capacityMah} mAh</span>
            <span>DRAIN: {battery.consumptionRate} mAh/min</span>
          </div>
        </div>

        {/* Electrical & Thermal Parameters Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-mono font-bold uppercase">Voltage</span>
            <span className="font-mono font-bold text-[#1c1917]">{battery.voltage.toFixed(1)} V</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-mono font-bold uppercase">Current</span>
            <span className="font-mono font-bold text-[#1c1917]">{battery.current.toFixed(1)} A</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-mono font-bold uppercase">Load</span>
            <span className="font-mono font-bold text-[#1c1917]">{battery.power.toFixed(0)} W</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-mono font-bold uppercase">Temp</span>
            <span className={`font-mono font-bold ${battery.temperature > 45 ? 'text-[#dc2626]' : 'text-[#1c1917]'}`}>
              {battery.temperature.toFixed(0)} °C
            </span>
          </div>
        </div>

        {/* 6S Individual Cell Voltages Strip */}
        <div className="pt-2 border-t border-[#e5dfd3]">
          <div className="flex justify-between text-[8px] text-[#786c5f] font-mono uppercase tracking-wider mb-1">
            <span>6S Cell Balance Monitor</span>
            <span>ΔV: 0.02V</span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-center font-mono">
            {battery.cellVoltages.map((v, idx) => (
              <div
                key={idx}
                className={`py-1 rounded-lg border text-[9px] ${
                  v < 3.3
                    ? 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5] font-bold'
                    : 'bg-white text-[#1c1917] border-[#ded5c7]'
                }`}
              >
                <div className="text-[7px] text-[#8c8074]">C{idx + 1}</div>
                <div className="font-bold">{v.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const PropulsionCard: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [viewMode, setViewMode] = useState<'ROTAX_GEARBOX' | 'VTOL_MOTORS'>('ROTAX_GEARBOX');

  if (!telemetry) return null;
  const { propulsion, engine } = telemetry;
  const { motors } = propulsion;

  // Rotax 914 F Gearbox and Propeller Data
  const engineRpm = engine?.gearbox.engine_input_rpm ?? 5500;
  const propRpm = engine?.gearbox.propeller_output_rpm ?? 2265;
  const reductionRatio = engine?.gearbox.reduction_ratio ?? 2.42857;
  const gbTemp = engine?.gearbox.gearbox_temperature ?? 78.4;
  const gbVib = engine?.gearbox.gearbox_vibration ?? 1.82;
  const gbTorque = engine?.gearbox.gearbox_torque ?? 345.2;
  const gbHealth = engine?.gearbox.gearbox_health ?? 96;
  const clutchStatus = engine?.gearbox.overloadClutchStatus ?? 'ENGAGED';
  const propPitch = engine?.propeller.propellerPitchDeg ?? 21.5;
  const propThrust = engine?.propeller.propellerThrustN ?? 2450;
  const propLoad = engine?.propeller.propellerLoadPct ?? 82;
  const propEfficiency = engine?.propeller.propellerEfficiencyPct ?? 86.4;
  const governorStatus = engine?.propeller.governorStatus ?? 'ACTIVE';

  const isGbAlert = gbVib > 4.5 || gbTemp > 100 || gbHealth < 50;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header with View Mode Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            {viewMode === 'ROTAX_GEARBOX'
              ? 'Rotax 914F Reduction Gearbox & Prop'
              : 'Auxiliary VTOL Rotor Bus (4× BLDC)'}
          </span>
        </div>
        <div className="flex items-center space-x-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => setViewMode('ROTAX_GEARBOX')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              viewMode === 'ROTAX_GEARBOX'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-[#efeae2] text-[#786c5f] hover:text-[#1c1917]'
            }`}
          >
            ROTAX 2.43:1
          </button>
          <button
            type="button"
            onClick={() => setViewMode('VTOL_MOTORS')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              viewMode === 'VTOL_MOTORS'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-[#efeae2] text-[#786c5f] hover:text-[#1c1917]'
            }`}
          >
            VTOL 4× BLDC
          </button>
        </div>
      </div>

      {viewMode === 'ROTAX_GEARBOX' ? (
        /* ========================================================================= */
        /* ROTAX 914 F PROPELLER SPEED REDUCTION GEARBOX (2.42857:1)                 */
        /* ========================================================================= */
        <div className="pt-3 space-y-3 font-mono">
          {/* Dual RPM Tachometer: Crankshaft vs Propeller Flange */}
          <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#786c5f] block">Engine Crankshaft</span>
                <span className="text-xl font-black text-[#1c1917]">
                  {engineRpm.toLocaleString()} <span className="text-[10px] font-normal text-[#786c5f]">RPM</span>
                </span>
              </div>

              <div className="text-center px-2.5 py-1 bg-white rounded-lg border border-[#ded5c7] shadow-2xs">
                <span className="text-[8px] font-black text-sky-850 block">RATIO (51:21)</span>
                <span className="text-xs font-black text-[#0c1524]">
                  {reductionRatio.toFixed(3)} : 1
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-[#786c5f] block">Propeller Flange</span>
                <span className="text-xl font-black text-sky-900">
                  {propRpm.toLocaleString()} <span className="text-[10px] font-normal text-[#786c5f]">RPM</span>
                </span>
              </div>
            </div>

            {/* Visual Transmission Flow Indicator */}
            <div className="w-full bg-[#e5ded2] h-2 rounded-full overflow-hidden border border-[#d5ccbe] p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isGbAlert ? 'bg-rose-500' : 'bg-sky-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (engineRpm / 5800) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-[#786c5f]">
              <span>IDLE: 1,400 RPM</span>
              <span>CONTINUOUS: 5,500 RPM</span>
              <span>TAKEOFF: 5,800 RPM</span>
            </div>
          </div>

          {/* Precision 4-Cell Gearbox & Propeller Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c7] flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Gearbox Torque</span>
                <span className="font-bold text-xs text-[#1c1917]">{gbTorque.toFixed(1)} Nm</span>
              </div>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-200 font-bold">
                {propThrust.toLocaleString()} N
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c7] flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Gearbox Temp</span>
                <span className={`font-bold text-xs ${gbTemp > 95 ? 'text-rose-600' : 'text-[#1c1917]'}`}>
                  {gbTemp.toFixed(1)} °C
                </span>
              </div>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-bold">
                LIMIT 115°
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c7] flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Gearbox Vibration</span>
                <span className={`font-bold text-xs ${gbVib > 4.5 ? 'text-rose-600 animate-pulse' : 'text-emerald-800'}`}>
                  {gbVib.toFixed(2)} mm/s
                </span>
              </div>
              <span className={`text-[8.5px] px-1.5 py-0.5 rounded border font-bold ${
                gbVib > 4.5 ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {gbVib > 4.5 ? 'HIGH VIB' : 'NOMINAL'}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c7] flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Overload Clutch</span>
                <span className="font-bold text-xs text-[#1c1917]">{clutchStatus}</span>
              </div>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-bold">
                DAMPED
              </span>
            </div>
          </div>

          {/* Propeller Pitch & Governor Ribbon */}
          <div className="p-2 bg-[#f4efe6] rounded-xl border border-[#ded5c7] flex items-center justify-between text-[9px]">
            <div className="flex items-center space-x-3">
              <span>PITCH: <strong className="text-[#1c1917]">{propPitch.toFixed(1)}°</strong></span>
              <span>EFF: <strong className="text-emerald-800">{propEfficiency.toFixed(1)}%</strong></span>
              <span>LOAD: <strong className="text-[#1c1917]">{propLoad}%</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white border border-[#ded5c7] text-sky-850 font-bold">
              GOVERNOR: {governorStatus}
            </span>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* AUXILIARY 4-MOTOR PHYSICAL AIRFRAME LAYOUT GRID (2x2)                     */
        /* ========================================================================= */
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
      )}
    </div>
  );
};

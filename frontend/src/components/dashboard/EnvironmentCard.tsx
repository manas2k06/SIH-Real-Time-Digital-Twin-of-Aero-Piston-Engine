import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const EnvironmentCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { environment } = telemetry;

  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Atmospheric Environment
          </span>
        </div>
        <span className="text-[9px] text-[#8c8074] font-mono font-bold">ISA MODEL</span>
      </div>

      <div className="pt-3 space-y-3 font-mono">
        {/* Prominent Wind Vector & Direction Rose */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Compass Dial */}
            <div className="relative w-12 h-12 rounded-full border border-[#ded5c7] bg-white flex items-center justify-center shadow-xs">
              <span className="text-[7px] text-[#8c8074] font-bold absolute top-0.5">N</span>
              <span className="text-[7px] text-[#8c8074] font-bold absolute right-1">E</span>
              <span className="text-[7px] text-[#8c8074] font-bold absolute bottom-0.5">S</span>
              <span className="text-[7px] text-[#8c8074] font-bold absolute left-1">W</span>
              {/* Wind Vector Needle */}
              <div
                className="absolute w-[2px] h-8 bg-[#d8533c] transition-transform duration-300 rounded"
                style={{ transform: `rotate(${environment.windDirection}deg)` }}
              >
                <div className="w-2 h-2 -ml-[3px] bg-[#d8533c] rounded-full ring-2 ring-white" />
              </div>
              <div className="w-1.5 h-1.5 bg-[#1c1917] rounded-full z-10" />
            </div>

            <div>
              <div className="text-[9px] text-[#786c5f] font-bold uppercase">Wind Velocity</div>
              <div className="text-xl font-bold text-[#1c1917] tracking-tight flex items-baseline space-x-1">
                <span>{environment.windSpeed.toFixed(1)}</span>
                <span className="text-[10px] font-normal text-[#8c8074]">m/s</span>
              </div>
              <div className="text-[10px] text-[#5c544d] font-semibold">
                {environment.windDirection}° {getWindCardinal(environment.windDirection)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-[#786c5f] font-bold uppercase">Humidity</div>
            <div className="text-xs font-bold text-[#2d6a4f] uppercase">
              {environment.humidity.toFixed(0)}% RH
            </div>
          </div>
        </div>

        {/* Ambient Metrics Quad */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Temp</span>
            <span className="font-bold text-[#1c1917]">{environment.ambientTemperature.toFixed(1)} °C</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Pressure</span>
            <span className="font-bold text-[#1c1917]">{environment.pressureHpa.toFixed(0)} hPa</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block font-bold uppercase">Density</span>
            <span className="font-bold text-[#1c1917]">{environment.airDensity.toFixed(2)} kg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
};

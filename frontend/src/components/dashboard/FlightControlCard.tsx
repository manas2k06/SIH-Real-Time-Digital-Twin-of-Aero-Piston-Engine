import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const FlightControlCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { flightControl } = telemetry;

  const rows = [
    {
      param: 'Altitude',
      unit: 'm',
      target: flightControl.targetAltitude.toFixed(1),
      actual: flightControl.actualAltitude.toFixed(1),
      errorVal: flightControl.altitudeError,
      errorFormatted: flightControl.altitudeError >= 0 ? `+${flightControl.altitudeError.toFixed(1)}` : flightControl.altitudeError.toFixed(1),
      maxTolerance: 3.0,
      criticalTolerance: 8.0,
    },
    {
      param: 'Airspeed',
      unit: 'm/s',
      target: flightControl.targetSpeed.toFixed(1),
      actual: flightControl.actualSpeed.toFixed(1),
      errorVal: flightControl.speedError,
      errorFormatted: flightControl.speedError >= 0 ? `+${flightControl.speedError.toFixed(1)}` : flightControl.speedError.toFixed(1),
      maxTolerance: 2.0,
      criticalTolerance: 5.0,
    },
    {
      param: 'Heading',
      unit: '°',
      target: `${flightControl.targetHeading}°`,
      actual: `${flightControl.actualHeading}°`,
      errorVal: flightControl.headingError,
      errorFormatted: `${flightControl.headingError >= 0 ? '+' : ''}${flightControl.headingError}°`,
      maxTolerance: 6.0,
      criticalTolerance: 15.0,
    },
    {
      param: 'Roll (Φ)',
      unit: '°',
      target: `${flightControl.targetRoll.toFixed(1)}°`,
      actual: `${flightControl.actualRoll.toFixed(1)}°`,
      errorVal: flightControl.rollError,
      errorFormatted: `${flightControl.rollError >= 0 ? '+' : ''}${flightControl.rollError.toFixed(1)}°`,
      maxTolerance: 3.0,
      criticalTolerance: 8.0,
    },
    {
      param: 'Pitch (θ)',
      unit: '°',
      target: `${flightControl.targetPitch.toFixed(1)}°`,
      actual: `${flightControl.actualPitch.toFixed(1)}°`,
      errorVal: flightControl.pitchError,
      errorFormatted: `${flightControl.pitchError >= 0 ? '+' : ''}${flightControl.pitchError.toFixed(1)}°`,
      maxTolerance: 3.5,
      criticalTolerance: 8.0,
    },
  ];

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Flight Control Computer (FCC)
          </span>
        </div>
        <span className="text-[#8c8074] text-[9px] font-mono uppercase tracking-wider font-semibold">
          PID Closed-Loop Tracking
        </span>
      </div>

      {/* Target vs Actual Table */}
      <div className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-[9px] font-mono text-[#8c8074] uppercase border-b border-[#e5dfd3] font-bold">
                <th className="pb-1.5">Channel</th>
                <th className="pb-1.5 text-right">Cmd (Target)</th>
                <th className="pb-1.5 text-right">Actual</th>
                <th className="pb-1.5 text-center w-28">Deviation</th>
                <th className="pb-1.5 text-right">Error (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeae2] font-mono">
              {rows.map((row) => {
                const absError = Math.abs(row.errorVal);
                const isCritical = absError > row.criticalTolerance;
                const isCaution = absError > row.maxTolerance && !isCritical;
                const normalizedDeflection = Math.max(-50, Math.min(50, (row.errorVal / (row.criticalTolerance * 1.2)) * 50));

                return (
                  <tr key={row.param} className="hover:bg-[#efeae2]/50 transition-colors">
                    <td className="py-1.5 text-[#1c1917] font-semibold text-[11px]">{row.param}</td>
                    <td className="py-1.5 text-right text-[#786c5f] text-[11px]">{row.target}</td>
                    <td className="py-1.5 text-right text-[#1c1917] font-bold text-[11px]">{row.actual}</td>

                    {/* Bipolar Deviation Meter Bar */}
                    <td className="py-1.5 px-2">
                      <div className="relative w-full h-2 bg-[#ded5c7] rounded-full overflow-hidden flex items-center justify-center">
                        <div className="w-[1px] h-full bg-[#a89d8f] z-10" />
                        <div
                          className={`absolute h-full rounded-full transition-all duration-75 ${
                            isCritical ? 'bg-[#dc2626]' : isCaution ? 'bg-[#d97706]' : 'bg-[#d8533c]'
                          }`}
                          style={{
                            left: normalizedDeflection >= 0 ? '50%' : `${50 + normalizedDeflection}%`,
                            width: `${Math.abs(normalizedDeflection)}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td
                      className={`py-1.5 text-right font-bold text-[11px] ${
                        isCritical ? 'text-[#dc2626]' : isCaution ? 'text-[#d97706]' : 'text-[#786c5f]'
                      }`}
                    >
                      {row.errorFormatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

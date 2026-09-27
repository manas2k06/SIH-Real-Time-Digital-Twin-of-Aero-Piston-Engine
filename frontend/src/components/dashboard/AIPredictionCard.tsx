import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../ui/StatusBadge';

export const AIPredictionCard: React.FC = () => {
  const { predictions, telemetry } = useTelemetry();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);

  if (!predictions || !telemetry) return null;

  const { lstm, xgboost } = predictions;
  const currentAlt = telemetry.flightControl.actualAltitude;
  const currentSpeed = telemetry.movement.airSpeed;
  const currentBatt = telemetry.battery.percentage;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            AI Predictive Inference & Subsystem Anomaly Classifier
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-[#786c5f]">
          <span>LSTM: <strong className="text-[#1c1917]">{lstm.inferenceLatencyMs}ms</strong></span>
          <span>·</span>
          <span>XGB: <strong className="text-[#1c1917]">{xgboost.inferenceLatencyMs}ms</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-3">
        {/* Left Column: LSTM Sequence State Forecast */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] flex flex-col justify-between space-y-2 font-mono">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#ded5c7] mb-2 text-[10px]">
              <span className="font-bold text-[#1c1917] uppercase tracking-wider">
                LSTM SEQUENCE-TO-SEQUENCE HORIZON FORECAST
              </span>
              <span className="text-[9px] text-[#8c8074]">{lstm.modelName}</span>
            </div>

            <div className="space-y-2">
              {/* Altitude Profile */}
              <div className="bg-white p-2.5 rounded-lg border border-[#ded5c7]">
                <div className="flex justify-between text-[9px] text-[#786c5f] mb-1 font-bold">
                  <span>ALTITUDE PROFILE (M)</span>
                  <span>NOW: <strong className="text-[#1c1917]">{currentAlt.toFixed(1)} m</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {lstm.predictionSteps.map((step) => (
                    <div key={step.horizonSeconds} className="bg-[#efeae2]/50 p-1.5 rounded-md border border-[#ded5c7]">
                      <div className="text-[8px] text-[#8c8074] font-bold">+{step.horizonSeconds}S</div>
                      <div className="font-bold text-[#1c1917]">{step.predictedAltitude} m</div>
                      <div className="text-[7.5px] text-[#8c8074]">[{step.uncertaintyBound.altitudeMin}-{step.uncertaintyBound.altitudeMax}]</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed Profile */}
              <div className="bg-white p-2.5 rounded-lg border border-[#ded5c7]">
                <div className="flex justify-between text-[9px] text-[#786c5f] mb-1 font-bold">
                  <span>AIRSPEED PROFILE (M/S)</span>
                  <span>NOW: <strong className="text-[#1c1917]">{currentSpeed.toFixed(1)} m/s</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {lstm.predictionSteps.map((step) => (
                    <div key={step.horizonSeconds} className="bg-[#efeae2]/50 p-1.5 rounded-md border border-[#ded5c7]">
                      <div className="text-[8px] text-[#8c8074] font-bold">+{step.horizonSeconds}S</div>
                      <div className="font-bold text-[#1c1917]">{step.predictedSpeed} m/s</div>
                      <div className="text-[7.5px] text-[#8c8074]">[{step.uncertaintyBound.speedMin}-{step.uncertaintyBound.speedMax}]</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Battery SOC Profile */}
              <div className="bg-white p-2.5 rounded-lg border border-[#ded5c7]">
                <div className="flex justify-between text-[9px] text-[#786c5f] mb-1 font-bold">
                  <span>PREDICTED BATTERY SOC (%)</span>
                  <span>NOW: <strong className="text-[#1c1917]">{currentBatt.toFixed(0)}%</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {lstm.predictionSteps.map((step) => (
                    <div key={step.horizonSeconds} className="bg-[#efeae2]/50 p-1.5 rounded-md border border-[#ded5c7]">
                      <div className="text-[8px] text-[#8c8074] font-bold">+{step.horizonSeconds}S</div>
                      <div className="font-bold text-[#1c1917]">{step.predictedBatteryPercent}%</div>
                      <div className="text-[7.5px] text-[#8c8074]">EST. DRAIN</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: XGBoost Subsystem Anomaly Classifier */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] flex flex-col justify-between space-y-2 font-mono">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#ded5c7] mb-2 text-[10px]">
              <span className="font-bold text-[#1c1917] uppercase tracking-wider">
                XGBOOST MULTI-SUBSYSTEM FAULT CLASSIFIER
              </span>
              <div className="flex items-center space-x-1.5 text-[9px]">
                <span className="text-[#786c5f]">VEHICLE HEALTH:</span>
                <span className={`font-bold ${xgboost.overallHealthScore < 70 ? 'text-[#dc2626]' : 'text-[#2d6a4f]'}`}>
                  {xgboost.overallHealthScore}/100
                </span>
              </div>
            </div>

            {/* Subsystem Matrix */}
            <div className="space-y-1.5">
              {xgboost.subsystems.map((sub) => {
                const isSelected = selectedSubsystem === sub.subsystem;

                return (
                  <div
                    key={sub.subsystem}
                    onClick={() => setSelectedSubsystem(isSelected ? null : sub.subsystem)}
                    className="p-2 bg-white rounded-lg border border-[#ded5c7] hover:border-[#b8aca0] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1c1917] font-bold text-[10px]">{sub.subsystem}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-[#786c5f]">SCORE: {(sub.score * 100).toFixed(0)}%</span>
                        <StatusBadge status={sub.severity} size="sm" />
                      </div>
                    </div>

                    {(isSelected || sub.severity !== 'NORMAL') && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#efeae2] text-[9px] text-[#5c544d] space-y-0.5">
                        <div className="text-[#786c5f] italic">{sub.description}</div>
                        {sub.contributingFeatures.map((f) => (
                          <div key={f.feature} className="flex justify-between text-[#786c5f]">
                            <span>{f.feature} (weight: {f.importance}):</span>
                            <span className="text-[#1c1917] font-bold">{f.actualValue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

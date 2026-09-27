import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { RemainingUsefulLifeCard } from '../dashboard/RemainingUsefulLifeCard';

export const AIAnalysis: React.FC = () => {
  const { predictions, telemetry } = useTelemetry();

  if (!predictions || !telemetry) return null;
  const { lstm, xgboost } = predictions;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto select-none font-mono">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ddd5c7]">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-[#1c1917] tracking-wide">
            AI Predictive Inference, Prognostics & Anomaly Analysis Bench
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-[10px] text-[#786c5f]">
          <span>LSTM Latency: <strong className="text-[#1c1917]">{lstm.inferenceLatencyMs} ms</strong></span>
          <span>·</span>
          <span>XGBoost Latency: <strong className="text-[#1c1917]">{xgboost.inferenceLatencyMs} ms</strong></span>
        </div>
      </div>

      {/* Tier 1: Dedicated Remaining Useful Life (RUL) & Airworthiness Prognostics */}
      <div>
        <RemainingUsefulLifeCard />
      </div>

      {/* Tier 2: Deep-dive LSTM & XGBoost Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LSTM Section */}
        <div className="bg-[#faf8f5] p-4 border border-[#ddd5c7] rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
            <span className="font-bold text-[#1c1917] tracking-wide">
              LSTM Sequence-to-Sequence Horizon Extrapolation
            </span>
            <span className="text-[9px] text-[#786c5f] font-bold">{lstm.modelName}</span>
          </div>

          <p className="text-[11px] text-[#5c544d] leading-relaxed">
            Autoregressive neural time-series model extrapolating dynamic flight state, energy decay polynomial, and aerodynamic drift across future time horizons.
          </p>

          <div className="space-y-2 text-xs">
            {lstm.predictionSteps.map((step) => (
              <div key={step.horizonSeconds} className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] space-y-1.5">
                <div className="flex justify-between font-bold border-b border-[#ded5c7] pb-1 text-[10px]">
                  <span className="text-[#1c1917]">Horizon: +{step.horizonSeconds} Seconds</span>
                  <span className="text-[#786c5f] text-[9px]">95% CI Uncertainty Bounds</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-[#ded5c7]">
                    <span className="text-[#786c5f] block text-[8px] uppercase font-bold">Pred Alt</span>
                    <span className="font-bold text-[#1c1917]">{step.predictedAltitude} m</span>
                    <span className="text-[7.5px] text-[#8c8074] block">[{step.uncertaintyBound.altitudeMin} - {step.uncertaintyBound.altitudeMax}]</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#ded5c7]">
                    <span className="text-[#786c5f] block text-[8px] uppercase font-bold">Pred Airspeed</span>
                    <span className="font-bold text-[#1c1917]">{step.predictedSpeed} m/s</span>
                    <span className="text-[7.5px] text-[#8c8074] block">[{step.uncertaintyBound.speedMin} - {step.uncertaintyBound.speedMax}]</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#ded5c7]">
                    <span className="text-[#786c5f] block text-[8px] uppercase font-bold">Pred SOC</span>
                    <span className="font-bold text-[#1c1917]">{step.predictedBatteryPercent}%</span>
                    <span className="text-[7.5px] text-[#8c8074] block">Discharge Curve</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XGBoost Section */}
        <div className="bg-[#faf8f5] p-4 border border-[#ddd5c7] rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
            <span className="font-bold text-[#1c1917] tracking-wide">
              XGBoost Subsystem Fault Classifier & Attribution
            </span>
            <StatusBadge status={xgboost.activeRiskLevel} size="sm" />
          </div>

          <p className="text-[11px] text-[#5c544d] leading-relaxed">
            Gradient-boosted decision tree ensemble computing anomaly probability distributions and SHAP feature importance vectors across subsystem sensor channels.
          </p>

          <div className="space-y-2 text-xs">
            {xgboost.subsystems.map((sub) => (
              <div key={sub.subsystem} className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1c1917] text-[11px]">{sub.subsystem}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-[#786c5f]">Score: {(sub.score * 100).toFixed(0)}%</span>
                    <StatusBadge status={sub.severity} size="sm" />
                  </div>
                </div>
                <p className="text-[#5c544d] text-[10px]">{sub.description}</p>
                <div className="space-y-0.5 pt-1.5 border-t border-[#ded5c7]">
                  <span className="text-[9px] text-[#786c5f] uppercase font-bold">Top Contributing Features:</span>
                  {sub.contributingFeatures.map((f) => (
                    <div key={f.feature} className="flex justify-between text-[10px] text-[#786c5f]">
                      <span>{f.feature} (weight: {f.importance}):</span>
                      <span className="font-bold text-[#1c1917]">{f.actualValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

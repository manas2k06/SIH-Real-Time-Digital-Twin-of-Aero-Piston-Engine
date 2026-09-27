import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto font-mono text-[#5c544d] space-y-4 select-none">
      <div className="flex items-center space-x-2 pb-3 border-b border-[#ddd5c7] text-[#1c1917]">
        <div className="w-2 h-4 bg-[#d8533c] rounded" />
        <h1 className="text-xs font-bold uppercase tracking-wider">PROJECT DATA PRIVACY SPECIFICATION</h1>
      </div>

      <div className="bg-[#faf8f5] p-5 border border-[#ddd5c7] rounded-2xl space-y-4 text-[11px] leading-relaxed shadow-xs">
        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">1. SCOPE AND TECHNICAL CONTEXT</h2>
          <p className="text-[#786c5f]">
            This operational console functions as an engineering prototype for the <b>AI Real-Time Digital Twin for Drone Monitoring and Prediction</b> system. This policy establishes the handling protocol for flight telemetry, sensor logs, and kinematics simulation parameters.
          </p>
        </div>

        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">2. TELEMETRY AND AVIONICS DATA INGESTION</h2>
          <p className="text-[#786c5f]">
            The system processes technical vehicle parameters including WGS84 coordinates (latitude, longitude, altitude), 6-DOF simulation state vectors, battery BMS cell metrics, 4-in-1 ESC RPM readouts, and atmospheric sensor inputs.
          </p>
        </div>

        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">3. LOCAL CLIENT EVALUATION</h2>
          <p className="text-[#786c5f]">
            Under <b>Simulation Mode</b>, all flight kinematics, LSTM trajectory horizon forecasts, and XGBoost anomaly evaluations execute strictly in local memory. No telemetry packets are transmitted to external marketing or third-party networks.
          </p>
        </div>

        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">4. CONNECTED TELEMETRY ENDPOINTS</h2>
          <p className="text-[#786c5f]">
            When linked to remote flight hardware via WebSocket or REST gateways, data transmission routes directly to the operator-specified network address defined in System Configuration.
          </p>
        </div>

        <div className="p-3 bg-[#efeae2] border border-[#ded5c7] rounded-xl text-[10px] text-[#786c5f]">
          <span className="font-bold text-[#1c1917] block mb-0.5">SPECIFICATION METADATA [RESEARCH PROTOTYPE]:</span>
          <span>Entity: [Autonomous Systems & Avionics Research Laboratory]</span><br />
          <span>Endpoint: [telemetry-admin@greenvision-digitaltwin.local]</span><br />
          <span>Document Version: 1.2.0-OPS (September 2026)</span>
        </div>
      </div>
    </div>
  );
};

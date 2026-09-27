import React from 'react';

export const TermsConditions: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto font-mono text-[#5c544d] space-y-4 select-none">
      <div className="flex items-center space-x-2 pb-3 border-b border-[#ddd5c7] text-[#1c1917]">
        <div className="w-2 h-4 bg-[#d8533c] rounded" />
        <h1 className="text-xs font-bold uppercase tracking-wider">PROTOTYPE USAGE & SIMULATION TERMS</h1>
      </div>

      <div className="bg-[#faf8f5] p-5 border border-[#ddd5c7] rounded-2xl space-y-4 text-[11px] leading-relaxed shadow-xs">
        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">1. RESEARCH PROTOTYPE STATUS</h2>
          <p className="text-[#786c5f]">
            This software interface is provided as an engineering prototype for aerospace telemetry visualization, digital twin synchronization, and predictive anomaly classification. It is engineered for simulation, flight validation, and test monitoring.
          </p>
        </div>

        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">2. FAULT INJECTION SAFETY INTERLOCK</h2>
          <p className="text-[#786c5f]">
            The fault injection tools provided in this interface operate exclusively within the simulation safety envelope to validate AI anomaly models and failsafe routines. They do not send destructive commands to physical flight hardware without secondary hardware interlocks.
          </p>
        </div>

        <div>
          <h2 className="text-[#1c1917] font-bold text-xs mb-1">3. PREDICTIVE INFERENCE DISCLAIMER</h2>
          <p className="text-[#786c5f]">
            AI prediction horizons (LSTM) and anomaly classifications (XGBoost) represent statistical analytical estimations. In live flight operations, primary physical fail-safes and human-in-the-loop oversight remain mandatory.
          </p>
        </div>

        <div className="p-3 bg-[#efeae2] border border-[#ded5c7] rounded-xl text-[10px] text-[#786c5f]">
          <span className="font-bold text-[#1c1917] block mb-0.5">LEGAL SPECIFICATION [PROTOTYPE NOTICE]:</span>
          <span>Jurisdiction: [Applicable National / Regional Civil Aviation Authority]</span><br />
          <span>License Classification: Research & Engineering Prototype License</span><br />
          <span>Release: September 2026</span>
        </div>
      </div>
    </div>
  );
};

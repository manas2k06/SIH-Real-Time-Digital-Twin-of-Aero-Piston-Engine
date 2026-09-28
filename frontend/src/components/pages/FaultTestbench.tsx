import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { FaultType } from '../../types/simulation';

export const FaultTestbench: React.FC = () => {
  const { activeFaults, injectFault, clearFault, clearAllFaults } = useTelemetry();

  const [selectedSubsystem, setSelectedSubsystem] = React.useState<string>('ALL');

  const faultCatalog: Array<{
    type: FaultType;
    name: string;
    subsystem: string;
    category: string;
    severity: 'CRITICAL' | 'WARN';
    impact: string;
    expectedXgbDetection: string;
  }> = [
    // Turbocharger & TCU
    {
      type: 'TURBO_OVERBOOST',
      name: 'TURBO WASTEGATE JAMMED CLOSED / MANIFOLD OVERBOOST',
      subsystem: 'TURBOCHARGER & TCU',
      category: 'TURBO',
      severity: 'CRITICAL',
      impact: 'Wastegate fails to relieve turbine energy; manifold pressure surges to 43.8 inHg (+0.48 bar), exceeding 39.9 inHg limit. Severe IAT rise.',
      expectedXgbDetection: 'Turbo Induction anomaly score -> 0.97 (CRITICAL)',
    },
    {
      type: 'TURBO_WASTEGATE_STUCK',
      name: 'TURBOCHARGER WASTEGATE ACTUATOR STUCK OPEN',
      subsystem: 'TURBOCHARGER & TCU',
      category: 'TURBO',
      severity: 'WARN',
      impact: 'Wastegate stuck in open bypass position; unable to build manifold pressure (MAP collapses to ambient vacuum ~27.5 inHg).',
      expectedXgbDetection: 'Turbo Induction anomaly score -> 0.94 (CRITICAL)',
    },
    {
      type: 'TCU_FAULT',
      name: 'TURBOCHARGER TCU SERVO & SENSOR COMMUNICATION FAULT',
      subsystem: 'TCU ELECTRONICS',
      category: 'TURBO',
      severity: 'WARN',
      impact: 'Servo actuator feedback lost; boost fallback to mechanical safety stop, amber caution lamp illuminated.',
      expectedXgbDetection: 'Turbo Induction anomaly score -> 0.94 (CRITICAL)',
    },
    {
      type: 'TURBO_DEGRADATION',
      name: 'TURBOCHARGER COMPRESSOR AERO & JOURNAL BEARING DRAG',
      subsystem: 'TURBOCHARGER & TCU',
      category: 'TURBO',
      severity: 'WARN',
      impact: 'Compressor aerodynamic fouling & journal drag; turbo speed limited to 58,000 RPM, boost spool lag, power reduced ~20%.',
      expectedXgbDetection: 'Turbo Induction warning score -> 0.58 (WARNING)',
    },

    // Fuel System & Twin Bing 64 Carburetors
    {
      type: 'FUEL_SYSTEM_LEAK',
      name: 'FUEL REGULATOR PRESSURE DROP & DELIVERY LINE LEAK',
      subsystem: 'FUEL SYSTEM & REGULATOR',
      category: 'FUEL',
      severity: 'CRITICAL',
      impact: 'Diaphragm regulator leak; delivery pressure drops to 1.78 bar (below airbox+0.25 bar differential), fuel burn rate surges 1.6x.',
      expectedXgbDetection: 'Fuel Delivery & Carburetors anomaly -> 0.96 (CRITICAL)',
    },
    {
      type: 'FUEL_PUMP_1_FAILURE',
      name: 'PRIMARY 12V ELECTRIC FUEL PUMP 1 CUTOFF',
      subsystem: 'FUEL PUMPS & MANIFOLD',
      category: 'FUEL',
      severity: 'WARN',
      impact: 'Primary 12V vane pump electrical trip; automatic failover to redundant standby fuel pump 2.',
      expectedXgbDetection: 'Fuel Delivery & Carburetors warning -> 0.64 (WARNING)',
    },
    {
      type: 'FUEL_PUMP_2_FAILURE',
      name: 'AUXILIARY STANDBY FUEL PUMP 2 ELECTRICAL TRIP',
      subsystem: 'FUEL PUMPS & MANIFOLD',
      category: 'FUEL',
      severity: 'WARN',
      impact: 'Secondary electric fuel pump offline; loss of redundant fuel delivery capability.',
      expectedXgbDetection: 'Fuel Delivery & Carburetors warning -> 0.64 (WARNING)',
    },
    {
      type: 'CARBURETOR_IMBALANCE',
      name: 'TWIN BING 64 CARBURETOR THROTTLE IMBALANCE',
      subsystem: 'INDUCTION & CARBURETORS',
      category: 'FUEL',
      severity: 'WARN',
      impact: 'Twin Bing 64 throttle linkage synchronization skew; balance drops to 71.4%, differential bank vacuum and CHT divergence.',
      expectedXgbDetection: 'Fuel Delivery & Carburetors warning -> 0.64 (WARNING)',
    },

    // Dual Ducati CDI Ignition
    {
      type: 'CYLINDER_MISFIRE',
      name: 'CYLINDER 3 IGNITION MISFIRE / SPARK DROP',
      subsystem: 'DUAL CDI IGNITION',
      category: 'IGNITION',
      severity: 'WARN',
      impact: 'Dual spark drop on cylinder 3; Cyl 3 EGT drops -135°C, CHT drops -42°C, rotational RPM hunting and vibration spike.',
      expectedXgbDetection: 'Combustion Misfire & Ignition anomaly -> 0.90 (CRITICAL)',
    },
    {
      type: 'IGNITION_A_FAILURE',
      name: 'DUCATI CDI IGNITION CIRCUIT A DROPOUT',
      subsystem: 'DUAL CDI IGNITION',
      category: 'IGNITION',
      severity: 'WARN',
      impact: 'Primary CDI circuit A shutdown; engine operating on circuit B with classic single-CDI ~75 RPM drop.',
      expectedXgbDetection: 'Ignition System warning -> 0.72 (WARNING)',
    },
    {
      type: 'IGNITION_B_FAILURE',
      name: 'DUCATI CDI IGNITION CIRCUIT B DROPOUT',
      subsystem: 'DUAL CDI IGNITION',
      category: 'IGNITION',
      severity: 'WARN',
      impact: 'Secondary CDI circuit B shutdown; engine operating on circuit A with classic single-CDI ~75 RPM drop.',
      expectedXgbDetection: 'Ignition System warning -> 0.72 (WARNING)',
    },

    // Mixed Cooling System
    {
      type: 'ENGINE_OVERHEATING',
      name: 'ROTAX 914F THERMODYNAMIC CORE RUNAWAY (CHT > 135°C)',
      subsystem: 'COMBUSTION / COOLING',
      category: 'COOLING',
      severity: 'CRITICAL',
      impact: 'Severe thermodynamic runaway; cylinder head temperature exceeds 135°C redline and coolant loop overheats.',
      expectedXgbDetection: 'Thermodynamic Core anomaly -> 0.96 (CRITICAL)',
    },
    {
      type: 'COOLANT_TEMP_RISE',
      name: 'CYLINDER HEAD COOLANT OVERHEAT SURGE (> 115°C)',
      subsystem: 'LIQUID COOLING LOOP',
      category: 'COOLING',
      severity: 'CRITICAL',
      impact: 'Closed-loop coolant expansion tank thermal runaway; exit temperature exceeds 115°C redline.',
      expectedXgbDetection: 'Thermodynamic Core anomaly -> 0.96 (CRITICAL)',
    },
    {
      type: 'REDUCED_COOLANT_FLOW',
      name: 'COOLANT CIRCULATION PUMP CAVITATION & FLOW LOSS (< 18 L/MIN)',
      subsystem: 'LIQUID COOLING LOOP',
      category: 'COOLING',
      severity: 'WARN',
      impact: 'Water pump cavitation or coolant circuit blockage; flow drops below 18 L/min, rear cylinders CHT surges +38°C.',
      expectedXgbDetection: 'Thermodynamic Core warning -> 0.68 (WARNING)',
    },

    // Dry-Sump Lubrication
    {
      type: 'OIL_PRESSURE_LOSS',
      name: 'LUBRICATION PUMP LOSS / PRESSURE DROP (< 1.5 BAR)',
      subsystem: 'LUBRICATION HYDRAULICS',
      category: 'LUBRICATION',
      severity: 'CRITICAL',
      impact: 'Oil pressure relief valve sticking or scavenge failure; oil pressure collapses to 1.1 bar (< 1.5 bar threshold).',
      expectedXgbDetection: 'Lubrication System anomaly -> 0.95 (CRITICAL)',
    },
    {
      type: 'HIGH_OIL_TEMP',
      name: 'OIL COOLER BYPASS JAM / THERMAL SATURATION (> 130°C)',
      subsystem: 'LUBRICATION HYDRAULICS',
      category: 'LUBRICATION',
      severity: 'CRITICAL',
      impact: 'Oil cooler bypass valve failure or airflow obstruction; oil temperature surges beyond 130°C redline.',
      expectedXgbDetection: 'Lubrication System anomaly -> 0.95 (CRITICAL)',
    },
    {
      type: 'OIL_SYSTEM_DEGRADATION',
      name: 'OIL SCAVENGE AERATION & MAGNETIC CHIP PARTICULATE',
      subsystem: 'LUBRICATION HYDRAULICS',
      category: 'LUBRICATION',
      severity: 'WARN',
      impact: 'Dry-sump scavenge aeration and magnetic drain plug fine metal particulate; oil pressure oscillates ±0.6 bar.',
      expectedXgbDetection: 'Lubrication System warning -> 0.62 (WARNING)',
    },

    // Reduction Gearbox (2.43:1) & Mechanical
    {
      type: 'GEARBOX_VIBRATION',
      name: 'PROPELLER REDUCTION GEARBOX FLUTTER (> 6.0 MM/S)',
      subsystem: 'REDUCTION GEARBOX (2.43:1)',
      category: 'GEARBOX',
      severity: 'CRITICAL',
      impact: 'Propeller reduction gearbox dog clutch overload flutter; vibration surges to 6.42 mm/s RMS, casing temp rises.',
      expectedXgbDetection: 'Reduction Gearbox & Prop anomaly -> 0.93 (CRITICAL)',
    },
    {
      type: 'BEARING_DEGRADATION',
      name: 'CRANKSHAFT PLAIN JOURNAL HYDRODYNAMIC BEARING WEAR',
      subsystem: 'MECHANICAL INTEGRITY',
      category: 'GEARBOX',
      severity: 'CRITICAL',
      impact: 'Crankshaft plain journal hydrodynamic bearing wear; vibration surges to 6.75 mm/s RMS, oil pressure sags.',
      expectedXgbDetection: 'Mechanical & Reduction Gearbox anomaly -> 0.93 (CRITICAL)',
    },
    {
      type: 'GEARBOX_TEMP_INCREASE',
      name: 'REDUCTION GEARBOX CASING OVERHEATING (> 115°C)',
      subsystem: 'REDUCTION GEARBOX (2.43:1)',
      category: 'GEARBOX',
      severity: 'WARN',
      impact: 'Gearbox casing temperature exceeds 115°C; tooth friction or marginal lubrication.',
      expectedXgbDetection: 'Reduction Gearbox & Prop warning -> 0.60 (WARNING)',
    },
    {
      type: 'VIBRATION_ANOMALY',
      name: 'ENGINE MOUNT DAMPER DEGRADATION / HARMONIC VIBRATION',
      subsystem: 'MECHANICAL INTEGRITY',
      category: 'GEARBOX',
      severity: 'WARN',
      impact: 'Engine mount rubber damper fatigue or dynamic propeller imbalance; 1X/2X harmonics exceed 5.5 mm/s RMS.',
      expectedXgbDetection: 'Mechanical Vibration warning -> 0.60 (WARNING)',
    },

    // Exhaust System
    {
      type: 'EXHAUST_RESTRICTION',
      name: 'EXHAUST COLLECTOR / PRE-TURBINE RESTRICTION (EGT > 950°C)',
      subsystem: 'EXHAUST SYSTEM',
      category: 'EXHAUST',
      severity: 'CRITICAL',
      impact: 'Pre-turbine collector restriction; exhaust backpressure surges, all cylinders EGT surge to 965°C (> 950°C redline).',
      expectedXgbDetection: 'Exhaust System anomaly -> 0.95 (CRITICAL)',
    },
    {
      type: 'CYLINDER_EGT_IMBALANCE',
      name: 'CYLINDER BANK EGT SPREAD IMBALANCE (Δ > 85°C)',
      subsystem: 'EXHAUST SYSTEM',
      category: 'EXHAUST',
      severity: 'WARN',
      impact: 'Carburetor jetting or bank mixture skew; differential EGT between banks exceeds 85°C (limit 40°C).',
      expectedXgbDetection: 'Exhaust System warning -> 0.65 (WARNING)',
    },

    // Electrical Generation
    {
      type: 'GENERATOR_FAILURE',
      name: 'INTEGRATED 250W AC GENERATOR CUTOUT',
      subsystem: 'ELECTRICAL POWER BUS',
      category: 'ELECTRICAL',
      severity: 'WARN',
      impact: 'Internal AC stator generator loss (0W); avionics and TCU running on buffer battery drain.',
      expectedXgbDetection: 'Electrical System warning -> 0.65 (WARNING)',
    },
    {
      type: 'ALTERNATOR_FAILURE',
      name: 'EXTERNAL 40A ENGINE ALTERNATOR REGULATOR DROPOUT',
      subsystem: 'ELECTRICAL POWER BUS',
      category: 'ELECTRICAL',
      severity: 'WARN',
      impact: 'External 40A / 28V engine-driven alternator regulator trip (0A); main DC bus voltage sags from 28.4V to 24.1V.',
      expectedXgbDetection: 'Electrical System warning -> 0.65 (WARNING)',
    },
  ];

  const isFaultActive = (type: FaultType) => activeFaults.some((f) => f.type === type);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto select-none font-mono">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ddd5c7]">
        <div className="flex items-center space-x-2">
          <div>
            <h1 className="text-sm font-bold text-[#1c1917] tracking-wide">
              Rotax 914 F Subsystem Fault Injection & Verification Testbench
            </h1>
            <p className="text-[10px] text-[#786c5f]">
              25 Authentic Failure Modes across 8 Physical Engine Subsystems with Real-Time Anomaly Attribution
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span>
            ACTIVE INJECTIONS: <strong className="text-[#1c1917]">{activeFaults.length}</strong>
          </span>
          {activeFaults.length > 0 && (
            <button
              onClick={clearAllFaults}
              className="text-[#dc2626] hover:underline uppercase font-bold text-[11px]"
            >
              [ RESET ALL ACTIVE FAULTS ]
            </button>
          )}
        </div>
      </div>

      {/* Subsystem Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'ALL SUB-SYSTEMS (25)' },
          { id: 'TURBO', label: 'TURBO & TCU (4)' },
          { id: 'FUEL', label: 'FUEL & CARBS (4)' },
          { id: 'IGNITION', label: 'DUAL CDI (3)' },
          { id: 'COOLING', label: 'COOLING (3)' },
          { id: 'LUBRICATION', label: 'LUBRICATION (3)' },
          { id: 'GEARBOX', label: 'GEARBOX / MECH (4)' },
          { id: 'EXHAUST', label: 'EXHAUST (2)' },
          { id: 'ELECTRICAL', label: 'ELECTRICAL (2)' },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubsystem(sub.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-[10px] transition-all ${
              selectedSubsystem === sub.id
                ? 'bg-[#1c1917] text-white shadow-xs'
                : 'bg-[#efeae2] text-[#786c5f] hover:text-[#1c1917] hover:bg-[#e4ddd0]'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faultCatalog
          .filter((f) => selectedSubsystem === 'ALL' || f.category === selectedSubsystem)
          .map((fault) => {
            const active = isFaultActive(fault.type);

          return (
            <div
              key={fault.type}
              className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                active
                  ? 'bg-[#fee2e2]/60 border-[#fca5a5]'
                  : 'bg-[#faf8f5] border-[#ddd5c7] hover:border-[#b8aca0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2 text-[10px]">
                  <span className="font-bold text-[#786c5f]">{fault.subsystem}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                      active ? 'bg-[#dc2626] text-white' : 'bg-[#efeae2] text-[#5c544d]'
                    }`}
                  >
                    {active ? 'INJECTED / ARMED' : 'STANDBY'}
                  </span>
                </div>

                <div className="mt-2 font-bold text-[#1c1917] text-xs">
                  {fault.name}
                </div>

                <p className="text-[11px] text-[#5c544d] mt-1.5 leading-relaxed font-sans">
                  {fault.impact}
                </p>

                <div className="mt-2 text-[10px] text-[#786c5f] bg-[#efeae2]/70 p-2 rounded-xl border border-[#ded5c7]">
                  <strong className="text-[#1c1917]">EXPECTED ATTRIBUTION:</strong> {fault.expectedXgbDetection}
                </div>
              </div>

              <div className="pt-2 border-t border-[#e5dfd3] flex justify-end">
                {active ? (
                  <button
                    onClick={() => clearFault(fault.type)}
                    className="px-4 py-1.5 bg-[#dc2626] text-white rounded-full text-xs font-bold hover:bg-[#b91c1c] transition-all shadow-xs"
                  >
                    DISARM FAULT
                  </button>
                ) : (
                  <button
                    onClick={() => injectFault(fault.type, 1.0)}
                    className="px-4 py-1.5 bg-white text-[#1c1917] border border-[#ded5c7] rounded-full text-xs font-bold hover:bg-[#efeae2] transition-all shadow-xs"
                  >
                    INJECT FAULT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

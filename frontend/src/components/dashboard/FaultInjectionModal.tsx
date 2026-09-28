import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { FaultType } from '../../types/simulation';
import { X } from 'lucide-react';

interface FaultInjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaultInjectionModal: React.FC<FaultInjectionModalProps> = ({ isOpen, onClose }) => {
  const { activeFaults, injectFault, clearFault, clearAllFaults } = useTelemetry();

  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const faultsList: Array<{
    type: FaultType;
    title: string;
    description: string;
    system: string;
    category: 'TURBO' | 'FUEL' | 'IGNITION' | 'COOLING' | 'LUBRICATION' | 'GEARBOX' | 'EXHAUST' | 'ELECTRICAL';
    severityLevel: 'CRITICAL' | 'WARN';
  }> = [
    // Turbocharger & TCU
    {
      type: 'TURBO_OVERBOOST',
      title: 'TURBO WASTEGATE JAMMED CLOSED / MANIFOLD OVERBOOST',
      description: 'Wastegate fails to open; manifold pressure exceeds 39.9 inHg takeoff limit with severe IAT rise.',
      system: 'TURBO & TCU',
      category: 'TURBO',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'TURBO_WASTEGATE_STUCK',
      title: 'TURBOCHARGER WASTEGATE ACTUATOR STUCK OPEN',
      description: 'Loss of manifold boost pressure (MAP falls to atmospheric vacuum); unable to maintain climb/cruise power.',
      system: 'TURBO & TCU',
      category: 'TURBO',
      severityLevel: 'WARN',
    },
    {
      type: 'TCU_FAULT',
      title: 'TURBOCHARGER TCU SERVO & SENSOR COMMUNICATION FAULT',
      description: 'Electronic Turbocharger Control Unit servo feedback failure; trips caution lamp and forces fallback boost.',
      system: 'TURBO & TCU',
      category: 'TURBO',
      severityLevel: 'WARN',
    },
    {
      type: 'TURBO_DEGRADATION',
      title: 'TURBOCHARGER COMPRESSOR AERO & JOURNAL BEARING DRAG',
      description: 'Turbine drag and aerodynamic fouling; spool-up lag and loss of rated takeoff power.',
      system: 'TURBO & TCU',
      category: 'TURBO',
      severityLevel: 'WARN',
    },

    // Fuel System & Twin Bing 64 Carburetors
    {
      type: 'FUEL_SYSTEM_LEAK',
      title: 'FUEL DELIVERY LINE LEAK & REGULATOR PRESSURE DROP',
      description: 'Diaphragm fuel regulator pressure collapses below airbox+0.25 bar nominal with fuel delivery leak.',
      system: 'FUEL SYSTEM',
      category: 'FUEL',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'FUEL_PUMP_1_FAILURE',
      title: 'PRIMARY 12V ELECTRIC FUEL PUMP 1 CUTOFF',
      description: 'Primary 12V vane pump electrical trip; automatic switchover to redundant standby fuel pump 2.',
      system: 'FUEL SYSTEM',
      category: 'FUEL',
      severityLevel: 'WARN',
    },
    {
      type: 'FUEL_PUMP_2_FAILURE',
      title: 'AUXILIARY STANDBY FUEL PUMP 2 ELECTRICAL TRIP',
      description: 'Secondary electric fuel pump offline; loss of redundant fuel delivery capability.',
      system: 'FUEL SYSTEM',
      category: 'FUEL',
      severityLevel: 'WARN',
    },
    {
      type: 'CARBURETOR_IMBALANCE',
      title: 'TWIN BING 64 CARBURETOR THROTTLE / VACUUM IMBALANCE',
      description: 'Mechanical linkage synchronization skew between carb 1 (cyl 1/3) and carb 2 (cyl 2/4); trips cylinder CHT divergence.',
      system: 'CARBURETORS',
      category: 'FUEL',
      severityLevel: 'WARN',
    },

    // Dual Ducati CDI Ignition
    {
      type: 'CYLINDER_MISFIRE',
      title: 'CYLINDER 3 SPARK PLUG FOULING & IGNITION MISFIRE',
      description: 'Dual CDI spark failure on cylinder 3; causes severe temperature drop on Cyl 3 and rotational speed hunting.',
      system: 'CDI IGNITION',
      category: 'IGNITION',
      severityLevel: 'WARN',
    },
    {
      type: 'IGNITION_A_FAILURE',
      title: 'DUCATI CDI IGNITION CIRCUIT A DROPOUT',
      description: 'Primary capacitor discharge ignition circuit A offline; engine running on circuit B with single-CDI RPM droop (~75 RPM).',
      system: 'CDI IGNITION',
      category: 'IGNITION',
      severityLevel: 'WARN',
    },
    {
      type: 'IGNITION_B_FAILURE',
      title: 'DUCATI CDI IGNITION CIRCUIT B DROPOUT',
      description: 'Secondary capacitor discharge ignition circuit B offline; engine running on circuit A with single-CDI RPM droop (~75 RPM).',
      system: 'CDI IGNITION',
      category: 'IGNITION',
      severityLevel: 'WARN',
    },

    // Mixed Cooling System
    {
      type: 'ENGINE_OVERHEATING',
      title: 'ROTAX 914F THERMODYNAMIC CORE OVERHEATING (CHT > 135°C)',
      description: 'Triggers CHT thermal runaway beyond 135°C limit and coolant loop overheating beyond 115°C safety limit.',
      system: 'COOLING',
      category: 'COOLING',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'COOLANT_TEMP_RISE',
      title: 'CYLINDER HEAD COOLANT OVERHEAT SURGE (> 115°C)',
      description: 'Closed-loop coolant expansion tank thermal runaway; exceeds 115°C cylinder head exit limit.',
      system: 'COOLING',
      category: 'COOLING',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'REDUCED_COOLANT_FLOW',
      title: 'COOLANT CIRCULATION PUMP CAVITATION & FLOW LOSS (< 18 L/MIN)',
      description: 'Coolant circulation flow restriction; induces rapid cylinder head thermal gradient divergence on rear cylinders.',
      system: 'COOLING',
      category: 'COOLING',
      severityLevel: 'WARN',
    },

    // Dry-Sump Lubrication
    {
      type: 'OIL_PRESSURE_LOSS',
      title: 'LUBRICATION PUMP LOSS / PRESSURE DROP (< 1.5 BAR)',
      description: 'Simulates scavenge failure; oil pressure plunges below 1.5 bar with rapid bearing temperature rise.',
      system: 'LUBRICATION',
      category: 'LUBRICATION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'HIGH_OIL_TEMP',
      title: 'OIL COOLER BYPASS JAM / THERMAL SATURATION (> 130°C)',
      description: 'Oil temperature surges beyond 130°C redline; thermal viscosity breakdown and bearing film collapse hazard.',
      system: 'LUBRICATION',
      category: 'LUBRICATION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'OIL_SYSTEM_DEGRADATION',
      title: 'OIL SCAVENGE AERATION & MAGNETIC CHIP WARNING',
      description: 'Foaming in dry-sump tank and fine particulate on magnetic drain plug; fluctuating oil pressure.',
      system: 'LUBRICATION',
      category: 'LUBRICATION',
      severityLevel: 'WARN',
    },

    // Reduction Gearbox (2.43:1) & Mechanical
    {
      type: 'GEARBOX_VIBRATION',
      title: 'PROPELLER REDUCTION GEARBOX MECHANICAL FLUTTER (> 6.0 MM/S)',
      description: 'Dog clutch overload vibration spike (> 6.0 mm/s RMS) and casing temperature surge (> 100°C).',
      system: 'GEARBOX',
      category: 'GEARBOX',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'BEARING_DEGRADATION',
      title: 'CRANKSHAFT PLAIN JOURNAL HYDRODYNAMIC BEARING WEAR',
      description: 'Hydrodynamic bearing wear inducing 1X vibration harmonics (> 6.5 mm/s) and elevated oil temperature.',
      system: 'MECHANICAL',
      category: 'GEARBOX',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'GEARBOX_TEMP_INCREASE',
      title: 'REDUCTION GEARBOX CASING OVERHEATING (> 115°C)',
      description: 'Gearbox casing temperature exceeding 115°C; tooth friction or inadequate lubrication.',
      system: 'GEARBOX',
      category: 'GEARBOX',
      severityLevel: 'WARN',
    },
    {
      type: 'VIBRATION_ANOMALY',
      title: 'ENGINE MOUNT DAMPER DEGRADATION / HARMONIC VIBRATION',
      description: 'Severe 1X-2X crankshaft harmonic vibration anomaly exceeding 5.5 mm/s RMS.',
      system: 'MECHANICAL',
      category: 'GEARBOX',
      severityLevel: 'WARN',
    },

    // Exhaust System
    {
      type: 'EXHAUST_RESTRICTION',
      title: 'EXHAUST COLLECTOR / PRE-TURBINE RESTRICTION (EGT > 950°C)',
      description: 'Pre-turbine backpressure surge; EGT rises above 950°C redline and engine power chokes by ~28%.',
      system: 'EXHAUST',
      category: 'EXHAUST',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'CYLINDER_EGT_IMBALANCE',
      title: 'CYLINDER BANK EGT SPREAD IMBALANCE (Δ > 85°C)',
      description: 'Combustion bank mixture skew; differential EGT between banks exceeds 85°C.',
      system: 'EXHAUST',
      category: 'EXHAUST',
      severityLevel: 'WARN',
    },

    // Electrical Generation
    {
      type: 'GENERATOR_FAILURE',
      title: 'INTEGRATED 250W AC GENERATOR CUTOUT',
      description: 'Internal engine AC stator output drops to 0W; avionics and TCU running on buffer battery drain.',
      system: 'ELECTRICAL',
      category: 'ELECTRICAL',
      severityLevel: 'WARN',
    },
    {
      type: 'ALTERNATOR_FAILURE',
      title: 'EXTERNAL 40A ENGINE ALTERNATOR REGULATOR DROPOUT',
      description: 'Engine-driven 28V alternator dropout; main DC bus voltage sags to battery buffer level.',
      system: 'ELECTRICAL',
      category: 'ELECTRICAL',
      severityLevel: 'WARN',
    },
  ];

  const isFaultActive = (type: FaultType) => activeFaults.some((f) => f.type === type);

  const toggleFault = (type: FaultType) => {
    if (isFaultActive(type)) {
      clearFault(type);
    } else {
      injectFault(type, 1.0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5dfd3] bg-[#efeae2]">
          <div className="flex items-center space-x-2">
            <div>
              <h2 className="text-xs font-bold text-[#1c1917] tracking-wide">
                Subsystem Fault Injection Bench · Safety Interlock
              </h2>
              <p className="text-[10px] text-[#786c5f]">
                Controlled hardware failure injection for Digital Twin & Anomaly Model Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#786c5f] hover:text-[#1c1917] hover:bg-[#ded5c7] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-[#e5dfd3]">
            <span className="text-[#786c5f]">
              ACTIVE INJECTIONS: <strong className="text-[#1c1917] font-bold">{activeFaults.length}</strong>
            </span>
            {activeFaults.length > 0 && (
              <button
                onClick={clearAllFaults}
                className="text-[#dc2626] hover:underline text-[9px] uppercase font-bold"
              >
                [ RESET ALL ACTIVE FAULTS ]
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[9px] scrollbar-none">
            {[
              { id: 'ALL', label: 'ALL FAULTS (25)' },
              { id: 'TURBO', label: 'TURBO & TCU' },
              { id: 'FUEL', label: 'FUEL & CARBS' },
              { id: 'IGNITION', label: 'DUAL CDI' },
              { id: 'COOLING', label: 'COOLING' },
              { id: 'LUBRICATION', label: 'LUBRICATION' },
              { id: 'GEARBOX', label: 'GEARBOX' },
              { id: 'EXHAUST', label: 'EXHAUST' },
              { id: 'ELECTRICAL', label: 'ELECTRICAL' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1c1917] text-white shadow-xs'
                    : 'bg-[#efeae2] text-[#786c5f] hover:text-[#1c1917] hover:bg-[#e4ddd0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {faultsList
              .filter((item) => selectedCategory === 'ALL' || item.category === selectedCategory)
              .map((item) => {
                const active = isFaultActive(item.type);

                return (
                  <div
                    key={item.type}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 transition-all ${
                      active
                        ? 'bg-[#fee2e2]/70 border-[#fca5a5]'
                        : 'bg-white border-[#ded5c7] hover:border-[#b8aca0]'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#efeae2] text-[#5c544d] border border-[#ded5c7] font-bold">
                          {item.system}
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${
                            item.severityLevel === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.severityLevel}
                        </span>
                        <span className="font-bold text-[#1c1917] text-[11px]">{item.title}</span>
                      </div>
                      <p className="text-[#786c5f] text-[10px] leading-relaxed">{item.description}</p>
                    </div>

                    <button
                      onClick={() => toggleFault(item.type)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-bold shrink-0 transition-all ${
                        active
                          ? 'bg-[#dc2626] text-white shadow-xs'
                          : 'bg-[#efeae2] text-[#1c1917] border border-[#ded5c7] hover:bg-white'
                      }`}
                    >
                      {active ? 'DISARM' : 'INJECT'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#e5dfd3] bg-[#efeae2] flex justify-between items-center text-[10px] text-[#786c5f]">
          <span>SAFETY STATUS: OPERATIONAL INTERLOCK ACTIVE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#1c1917] text-white font-bold hover:bg-[#38332f] transition-all"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

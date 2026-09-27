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

  const faultsList: Array<{
    type: FaultType;
    title: string;
    description: string;
    system: string;
    severityLevel: 'CRITICAL' | 'WARN';
  }> = [
    {
      type: 'MOTOR_1_FAILURE',
      title: 'MOTOR 1 (FRONT-RIGHT) COMPLETE CUTOFF / ESC SHUTDOWN',
      description: 'Zeroes M1 thrust, forces opposing motors to 95% compensation, tilts roll attitude, trips XGBoost propulsion anomaly.',
      system: 'PROPULSION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'MOTOR_3_DEGRADATION',
      title: 'MOTOR 3 (REAR-RIGHT) BEARING FLUTTER & THERMAL SPIKE',
      description: 'Induces harmonic RPM oscillation and raises coil temperature to 68.5°C.',
      system: 'PROPULSION',
      severityLevel: 'WARN',
    },
    {
      type: 'BATTERY_SAG',
      title: 'BATTERY 6S CELL 4 VOLTAGE SAG UNDER LOAD',
      description: 'Drops pack voltage to 20.8V under high-amp load and triggers BMS thermal runaway warning.',
      system: 'POWER/BMS',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'GPS_SIGNAL_LOSS',
      title: 'GNSS SATELLITE CONSTELLATION JAMMING / LOCK LOSS',
      description: 'Drops tracked satellites from 18 to 0; EKF transitions to dead reckoning.',
      system: 'NAVIGATION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'SEVERE_WIND_SHEAR',
      title: 'SEVERE CROSSWIND SHEAR GUST (21.5 M/S)',
      description: 'Forces quadcopter into heavy bank angle and increases vibration metrics.',
      system: 'ATMOSPHERE',
      severityLevel: 'WARN',
    },
    {
      type: 'BAROMETER_DRIFT',
      title: 'STATIC PORT OBSTRUCTION BAROMETER DRIFT (+15M)',
      description: 'Creates altitude innovation discrepancy between Baro and GNSS/Optical Flow.',
      system: 'SENSORS',
      severityLevel: 'WARN',
    },
    {
      type: 'IMU_SENSOR_NOISE',
      title: 'IMU ACCELEROMETER & GYRO NOISE MULTIPLIER',
      description: 'Injects high-frequency sensor noise across X/Y/Z axes.',
      system: 'AVIONICS',
      severityLevel: 'WARN',
    },
    {
      type: 'ENGINE_OVERHEATING',
      title: 'ROTAX 914F THERMODYNAMIC OVERHEATING (CHT > 135°C)',
      description: 'Triggers CHT thermal runaway and coolant loop overheating beyond 115°C safety limit.',
      system: 'COMBUSTION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'OIL_PRESSURE_LOSS',
      title: 'LUBRICATION PUMP LOSS / PRESSURE DROP (< 1.5 BAR)',
      description: 'Simulates scavenge failure; oil pressure plunges below 1.5 bar with rapid bearing temperature rise.',
      system: 'LUBRICATION',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'VIBRATION_ANOMALY',
      title: 'CRANKSHAFT 1X-2X HARMONIC VIBRATION SPIKE (> 5.8 MM/S)',
      description: 'Induces severe mechanical vibration anomaly across X/Y/Z tri-axial accelerometer.',
      system: 'MECHANICAL',
      severityLevel: 'WARN',
    },
    {
      type: 'FUEL_SYSTEM_LEAK',
      title: 'FUEL INJECTION RAIL PRESSURE DROP & FLOW LEAK',
      description: 'Rail pressure drops to 1.8 bar while fuel consumption jumps by 60% due to line rupture.',
      system: 'FUEL SYSTEM',
      severityLevel: 'CRITICAL',
    },
    {
      type: 'TURBO_WASTEGATE_STUCK',
      title: 'TURBOCHARGER WASTEGATE ACTUATOR STUCK OPEN',
      description: 'Loss of manifold boost pressure (MAP falls to ambient); unable to maintain takeoff/cruise power.',
      system: 'INDUCTION',
      severityLevel: 'WARN',
    },
    {
      type: 'CYLINDER_MISFIRE',
      title: 'CYLINDER 3 IGNITION MISFIRE / SPARK DROP',
      description: 'Dual CDI failure on cylinder 3; causes severe temperature drop on Cyl 3 and rotational hunting.',
      system: 'IGNITION',
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

          <div className="space-y-2">
            {faultsList.map((item) => {
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

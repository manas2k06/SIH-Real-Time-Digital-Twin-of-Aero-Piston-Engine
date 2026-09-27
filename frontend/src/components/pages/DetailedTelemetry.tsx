import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Flame, 
  Droplet, 
  Wind, 
  Fan, 
  Plus, 
  Lock, 
  Minus,
  Sparkles
} from 'lucide-react';

type SubsystemTab = 
  | 'ALL' 
  | 'OPERATING' 
  | 'LUBRICATION_FUEL' 
  | 'INTAKE_IGNITION' 
  | 'MECHANICAL_VIB' 
  | 'COOLING_ELEC' 
  | 'MAINTENANCE_RUL' 
  | 'AVIONICS';

type BentoFocusTab = 
  | 'COMBUSTION' 
  | 'LUBRICATION' 
  | 'TURBO' 
  | 'COOLING' 
  | 'SENSORS';

// ============================================================================
// MICRO-ANIMATED WIDGETS FOR EACH PARAMETER
// ============================================================================

// 1. Speedometer Animation (RPM)
const SpeedometerAnimation: React.FC<{ rpm: number }> = ({ rpm }) => {
  const clampedRpm = Math.min(6000, Math.max(0, rpm));
  const angle = -120 + (clampedRpm / 6000) * 240;
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full">
        <path
          d="M 8 28 A 13 13 0 1 1 28 28"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 8 28 A 13 13 0 0 1 25 10"
          fill="none"
          stroke="#0284c7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 25 10 A 13 13 0 0 1 28 28"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <g transform={`rotate(${angle} 18 18)`} className="transition-transform duration-300 ease-out">
          <line x1="18" y1="18" x2="18" y2="7" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="18" r="2.8" fill="#0c1524" />
        </g>
      </svg>
    </div>
  );
};

// 2. Reciprocating Piston Animation (Torque)
const PistonAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="7" y="3" width="18" height="26" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
        <g className="animate-[bounce_0.6s_ease-in-out_infinite]">
          <rect x="9" y="5" width="14" height="9" rx="1.5" fill="#0284c7" />
          <line x1="10" y1="7" x2="22" y2="7" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="10" y1="9" x2="22" y2="9" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="16" cy="10" r="1.5" fill="#ffffff" />
          <line x1="16" y1="11" x2="16" y2="23" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="16" cy="24" r="2" fill="#0c1524" />
      </svg>
    </div>
  );
};

// 3. Load Gauge Circular Meter (Engine Load)
const LoadGaugeAnimation: React.FC<{ loadPct: number }> = ({ loadPct }) => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
        <circle cx="16" cy="16" r="10" fill="none" stroke="#cbd5e1" strokeWidth="2.8" />
        <circle
          cx="16"
          cy="16"
          r="10"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.8"
          strokeDasharray="62.8"
          strokeDashoffset={62.8 - (62.8 * Math.min(100, Math.max(0, loadPct))) / 100}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-[8px] font-black text-[#0c1524]">{Math.round(loadPct)}%</span>
    </div>
  );
};

// 4. Power Dynamo Animation (Power kW / HP)
const PowerAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="12" fill="none" stroke="#bae6fd" strokeWidth="2" />
        <g className="animate-spin" style={{ animationDuration: '3s' }}>
          <circle cx="16" cy="16" r="10" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="16 16" />
        </g>
        <path d="M15 7 L12 16 L17 16 L15 25 L21 15 L16 15 Z" fill="#eab308" className="animate-pulse" />
      </svg>
    </div>
  );
};

// 5. Flame Animation (EGT Core / Combustion)
const FlameAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          d="M12 2C9.5 6 6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-3.5-8-6-12z"
          fill="#f97316"
          className="animate-pulse"
        />
        <path
          d="M12 7c-1.5 2.5-3.5 4.5-3.5 7a3.5 3.5 0 0 0 7 0c0-2.5-2-4.5-3.5-7z"
          fill="#facc15"
          className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-80"
        />
      </svg>
    </div>
  );
};

// 6. Hydraulic Pressure Dial (Oil Pressure)
const PressureDialAnimation: React.FC<{ pressureBar: number }> = ({ pressureBar }) => {
  const angle = -100 + (Math.min(7, Math.max(0, pressureBar)) / 7) * 200;
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="12" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.6" />
        <path d="M 9 20 A 10 10 0 0 1 23 12" fill="none" stroke="#10b981" strokeWidth="2.2" />
        <path d="M 23 12 A 10 10 0 0 1 25 18" fill="none" stroke="#ef4444" strokeWidth="2.2" />
        <g transform={`rotate(${angle} 16 16)`} className="transition-transform duration-300">
          <line x1="16" y1="16" x2="16" y2="7" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2" fill="#0c1524" />
        </g>
      </svg>
    </div>
  );
};

// 7. Thermometer with Fluid Bubbles (Oil Temperature)
const ThermometerAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 32" className="w-full h-full">
        <rect x="9" y="3" width="6" height="18" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="12" cy="24" r="5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
        <rect x="10.5" y="10" width="3" height="12" fill="#ef4444" />
        <circle cx="12" cy="24" r="3.8" fill="#ef4444" />
        <circle cx="12" cy="18" r="0.8" fill="#ffffff" className="animate-ping" />
      </svg>
    </div>
  );
};

// 8. Rotating Impeller Pump (Oil Flow & Fuel Flow)
const ImpellerAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full animate-spin" style={{ animationDuration: '1.2s' }}>
        <circle cx="16" cy="16" r="13" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M16 16 Q18 9 23 10 Q19 15 16 16 Z" fill="#0284c7" />
        <path d="M16 16 Q23 18 22 23 Q17 19 16 16 Z" fill="#0284c7" />
        <path d="M16 16 Q14 23 9 22 Q13 17 16 16 Z" fill="#0284c7" />
        <path d="M16 16 Q9 14 10 9 Q15 13 16 16 Z" fill="#0284c7" />
        <circle cx="16" cy="16" r="3" fill="#0c1524" />
      </svg>
    </div>
  );
};

// 9. Spinning Turbocharger Compressor Wheel (Boost MAP)
const TurboCompressorAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <path
          d="M 6 16 A 10 10 0 1 1 24 23 L 28 26 L 25 29 L 20 25 A 10 10 0 0 1 6 16 Z"
          fill="#f1f5f9"
          stroke="#64748b"
          strokeWidth="1.4"
        />
        <g className="animate-spin" style={{ transformOrigin: '16px 16px', animationDuration: '0.8s' }}>
          <circle cx="16" cy="16" r="8" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="16" y1="9" x2="16" y2="23" stroke="#0284c7" strokeWidth="1.8" />
          <line x1="9" y1="16" x2="23" y2="16" stroke="#0284c7" strokeWidth="1.8" />
          <line x1="11" y1="11" x2="21" y2="21" stroke="#0284c7" strokeWidth="1.8" />
          <line x1="11" y1="21" x2="21" y2="11" stroke="#0284c7" strokeWidth="1.8" />
        </g>
        <circle cx="16" cy="16" r="3" fill="#0f172a" />
      </svg>
    </div>
  );
};

// 10. Oscilloscope Vibration Wave (RMS Vibration)
const VibrationSineAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 bg-slate-900 rounded-lg p-0.5 overflow-hidden shadow-inner border border-slate-700">
      <svg viewBox="0 0 32 20" className="w-full h-full">
        <path
          d="M 0 10 Q 4 3, 8 10 T 16 10 T 24 10 T 32 10"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="animate-[pulse_0.9s_ease-in-out_infinite]"
        />
      </svg>
    </div>
  );
};

// 11. Timing Degree Wheel (Injection Timing)
const TimingWheelAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="12" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" strokeDasharray="2 4" />
        <g className="animate-spin" style={{ animationDuration: '4s' }}>
          <line x1="16" y1="4" x2="16" y2="28" stroke="#94a3b8" strokeWidth="1" />
          <line x1="4" y1="16" x2="28" y2="16" stroke="#94a3b8" strokeWidth="1" />
          <line x1="16" y1="16" x2="23" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="16" cy="16" r="2.5" fill="#0c1524" />
      </svg>
    </div>
  );
};

// 12. Alternator Electromagnetic Rotor (Alternator 28V)
const AlternatorAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="13" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="16" cy="7" r="2" fill="#0284c7" />
        <circle cx="8" cy="21" r="2" fill="#0284c7" />
        <circle cx="24" cy="21" r="2" fill="#0284c7" />
        <g className="animate-spin" style={{ animationDuration: '1.5s' }}>
          <rect x="13" y="11" width="6" height="10" rx="1.5" fill="#eab308" />
          <circle cx="16" cy="16" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};

// 13. Altimeter Dial (Altitude)
const AltimeterAnimation: React.FC<{ altitude: number }> = ({ altitude }) => {
  const angle = (altitude % 1000) * 0.36;
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="13" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.4" />
        <line x1="16" y1="5" x2="16" y2="8" stroke="#ffffff" strokeWidth="1" />
        <line x1="27" y1="16" x2="24" y2="16" stroke="#ffffff" strokeWidth="1" />
        <line x1="16" y1="27" x2="16" y2="24" stroke="#ffffff" strokeWidth="1" />
        <line x1="5" y1="16" x2="8" y2="16" stroke="#ffffff" strokeWidth="1" />
        <g transform={`rotate(${angle} 16 16)`}>
          <line x1="16" y1="16" x2="16" y2="7" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};

// 14. Wind Compass Vane (Wind Direction)
const WindCompassAnimation: React.FC<{ dir: number }> = ({ dir }) => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="13" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
        <g transform={`rotate(${dir} 16 16)`} className="transition-transform duration-500">
          <polygon points="16,5 19,16 16,13 13,16" fill="#ef4444" />
          <polygon points="16,27 19,16 16,19 13,16" fill="#64748b" />
          <circle cx="16" cy="16" r="1.5" fill="#0c1524" />
        </g>
      </svg>
    </div>
  );
};

// 15. Rolling Mechanical Hobbs Counter (Flight Hours / Cycles)
const HobbsDrumAnimation: React.FC<{ hours: number }> = ({ hours }) => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 bg-slate-950 rounded-md border border-slate-700 overflow-hidden shadow-inner">
      <div className="flex items-center text-[9px] font-mono font-bold text-white tracking-tighter">
        <span className="text-slate-200">{Math.floor(hours)}</span>
        <span className="text-amber-400 animate-pulse">.{Math.floor((hours % 1) * 10)}</span>
      </div>
    </div>
  );
};

// 16. Streamlines Particle Wave (Airflow / Airspeed)
const StreamlinesAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 20" className="w-full h-full">
        <line x1="2" y1="6" x2="22" y2="6" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="animate-[pulse_0.8s_infinite]" />
        <line x1="8" y1="10" x2="28" y2="10" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" className="animate-[pulse_1.2s_infinite]" />
        <line x1="4" y1="14" x2="24" y2="14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="animate-[pulse_1s_infinite]" />
      </svg>
    </div>
  );
};

// 17. Airworthiness Shield Pulse (RUL & Health)
const ShieldPulseAnimation: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12 2 L20 6 V12 C20 17 12 21 12 21 C12 21 4 17 4 12 V6 Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.6" />
        <path d="M9 12 L11 14 L15 9" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
      </svg>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DetailedTelemetry: React.FC = () => {
  const { telemetry } = useTelemetry();
  
  // Bento view controls & state
  const [bentoTab, setBentoTab] = useState<BentoFocusTab>('COMBUSTION');
  const [matrixTab, setMatrixTab] = useState<SubsystemTab>('ALL');

  // Interactive controls matching the image widgets
  const [targetTemp, setTargetTemp] = useState<number>(115);
  const [targetOilPress, setTargetOilPress] = useState<number>(4.50);
  const [targetMapBoost, setTargetMapBoost] = useState<number>(36.0);
  const [targetCoolantTemp, setTargetCoolantTemp] = useState<number>(85);
  const [targetAlt, setTargetAlt] = useState<number>(120);
  const [isThermostatActive, setIsThermostatActive] = useState<boolean>(true);
  const [activeAction, setActiveAction] = useState<string | null>('FAN');
  const [timeWindow, setTimeWindow] = useState<'30S' | '60S' | '180S'>('60S');
  
  // Handlers for setpoint trim adjustment
  const handleTrimDecrement = () => {
    if (bentoTab === 'COMBUSTION') {
      setTargetTemp((prev) => Math.max(90, prev - 1));
    } else if (bentoTab === 'LUBRICATION') {
      setTargetOilPress((prev) => Math.max(2.0, Number((prev - 0.1).toFixed(2))));
    } else if (bentoTab === 'TURBO') {
      setTargetMapBoost((prev) => Math.max(25.0, Number((prev - 0.5).toFixed(1))));
    } else if (bentoTab === 'COOLING') {
      setTargetCoolantTemp((prev) => Math.max(65, prev - 1));
    } else if (bentoTab === 'SENSORS') {
      setTargetAlt((prev) => Math.max(20, prev - 5));
    }
  };

  const handleTrimIncrement = () => {
    if (bentoTab === 'COMBUSTION') {
      setTargetTemp((prev) => Math.min(135, prev + 1));
    } else if (bentoTab === 'LUBRICATION') {
      setTargetOilPress((prev) => Math.min(6.0, Number((prev + 0.1).toFixed(2))));
    } else if (bentoTab === 'TURBO') {
      setTargetMapBoost((prev) => Math.min(45.0, Number((prev + 0.5).toFixed(1))));
    } else if (bentoTab === 'COOLING') {
      setTargetCoolantTemp((prev) => Math.min(110, prev + 1));
    } else if (bentoTab === 'SENSORS') {
      setTargetAlt((prev) => Math.min(300, prev + 5));
    }
  };

  const handleToggleActuator = (actId: string) => {
    setActiveAction((prev) => (prev === actId ? null : actId));
  };
  
  // Door lock style bank states
  const [portBankArmed, setPortBankArmed] = useState<boolean>(true);
  const [starboardBankArmed, setStarboardBankArmed] = useState<boolean>(true);

  // Energy bar selection
  const [energyFilter, setEnergyFilter] = useState<'LIVE' | '60S' | 'MISSION'>('LIVE');
  const [selectedEnergyBar, setSelectedEnergyBar] = useState<number>(4);

  if (!telemetry) return null;
  const { battery, engine } = telemetry;

  // Key live metrics
  const avgCht = engine?.combustion.cht.average ?? 118.2;
  const maxSafeCht = 135;
  const avgEgt = engine?.combustion.egt.average ?? 825.4;
  const oilPress = engine?.lubrication.oilPressure ?? 3.85;
  const oilTemp = engine?.lubrication.oilTemperature ?? 94.2;
  const fuelFlow = engine?.fuel.fuelFlow ?? 18.4;
  const mapBoost = engine?.intake.map ?? 35.4;
  const vibRms = engine?.vibration.rmsVibration ?? 2.14;
  const vibDomFreq = engine?.vibration.dominantFrequency ?? 88.3;
  const isCriticalFault = engine?.health.faultState === 'FAULT' || (engine?.health.overallEngineHealth ?? 94) < 50;

  // Actuator offsets and dynamic feedback messages
  let actuatorOffset = 0;
  let actuatorStatusMsg = 'ALL SUBSYSTEM ACTUATORS IDLE / AUTO';

  if (bentoTab === 'COMBUSTION') {
    if (activeAction === 'FAN') {
      actuatorOffset = -6.8;
      actuatorStatusMsg = 'AUX BLOWER ACTIVE · 3,400 RPM · -6.8°C CHILL';
    } else if (activeAction === 'HOT') {
      actuatorOffset = +8.4;
      actuatorStatusMsg = 'MANIFOLD HEATER ENGAGED · +8.4°C THERMAL BOOST';
    } else if (activeAction === 'COLD') {
      actuatorOffset = -11.5;
      actuatorStatusMsg = 'RAM-AIR BYPASS OPEN · -11.5°C DRAFT';
    } else if (activeAction === 'SCAVENGE') {
      actuatorOffset = -3.2;
      actuatorStatusMsg = 'DUAL SCAVENGE PUMP RUNNING · 6.2 L/MIN RECOVERY';
    }
  } else if (bentoTab === 'LUBRICATION') {
    if (activeAction === 'BYPASS') {
      actuatorOffset = -0.55;
      actuatorStatusMsg = 'COOLER THERMAL BYPASS CRACKED · -0.55 BAR';
    } else if (activeAction === 'SCAVENGE') {
      actuatorOffset = +0.40;
      actuatorStatusMsg = 'HIGH-VOLUME OIL SCAVENGE STAGE ENGAGED · +0.40 BAR';
    } else if (activeAction === 'PURGE') {
      actuatorStatusMsg = 'FUEL INERT PURGE PURSUED · VAPOR VENTED';
    } else if (activeAction === 'AUX_PUMP') {
      actuatorOffset = +0.75;
      actuatorStatusMsg = 'SECONDARY ROTAX FUEL BOOSTER RUNNING · +0.75 BAR';
    }
  } else if (bentoTab === 'TURBO') {
    if (activeAction === 'WASTEGATE') {
      actuatorOffset = -4.2;
      actuatorStatusMsg = 'TCU WASTEGATE CRACKED 45% · -4.2 inHg';
    } else if (activeAction === 'TRIM') {
      actuatorOffset = +1.5;
      actuatorStatusMsg = 'GARRETT T25 SERVO TRIM +1.5 inHg PEAK';
    } else if (activeAction === 'DUMP') {
      actuatorOffset = -8.0;
      actuatorStatusMsg = 'COMPRESSOR BLOW-OFF DUMPING · -8.0 inHg';
    } else if (activeAction === 'INTERCOOLER') {
      actuatorStatusMsg = 'CHARGE AIR LIQUID SPRAY AT 100% DUTY';
    }
  } else if (bentoTab === 'COOLING') {
    if (activeAction === 'RAD_FAN') {
      actuatorOffset = -7.2;
      actuatorStatusMsg = 'HIGH-OUTPUT RADIATOR BLOWER 100% PWM · -7.2°C';
    } else if (activeAction === 'AUX_PUMP') {
      actuatorOffset = -3.5;
      actuatorStatusMsg = 'ELECTRIC WATER PUMP OVERDRIVE · -3.5°C';
    } else if (activeAction === 'BUS_TIE') {
      actuatorStatusMsg = '28V ESSENTIAL BUS TIED TO AUX BATTERY';
    } else if (activeAction === 'SHED') {
      actuatorOffset = -1.5;
      actuatorStatusMsg = 'AVIONICS NON-CRITICAL LOAD SHEDDING ACTIVE';
    }
  } else if (bentoTab === 'SENSORS') {
    if (activeAction === 'TARE') {
      actuatorStatusMsg = '6-DOF IMU ACCEL/GYRO ZERO-BIAS RE-TARED';
    } else if (activeAction === 'PITOT_HEAT') {
      actuatorStatusMsg = 'HEATED PITOT-STATIC PROBE THERMAL ON';
    } else if (activeAction === 'EKF_RESET') {
      actuatorStatusMsg = 'KALMAN FILTER COVARIANCE RE-INITIALIZED';
    } else if (activeAction === 'SELF_TEST') {
      actuatorStatusMsg = 'CAN BUS LOOPBACK & 200 HZ SYNC VERIFIED';
    }
  }

  // 30 radial tick marks for the circular dial (sweep 240 degrees: 150 deg to 390 deg)
  const dialTicks = Array.from({ length: 31 }).map((_, i) => {
    const angle = 150 + (i / 30) * 240;
    const rad = (angle * Math.PI) / 180;
    const x1 = 120 + 92 * Math.cos(rad);
    const y1 = 120 + 92 * Math.sin(rad);
    const x2 = 120 + 82 * Math.cos(rad);
    const y2 = 120 + 82 * Math.sin(rad);
    return { x1, y1, x2, y2, angle, index: i };
  });

  // Calculate dynamic dial parameters based on active bentoTab
  let dialRatio = 0.5;
  let dialTargetRatio = 0.5;
  let dialMainVal = `${avgCht.toFixed(0)}°`;
  let dialUnitText = 'Core CHT';
  let dialStatusText = avgCht > 130 ? 'THERMAL OVERHEAT' : 'NOMINAL CHT';
  let dialIsAlert = avgCht > 130;
  let dialTitle = 'Thermostat Core';
  let dialSubtitle = 'Rotax 914F Core Thermal Twin';
  let dialTargetLabel = 'TARGET:';
  let dialTargetValue = `${targetTemp}°C`;

  if (bentoTab === 'COMBUSTION') {
    const thermostatTrim = isThermostatActive ? (targetTemp - 115) * 0.75 : 6.5;
    const effectiveCht = Math.max(75, Math.min(145, avgCht + thermostatTrim + actuatorOffset));
    dialRatio = Math.max(0, Math.min(1, (effectiveCht - 70) / (140 - 70)));
    dialTargetRatio = Math.max(0, Math.min(1, (targetTemp - 70) / (140 - 70)));
    dialMainVal = `${effectiveCht.toFixed(0)}°`;
    dialUnitText = 'Core CHT';
    dialStatusText = !isThermostatActive 
      ? 'THERMOSTAT BYPASS' 
      : effectiveCht > 130 
        ? 'THERMAL OVERHEAT' 
        : 'NOMINAL CHT';
    dialIsAlert = !isThermostatActive || effectiveCht > 130;
    dialTitle = 'Thermostat Core';
    dialSubtitle = isThermostatActive ? 'Rotax 914F Core Thermal Twin' : 'Manual Bypass · Passive Convection';
    dialTargetLabel = 'TARGET:';
    dialTargetValue = `${targetTemp}°C`;
  } else if (bentoTab === 'LUBRICATION') {
    const effectiveOilPress = Math.max(1.0, Math.min(6.5, oilPress + (isThermostatActive ? (targetOilPress - 4.5) * 0.6 : 0) + actuatorOffset));
    dialRatio = Math.max(0, Math.min(1, effectiveOilPress / 6.0));
    dialTargetRatio = Math.max(0, Math.min(1, targetOilPress / 6.0));
    dialMainVal = `${effectiveOilPress.toFixed(2)}`;
    dialUnitText = 'Bar Pressure';
    dialStatusText = !isThermostatActive 
      ? 'BYPASS REGULATION'
      : effectiveOilPress < 1.5 
        ? 'CRITICAL OIL LOSS' 
        : 'NOMINAL 4.50 BAR';
    dialIsAlert = !isThermostatActive || effectiveOilPress < 1.5;
    dialTitle = 'Dry-Sump Lubrication';
    dialSubtitle = isThermostatActive ? 'Multi-Stage Pressure & Scavenge' : 'Manual Bypass Circuit Active';
    dialTargetLabel = 'REGULATED:';
    dialTargetValue = `${targetOilPress.toFixed(2)} bar`;
  } else if (bentoTab === 'TURBO') {
    const effectiveMap = Math.max(20.0, Math.min(48.0, mapBoost + (isThermostatActive ? (targetMapBoost - 36.0) * 0.8 : 0) + actuatorOffset));
    dialRatio = Math.max(0, Math.min(1, (effectiveMap - 20) / (45 - 20)));
    dialTargetRatio = Math.max(0, Math.min(1, (targetMapBoost - 20) / (45 - 20)));
    dialMainVal = `${effectiveMap.toFixed(1)}"`;
    dialUnitText = 'inHg Boost';
    const isTurboFault = engine?.intake.wastegatePosition === 100 && effectiveMap < 30;
    dialStatusText = !isThermostatActive 
      ? 'TCU MANUAL LOOP'
      : isTurboFault 
        ? 'BOOST COLLAPSE' 
        : 'TURBOCHARGED BOOST';
    dialIsAlert = !isThermostatActive || isTurboFault;
    dialTitle = 'Turbo Induction';
    dialSubtitle = 'Garrett T25 / TCU Pressure Loop';
    dialTargetLabel = 'TAKEOFF MAP:';
    dialTargetValue = `${targetMapBoost.toFixed(1)} inHg`;
  } else if (bentoTab === 'COOLING') {
    const cTemp = engine?.cooling.coolantTemperature ?? 88.5;
    const effectiveCoolant = Math.max(50, Math.min(120, cTemp + (isThermostatActive ? (targetCoolantTemp - 85) * 0.7 : 0) + actuatorOffset));
    dialRatio = Math.max(0, Math.min(1, (effectiveCoolant - 50) / (120 - 50)));
    dialTargetRatio = Math.max(0, Math.min(1, (targetCoolantTemp - 50) / (120 - 50)));
    dialMainVal = `${effectiveCoolant.toFixed(0)}°`;
    dialUnitText = 'Head Coolant';
    dialStatusText = !isThermostatActive 
      ? 'COOLANT BYPASS' 
      : effectiveCoolant > 105 
        ? 'OVERHEAT WARNING' 
        : 'NOMINAL COOLANT';
    dialIsAlert = !isThermostatActive || effectiveCoolant > 105;
    dialTitle = 'Liquid Head Cooling';
    dialSubtitle = 'Closed-Loop Radiator & 28V Bus';
    dialTargetLabel = 'REGULATED:';
    dialTargetValue = `${targetCoolantTemp.toFixed(1)}°C`;
  } else if (bentoTab === 'SENSORS') {
    const alt = telemetry.flightControl.actualAltitude;
    const effectiveAlt = Math.max(0, Math.min(350, alt + (targetAlt - 120)));
    dialRatio = Math.max(0, Math.min(1, effectiveAlt / 250));
    dialTargetRatio = Math.max(0, Math.min(1, targetAlt / 250));
    dialMainVal = `${effectiveAlt.toFixed(0)}m`;
    dialUnitText = 'Altitude MSL';
    dialStatusText = '18 SATS · DUAL CAN BUS';
    dialIsAlert = false;
    dialTitle = 'Avionics & Dynamics';
    dialSubtitle = 'EKF Sensor Fusion & 6-DOF State';
    dialTargetLabel = 'CRUISE ALT:';
    dialTargetValue = `${targetAlt} m AGL`;
  }

  const dialAngle = 150 + dialRatio * 240;
  const dialRad = (dialAngle * Math.PI) / 180;
  const knobX = 120 + 87 * Math.cos(dialRad);
  const knobY = 120 + 87 * Math.sin(dialRad);

  const targetAngle = 150 + dialTargetRatio * 240;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetKnobX = 120 + 87 * Math.cos(targetRad);
  const targetKnobY = 120 + 87 * Math.sin(targetRad);

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const xStart = x + radius * Math.cos(startRad);
    const yStart = y + radius * Math.sin(startRad);
    const xEnd = x + radius * Math.cos(endRad);
    const yEnd = y + radius * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${xStart} ${yStart} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${xEnd} ${yEnd}`;
  };

  const bgArcPath = describeArc(120, 120, 87, 150, 390);
  const activeArcPath = describeArc(120, 120, 87, 150, Math.max(151, dialAngle));

  const probeData = {
    COMBUSTION: { title: 'Combustion Probes', probes: ['C1', 'C2', 'C3', 'C4', '+18'], count: '22/22 NODES ONLINE', sync: '20 HZ SYNC' },
    LUBRICATION: { title: 'Lubrication & Fuel Probes', probes: ['OP', 'OT', 'FP', 'FR', '+14'], count: '18/18 NODES ONLINE', sync: '50 HZ SYNC' },
    TURBO: { title: 'Turbo Induction Probes', probes: ['MAP', 'IAT', 'WG', 'MAF', '+12'], count: '16/16 NODES ONLINE', sync: '50 HZ SYNC' },
    COOLING: { title: 'Cooling & Bus Probes', probes: ['CLT', 'RAD', 'V28', 'A15', '+16'], count: '20/20 NODES ONLINE', sync: '20 HZ SYNC' },
    SENSORS: { title: 'Avionics & Sensor Probes', probes: ['IMU', 'BARO', 'CRK', 'CAN', '+20'], count: '24/24 NODES ONLINE', sync: '200 HZ SYNC' },
  }[bentoTab];

  const actionItems = {
    COMBUSTION: [
      { id: 'FAN', label: 'Fan', icon: Fan },
      { id: 'HOT', label: 'Hot', icon: Flame },
      { id: 'COLD', label: 'Cold', icon: Wind },
      { id: 'SCAVENGE', label: 'Scavenge', icon: Droplet },
    ],
    LUBRICATION: [
      { id: 'BYPASS', label: 'Bypass', icon: Wind },
      { id: 'SCAVENGE', label: 'Scavenge', icon: Droplet },
      { id: 'PURGE', label: 'Fuel Purge', icon: Flame },
      { id: 'AUX_PUMP', label: 'Aux Pump', icon: Fan },
    ],
    TURBO: [
      { id: 'WASTEGATE', label: 'Wastegate', icon: Wind },
      { id: 'TRIM', label: 'Trim Servo', icon: Fan },
      { id: 'DUMP', label: 'Dump Valve', icon: Flame },
      { id: 'INTERCOOLER', label: 'Intercooler', icon: Droplet },
    ],
    COOLING: [
      { id: 'RAD_FAN', label: 'Rad Fan', icon: Fan },
      { id: 'AUX_PUMP', label: 'Aux Pump', icon: Droplet },
      { id: 'BUS_TIE', label: 'Bus Tie', icon: Flame },
      { id: 'SHED', label: 'Load Shed', icon: Wind },
    ],
    SENSORS: [
      { id: 'TARE', label: 'Tare IMU', icon: Wind },
      { id: 'PITOT_HEAT', label: 'Pitot Heat', icon: Flame },
      { id: 'EKF_RESET', label: 'Reset EKF', icon: Fan },
      { id: 'SELF_TEST', label: 'Self Test', icon: Droplet },
    ],
  }[bentoTab];

  const dynamicBars = {
    COMBUSTION: [
      { label: 'Cyl 1', value: 18.2, unit: 'kW' },
      { label: 'Cyl 2', value: 19.1, unit: 'kW' },
      { label: 'Cyl 3', value: 21.4, unit: 'kW' },
      { label: 'Cyl 4', value: 19.8, unit: 'kW' },
      { label: 'Turbo', value: 28.3, unit: 'kW' },
      { label: 'Rad', value: 14.6, unit: 'kW' },
      { label: 'Fuel', value: 18.4, unit: 'L/h' },
    ],
    LUBRICATION: [
      { label: 'Feed', value: 24.0, unit: 'bar' },
      { label: 'Scav', value: 26.0, unit: 'bar' },
      { label: 'Sump', value: 32.0, unit: 'L' },
      { label: 'Rail', value: 32.0, unit: 'bar' },
      { label: 'Cooler', value: 18.0, unit: '°C' },
      { label: 'Filter', value: 12.0, unit: 'bar' },
      { label: 'Vent', value: 8.0, unit: 'bar' },
    ],
    TURBO: [
      { label: 'Ram', value: 14.0, unit: 'bar' },
      { label: 'Filter', value: 12.0, unit: 'bar' },
      { label: 'Comp', value: 38.0, unit: 'bar' },
      { label: 'Inter', value: 34.0, unit: 'bar' },
      { label: 'Throt', value: 32.0, unit: 'bar' },
      { label: 'Plen', value: 30.0, unit: 'bar' },
      { label: 'Runn', value: 28.0, unit: 'bar' },
    ],
    COOLING: [
      { label: 'ECU', value: 22.0, unit: 'W' },
      { label: 'Pump', value: 36.0, unit: 'W' },
      { label: 'CDI', value: 28.0, unit: 'W' },
      { label: 'Servo', value: 40.0, unit: 'W' },
      { label: 'Avion', value: 32.0, unit: 'W' },
      { label: 'Fan', value: 26.0, unit: 'W' },
      { label: 'Radio', value: 18.0, unit: 'W' },
    ],
    SENSORS: [
      { label: 'Crank', value: 25.0, unit: 'Hz' },
      { label: 'Vib', value: 40.0, unit: 'Hz' },
      { label: 'MAP', value: 20.0, unit: 'Hz' },
      { label: 'Oil', value: 20.0, unit: 'Hz' },
      { label: 'CHT', value: 15.0, unit: 'Hz' },
      { label: 'Bus', value: 15.0, unit: 'Hz' },
      { label: 'IMU', value: 40.0, unit: 'Hz' },
    ],
  }[bentoTab];

  const dynamicBarTitle = {
    COMBUSTION: 'Energy (kwh)',
    LUBRICATION: 'Hydraulic Flow & Pressure',
    TURBO: 'Induction Stage Pressure Gradient',
    COOLING: '28V DC Electrical Load Distribution',
    SENSORS: 'Sensor Sampling Rates & Frequencies',
  }[bentoTab];

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1800px] mx-auto select-none font-mono space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BENTO CONSOLE CONTAINER (FROSTED BLURRY WITH AURORA GLOW THROUGH)  */}
      {/* ========================================================================= */}
      <div className="glass-popped-panel rounded-[32px] sm:rounded-[40px] p-4 sm:p-6 lg:p-7 relative overflow-hidden space-y-6">
        
        {/* Top Navigation Bar with High Contrast Text (Right 3 buttons removed per user request) */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 pb-2 border-b border-white/60 scrollbar-none">
          {[
            { id: 'COMBUSTION', label: 'Combustion & CHT' },
            { id: 'LUBRICATION', label: 'Lubrication & Fuel' },
            { id: 'TURBO', label: 'Turbo Induction' },
            { id: 'COOLING', label: 'Cooling & 28V Bus' },
            { id: 'SENSORS', label: 'Sensors & Avionics' },
          ].map((tab) => {
            const isActive = bentoTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setBentoTab(tab.id as BentoFocusTab)}
                className={`text-sm tracking-wide transition-all whitespace-nowrap cursor-pointer px-4 py-1.5 rounded-full ${
                  isActive
                    ? 'font-black text-[#070d18] bg-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.1),inset_0_1px_1.5px_rgba(255,255,255,1)] border border-white scale-102'
                    : 'text-slate-900 hover:text-black hover:bg-white/40 font-extrabold'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column Wide Balanced Grid (Left: Dynamic Dial, Right: Waveform & Energy) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* COLUMN 1: LEFT (Probes + Dominant Dial) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            
            {/* Telemetry Probes Card */}
            <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-950 uppercase tracking-wider">
                  {probeData.title}
                </div>
                <div className="flex items-center -space-x-2 mt-2">
                  <span className="w-7 h-7 rounded-full bg-sky-200 border-2 border-white text-sky-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {probeData.probes[0]}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white text-emerald-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {probeData.probes[1]}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white text-amber-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {probeData.probes[2]}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-rose-200 border-2 border-white text-rose-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {probeData.probes[3]}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white text-slate-900 font-black text-[8px] flex items-center justify-center shadow-xs">
                    {probeData.probes[4]}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9px] text-emerald-950 font-black bg-emerald-200/90 px-3 py-1 rounded-full border border-emerald-400/80 shadow-xs">
                  {probeData.count}
                </span>
                <span className="text-[9px] text-slate-900 mt-1 font-black">{probeData.sync}</span>
              </div>
            </div>

            {/* Dominant Circular Dial Card */}
            <div className="glass-popped-card rounded-[28px] p-5 flex-1 flex flex-col justify-between space-y-4">
              
              <div className="flex items-center justify-between pb-1 border-b border-white/60">
                <div>
                  <div className="font-black text-[#070d18] text-sm tracking-wide">
                    {dialTitle}
                  </div>
                  <div className="text-[11px] text-slate-800 font-bold font-sans">
                    {dialSubtitle}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isThermostatActive ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    {isThermostatActive ? 'Auto' : 'Bypass'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsThermostatActive(!isThermostatActive)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow-inner ${
                      isThermostatActive ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                    title={isThermostatActive ? 'Thermostat Loop Active (Click to Bypass)' : 'Thermostat in Manual Bypass (Click to Engage)'}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                        isThermostatActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Center Circular Dial Gauge */}
              <div className="relative flex flex-col items-center justify-center py-1">
                <div className="relative w-[210px] h-[210px]">
                  <svg viewBox="0 0 240 240" className="w-full h-full transform rotate-0">
                    <defs>
                      <linearGradient id="thermoArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="85%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>

                    {dialTicks.map((t) => (
                      <line
                        key={t.index}
                        x1={t.x1}
                        y1={t.y1}
                        x2={t.x2}
                        y2={t.y2}
                        stroke="#64748b"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    ))}

                    <path
                      d={bgArcPath}
                      fill="none"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    <path
                      d={activeArcPath}
                      fill="none"
                      stroke={isThermostatActive ? 'url(#thermoArcGrad)' : '#94a3b8'}
                      strokeDasharray={isThermostatActive ? undefined : '5,5'}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* Target Setpoint Diamond Marker on Arc */}
                    <g transform={`translate(${targetKnobX}, ${targetKnobY}) rotate(${targetAngle + 90})`}>
                      <polygon
                        points="0,-7 5,0 0,7 -5,0"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-sm"
                      />
                    </g>

                    {/* Main Live Value Needle Knob */}
                    <circle
                      cx={knobX}
                      cy={knobY}
                      r="7"
                      fill="#ffffff"
                      stroke={isThermostatActive ? '#0284c7' : '#475569'}
                      strokeWidth="3.5"
                      className="drop-shadow-md transition-all duration-300"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <span className="text-4xl sm:text-5xl font-black font-display text-[#070d18] tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      {dialMainVal}
                    </span>
                    <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider mt-0.5">
                      {dialUnitText}
                    </span>
                    <span className={`text-[9px] font-black px-3 py-0.5 rounded-full mt-1.5 border shadow-xs transition-colors ${
                      !isThermostatActive
                        ? 'bg-amber-100/95 text-amber-950 border-amber-400'
                        : dialIsAlert 
                          ? 'bg-rose-200/95 text-rose-950 border-rose-400 animate-pulse'
                          : 'bg-emerald-200/95 text-emerald-950 border-emerald-400'
                    }`}>
                      {dialStatusText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 mt-1">
                  <button
                    type="button"
                    onClick={handleTrimDecrement}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-90 text-slate-900 flex items-center justify-center transition-all cursor-pointer font-black shadow-md border border-white hover:border-sky-300 hover:shadow-lg"
                    title="Trim Decrement (-)"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  </button>
                  <span className="text-xs font-black text-[#070d18] min-w-[125px] text-center select-none">
                    {dialTargetLabel} <strong className="text-sky-700 font-black">{dialTargetValue}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleTrimIncrement}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-90 text-slate-900 flex items-center justify-center transition-all cursor-pointer font-black shadow-md border border-white hover:border-sky-300 hover:shadow-lg"
                    title="Trim Increment (+)"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Bottom Actions Row with Contrast Labels */}
              <div className="pt-2 border-t border-white/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
                    Subsystem Actuators
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">
                    Click to toggle
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {actionItems.map((act) => {
                    const isSelected = activeAction === act.id;
                    const IconComponent = act.icon;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => handleToggleActuator(act.id)}
                        className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                        title={`${isSelected ? 'Disengage' : 'Engage'} ${act.label}`}
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#070d18] text-white shadow-lg scale-110 ring-2 ring-white ring-offset-2 ring-offset-sky-100'
                              : 'bg-white/80 text-slate-900 hover:bg-white border border-white hover:scale-105 shadow-sm'
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 stroke-[2.5] transition-transform ${
                              isSelected
                                ? act.id === 'FAN' || act.id === 'RAD_FAN' || act.id === 'AUX_PUMP'
                                  ? 'animate-spin text-sky-400'
                                  : act.id === 'HOT' || act.id === 'BUS_TIE' || act.id === 'PITOT_HEAT'
                                  ? 'animate-pulse text-amber-400'
                                  : act.id === 'COLD' || act.id === 'WASTEGATE' || act.id === 'TARE'
                                  ? 'animate-bounce text-cyan-300'
                                  : 'text-emerald-400'
                                : ''
                            }`}
                          />
                        </div>
                        <span className={`text-[10px] font-black transition-colors ${isSelected ? 'text-[#070d18]' : 'text-slate-800'}`}>
                          {act.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Actuator Telemetry & Operational Feedback */}
                <div className={`mt-2.5 px-3 py-1.5 rounded-xl border flex items-center justify-between text-[10px] font-black transition-all ${
                  activeAction 
                    ? 'bg-sky-500/10 border-sky-300 text-sky-950 shadow-xs' 
                    : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${activeAction ? 'bg-sky-500 animate-ping' : 'bg-slate-400'}`} />
                    <span className="truncate">{actuatorStatusMsg}</span>
                  </div>
                  {activeAction ? (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-sky-600 text-white font-mono font-black shrink-0 ml-2 shadow-2xs">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-black shrink-0 ml-2">
                      AUTO
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* COLUMN 2: RIGHT (Waveform + Dual Opposed Cards + Distribution Chart) */}
          <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
            
            {/* Top Waveform Card */}
            <div className="glass-popped-card rounded-[28px] p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#070d18] tracking-tight font-display drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      {bentoTab === 'COMBUSTION' && `${avgCht.toFixed(0)}°`}
                      {bentoTab === 'LUBRICATION' && `${fuelFlow.toFixed(1)} L/h`}
                      {bentoTab === 'TURBO' && `${(engine?.intake.airMassFlow ?? 207.3).toFixed(1)} kg/h`}
                      {bentoTab === 'COOLING' && `${(engine?.electrical.alternatorVoltage ?? 28.4).toFixed(1)} V`}
                      {bentoTab === 'SENSORS' && `${vibRms.toFixed(2)} mm/s`}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-800">
                      {bentoTab === 'COMBUSTION' && `/ ${maxSafeCht}°C`}
                      {bentoTab === 'LUBRICATION' && `/ 32.0 L/h Max`}
                      {bentoTab === 'TURBO' && `Mass Airflow`}
                      {bentoTab === 'COOLING' && `/ ${(engine?.electrical.alternatorCurrent ?? 15.2).toFixed(1)} A`}
                      {bentoTab === 'SENSORS' && `RMS Vibration`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-900 font-extrabold mt-0.5">
                    <Wind className="w-3.5 h-3.5 text-sky-700 stroke-[2.5]" />
                    <span>
                      {bentoTab === 'COMBUSTION' && `Northwest, ${telemetry.environment.windSpeed.toFixed(1)} km/h · ${telemetry.movement.airSpeed.toFixed(0)} kts`}
                      {bentoTab === 'LUBRICATION' && `AFR ${engine?.operating.airFuelRatio ?? '14.7'}:1 · λ ${engine?.operating.lambda ?? '1.00'} · Tank ${(engine?.fuel.fuelQuantity ?? 64.5).toFixed(1)} L`}
                      {bentoTab === 'TURBO' && `Boost Δ +${(engine?.intake.pressureDifferential ?? 0.26).toFixed(2)} bar · IAT ${(engine?.intake.intakeAirTemperature ?? 41.8).toFixed(1)}°C`}
                      {bentoTab === 'COOLING' && `Power ${(engine?.electrical.electricalPower ?? 431.7).toFixed(0)} W · Bus Load ${engine?.electrical.electricalLoad ?? 76}% · BMS ${battery.percentage.toFixed(0)}%`}
                      {bentoTab === 'SENSORS' && `Airspeed ${telemetry.movement.airSpeed.toFixed(0)} kts · Dominant 1X ${vibDomFreq.toFixed(1)} Hz · ${telemetry.attitude.totalAcceleration.toFixed(2)} G`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center p-1 bg-white/60 border border-white rounded-full shadow-xs">
                  {(['30S', '60S', '180S'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeWindow(t)}
                      className={`px-3 py-0.5 text-[9px] font-black rounded-full transition-all cursor-pointer ${
                        timeWindow === t
                          ? 'bg-[#070d18] text-white shadow-xs'
                          : 'text-slate-800 hover:text-black'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Waveform Curve */}
              <div className="relative w-full h-[68px] overflow-hidden">
                <svg viewBox="0 0 360 80" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveFillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 50 Q 40 25, 90 40 T 180 30 T 270 45 T 360 20 L 360 80 L 0 80 Z"
                    fill="url(#waveFillGrad)"
                  />
                  <path
                    d="M 0 50 Q 40 25, 90 40 T 180 30 T 270 45 T 360 20"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="360" cy="20" r="4.5" fill="#0284c7" />
                  <circle cx="360" cy="20" r="8" fill="#0284c7" opacity="0.3" className="animate-ping" />
                </svg>
              </div>

              {/* 5-Step Live Subsystem Trend Timeline */}
              <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/60 text-center">
                {bentoTab === 'COMBUSTION' && [
                  { time: '10:00 AM', val: '112°', icon: Flame },
                  { time: '11:00 AM', val: '114°', icon: Flame },
                  { time: '12:00 PM', val: '117°', icon: Flame },
                  { time: '1:00 PM', val: '118°', icon: Flame },
                  { time: '2:00 PM', val: '118°', icon: Flame },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                      <div className="flex items-center space-x-0.5">
                        <Icon className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                        <span className="font-black text-xs text-[#070d18]">{step.val}</span>
                      </div>
                      <span className="text-[9px] text-slate-800 font-black">{step.time}</span>
                    </div>
                  );
                })}
                {bentoTab === 'LUBRICATION' && [
                  { time: '10:00 AM', val: '17.2 L', icon: Droplet },
                  { time: '11:00 AM', val: '17.8 L', icon: Droplet },
                  { time: '12:00 PM', val: '18.4 L', icon: Droplet },
                  { time: '1:00 PM', val: '18.2 L', icon: Droplet },
                  { time: '2:00 PM', val: '18.4 L', icon: Droplet },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                      <div className="flex items-center space-x-0.5">
                        <Icon className="w-3 h-3 text-sky-600 stroke-[2.5]" />
                        <span className="font-black text-xs text-[#070d18]">{step.val}</span>
                      </div>
                      <span className="text-[9px] text-slate-800 font-black">{step.time}</span>
                    </div>
                  );
                })}
                {bentoTab === 'TURBO' && [
                  { time: 'AMB', val: '29.5"', icon: Wind },
                  { time: 'PRE', val: '31.2"', icon: Wind },
                  { time: 'BOOST', val: '35.4"', icon: Wind },
                  { time: 'INTER', val: '34.8"', icon: Wind },
                  { time: 'PLEN', val: '35.2"', icon: Wind },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                      <div className="flex items-center space-x-0.5">
                        <Icon className="w-3 h-3 text-sky-600 stroke-[2.5]" />
                        <span className="font-black text-xs text-[#070d18]">{step.val}</span>
                      </div>
                      <span className="text-[9px] text-slate-800 font-black">{step.time}</span>
                    </div>
                  );
                })}
                {bentoTab === 'COOLING' && [
                  { time: '10:00 AM', val: '28.4V', icon: Flame },
                  { time: '11:00 AM', val: '28.3V', icon: Flame },
                  { time: '12:00 PM', val: '28.4V', icon: Flame },
                  { time: '1:00 PM', val: '28.4V', icon: Flame },
                  { time: '2:00 PM', val: '28.4V', icon: Flame },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                      <div className="flex items-center space-x-0.5">
                        <Icon className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                        <span className="font-black text-xs text-[#070d18]">{step.val}</span>
                      </div>
                      <span className="text-[9px] text-slate-800 font-black">{step.time}</span>
                    </div>
                  );
                })}
                {bentoTab === 'SENSORS' && [
                  { time: '1X CRK', val: '90.8Hz', icon: Wind },
                  { time: '2X HAR', val: '181Hz', icon: Wind },
                  { time: '3X HAR', val: '272Hz', icon: Wind },
                  { time: 'FRAME', val: '1.02G', icon: Wind },
                  { time: 'RMS', val: '2.14mm', icon: Wind },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                      <div className="flex items-center space-x-0.5">
                        <Icon className="w-3 h-3 text-sky-600 stroke-[2.5]" />
                        <span className="font-black text-xs text-[#070d18]">{step.val}</span>
                      </div>
                      <span className="text-[9px] text-slate-800 font-black">{step.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle Row: Two Half-Width Subsystem Focus Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Card Left */}
              <div className="glass-popped-card rounded-[24px] p-4 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    {bentoTab === 'COMBUSTION' && 'Closed-Loop'}
                    {bentoTab === 'LUBRICATION' && 'High-Pressure'}
                    {bentoTab === 'TURBO' && 'Turbine Core'}
                    {bentoTab === 'COOLING' && 'Primary Feeder'}
                    {bentoTab === 'SENSORS' && 'Engine Bay'}
                  </div>
                  <div className="font-black text-[#070d18] text-sm mt-0.5">
                    {bentoTab === 'COMBUSTION' && 'Port Bank'}
                    {bentoTab === 'LUBRICATION' && 'Port Injector Rail'}
                    {bentoTab === 'TURBO' && 'Exhaust Turbine'}
                    {bentoTab === 'COOLING' && 'DC Bus A (Regulated)'}
                    {bentoTab === 'SENSORS' && 'DAQ Node 1 (Core)'}
                  </div>
                  <div className="text-[9px] text-slate-900 font-black truncate">
                    {bentoTab === 'COMBUSTION' && `C1: ${(engine?.combustion.cht.cylinders[0] ?? 114.2).toFixed(0)}° · C2: ${(engine?.combustion.cht.cylinders[1] ?? 116.5).toFixed(0)}°`}
                    {bentoTab === 'LUBRICATION' && `Timing: ${(engine?.fuel.injectionTiming ?? 27.3).toFixed(1)}° BTDC · Pulse: ${(engine?.fuel.injectionDuration ?? 5.36).toFixed(2)} ms`}
                    {bentoTab === 'TURBO' && `Wastegate: ${(engine?.intake.wastegatePosition ?? 69).toFixed(0)}% OPEN · 118,500 RPM`}
                    {bentoTab === 'COOLING' && `28.4V Regulated · 15.2A · ECU & CDI Loop`}
                    {bentoTab === 'SENSORS' && `Crank 5450 RPM · CHT/EGT Array · Oil 4.45b`}
                  </div>
                </div>

                <div className="w-full h-14 bg-white/50 rounded-xl border border-white p-1 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <svg viewBox="0 0 120 40" className="w-full h-full">
                    <rect x="10" y="8" width="45" height="24" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
                    <rect x="65" y="8" width="45" height="24" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
                    <rect x="24" y="11" width="16" height="18" rx="2" fill="#0284c7" />
                    <rect x="80" y="11" width="16" height="18" rx="2" fill="#0284c7" />
                    <circle cx="15" cy="20" r="2.5" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="105" cy="20" r="2.5" fill="#f59e0b" className="animate-pulse" />
                  </svg>
                </div>

                <button
                  onClick={() => setPortBankArmed(!portBankArmed)}
                  className={`w-full py-1.5 px-3 rounded-full text-[9px] font-black flex items-center justify-between transition-all cursor-pointer shadow-md ${
                    portBankArmed
                      ? 'bg-[#070d18] text-sky-300 ring-1 ring-white/60'
                      : 'bg-white/80 text-slate-900 border border-white'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-sky-400 stroke-[2.5]" />
                    <span>
                      {bentoTab === 'COMBUSTION' && 'CDI BANK A'}
                      {bentoTab === 'LUBRICATION' && 'INJECTOR A'}
                      {bentoTab === 'TURBO' && 'TURBINE STAGE'}
                      {bentoTab === 'COOLING' && 'BUS A FEED'}
                      {bentoTab === 'SENSORS' && 'DAQ NODE 1'}
                    </span>
                  </span>
                  <span className="text-[8px] text-slate-200 font-bold">ARMED</span>
                </button>
              </div>

              {/* Card Right */}
              <div className="glass-popped-card rounded-[24px] p-4 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    {bentoTab === 'COMBUSTION' && 'Closed-Loop'}
                    {bentoTab === 'LUBRICATION' && 'High-Pressure'}
                    {bentoTab === 'TURBO' && 'Heat Exchange'}
                    {bentoTab === 'COOLING' && 'Essential Feeder'}
                    {bentoTab === 'SENSORS' && 'Flight Bay'}
                  </div>
                  <div className="font-black text-[#070d18] text-sm mt-0.5">
                    {bentoTab === 'COMBUSTION' && 'Starboard Bank'}
                    {bentoTab === 'LUBRICATION' && 'Starboard Injector Rail'}
                    {bentoTab === 'TURBO' && 'Charge Intercooler'}
                    {bentoTab === 'COOLING' && 'DC Bus B (Essential)'}
                    {bentoTab === 'SENSORS' && 'DAQ Node 2 (Avionics)'}
                  </div>
                  <div className="text-[9px] text-slate-900 font-black truncate">
                    {bentoTab === 'COMBUSTION' && `C3: ${(engine?.combustion.cht.cylinders[2] ?? 122.1).toFixed(0)}° · C4: ${(engine?.combustion.cht.cylinders[3] ?? 119.3).toFixed(0)}°`}
                    {bentoTab === 'LUBRICATION' && `Timing: ${(engine?.fuel.injectionTiming ?? 27.3).toFixed(1)}° BTDC · Pulse: ${(engine?.fuel.injectionDuration ?? 5.36).toFixed(2)} ms`}
                    {bentoTab === 'TURBO' && `Core Delta -28.4°C · DP 0.04 bar`}
                    {bentoTab === 'COOLING' && `28.2V Buffer · 4.2A · Flight Avionics`}
                    {bentoTab === 'SENSORS' && `6-DOF IMU 200Hz · Baro Static · CAN A/B`}
                  </div>
                </div>

                <div className="w-full h-14 bg-white/50 rounded-xl border border-white p-1 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <svg viewBox="0 0 120 40" className="w-full h-full">
                    <rect x="10" y="8" width="45" height="24" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
                    <rect x="65" y="8" width="45" height="24" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
                    <rect x="24" y="11" width="16" height="18" rx="2" fill="#10b981" />
                    <rect x="80" y="11" width="16" height="18" rx="2" fill="#10b981" />
                    <circle cx="15" cy="20" r="2.5" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="105" cy="20" r="2.5" fill="#f59e0b" className="animate-pulse" />
                  </svg>
                </div>

                <button
                  onClick={() => setStarboardBankArmed(!starboardBankArmed)}
                  className={`w-full py-1.5 px-3 rounded-full text-[9px] font-black flex items-center justify-between transition-all cursor-pointer shadow-md ${
                    starboardBankArmed
                      ? 'bg-[#070d18] text-sky-300 ring-1 ring-white/60'
                      : 'bg-white/80 text-slate-900 border border-white'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-sky-400 stroke-[2.5]" />
                    <span>
                      {bentoTab === 'COMBUSTION' && 'CDI BANK B'}
                      {bentoTab === 'LUBRICATION' && 'INJECTOR B'}
                      {bentoTab === 'TURBO' && 'CHARGE STAGE'}
                      {bentoTab === 'COOLING' && 'BUS B FEED'}
                      {bentoTab === 'SENSORS' && 'DAQ NODE 2'}
                    </span>
                  </span>
                  <span className="text-[8px] text-slate-200 font-bold">ARMED</span>
                </button>
              </div>
            </div>

            {/* Bottom Dynamic Distribution Bar Chart */}
            <div className="glass-popped-card rounded-[28px] p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#070d18] text-xs uppercase tracking-wide">
                  {dynamicBarTitle}
                </span>
                
                <div className="flex items-center p-1 bg-white/60 border border-white rounded-full shadow-xs">
                  {(['Live', 'Filtered', 'Mission'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setEnergyFilter(filter === 'Live' ? 'LIVE' : filter === 'Filtered' ? '60S' : 'MISSION')}
                      className={`px-3 py-0.5 text-[9px] font-black rounded-full transition-all cursor-pointer ${
                        (energyFilter === 'LIVE' && filter === 'Live') ||
                        (energyFilter === '60S' && filter === 'Filtered') ||
                        (energyFilter === 'MISSION' && filter === 'Mission')
                          ? 'bg-[#070d18] text-white shadow-xs'
                          : 'text-slate-800 hover:text-black'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end space-x-3 pt-6 pb-1">
                <div className="flex flex-col justify-between text-[9px] text-slate-900 font-black h-24 pb-4">
                  <span>40.0</span>
                  <span>32.0</span>
                  <span>24.0</span>
                  <span>16.0</span>
                  <span>8.0</span>
                  <span>0.0</span>
                </div>

                <div className="flex-1 grid grid-cols-7 gap-2.5 items-end h-24 pb-4">
                  {dynamicBars.map((bar, idx) => {
                    const isSelected = selectedEnergyBar === idx;
                    const maxScale = 40;
                    const heightPercent = Math.min(100, Math.max(15, (bar.value / maxScale) * 100));

                    return (
                      <div
                        key={bar.label}
                        onClick={() => setSelectedEnergyBar(idx)}
                        className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        {isSelected && (
                          <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-[#070d18] text-white text-[8px] font-black shadow-lg whitespace-nowrap z-10">
                            {bar.value} {bar.unit}
                          </div>
                        )}

                        <div
                          className={`w-full rounded-full transition-all ${
                            isSelected
                              ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-md shadow-sky-500/40 ring-1 ring-sky-300'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        <span className="text-[9px] text-slate-900 font-black mt-1.5 uppercase truncate max-w-full">
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. COMPLETE 16-SUBSYSTEM TELEMETRY MATRIX WITH ANIMATED MICRO-WIDGETS      */}
      {/*    (SEMITRANSPARENT BLURRY BACKGROUNDS + SHADOWED BORDERS)                */}
      {/* ========================================================================= */}
      <div className="glass-popped-panel rounded-[36px] p-5 sm:p-7 space-y-6">
        
        {/* Header Strip with High Contrast */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/60 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white/70 border border-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-sky-700 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#070d18] tracking-tight">
                Complete 16-Subsystem Engineering Telemetry Matrix
              </h2>
              <p className="text-[11px] text-slate-800 font-bold font-sans mt-0.5">
                Dynamic micro-animated instrumentation for every physical & derived engine parameter
              </p>
            </div>
          </div>

        </div>

        {/* Subsystem Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'ALL 16 SUBSYSTEMS' },
            { id: 'OPERATING', label: 'OPERATING & COMBUSTION' },
            { id: 'LUBRICATION_FUEL', label: 'LUBRICATION & FUEL' },
            { id: 'INTAKE_IGNITION', label: 'INTAKE & IGNITION' },
            { id: 'MECHANICAL_VIB', label: 'MECHANICAL & VIB' },
            { id: 'COOLING_ELEC', label: 'COOLING & 28V BUS' },
            { id: 'MAINTENANCE_RUL', label: 'MAINTENANCE & RUL' },
            { id: 'AVIONICS', label: 'AVIONICS 6-DOF' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMatrixTab(tab.id as SubsystemTab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${
                matrixTab === tab.id
                  ? 'bg-[#070d18] text-white shadow-md scale-102 ring-1 ring-white/30'
                  : 'bg-white/60 text-slate-900 border border-white hover:bg-white hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 8 Subsystem Blocks with Frosted Glass & Popped-Out Shadowed Borders */}
        <div className={
          matrixTab === 'ALL'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs'
            : matrixTab === 'LUBRICATION_FUEL'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-5 text-xs max-w-5xl mx-auto'
            : 'grid grid-cols-1 gap-5 text-xs max-w-2xl mx-auto'
        }>
          
          {/* BOX 1: OPERATING */}
          {(matrixTab === 'ALL' || matrixTab === 'OPERATING') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>OPERATING</span>
              <span className="text-sky-900 font-black">ROTAX 914F</span>
            </div>

            {/* RPM Speedometer Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <SpeedometerAnimation rpm={engine?.operating.rpm ?? 5450} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">RPM Speed</div>
                  <div className="font-black text-sm text-[#070d18]">{engine?.operating.rpm ?? 5450} RPM</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                CRANK
              </span>
            </div>

            {/* Load Gauge Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <LoadGaugeAnimation loadPct={engine?.operating.engineLoad ?? 82} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Engine Load</div>
                  <div className="font-black text-sm text-[#070d18]">{engine?.operating.engineLoad ?? 82}%</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-950 bg-white/80 px-2 py-0.5 rounded border border-white shadow-2xs">
                THROTTLE
              </span>
            </div>

            {/* Pistons Animation for Torque */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <PistonAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Shaft Torque</div>
                  <div className="font-black text-sm text-[#070d18]">{engine?.operating.torque ?? 137.3} Nm</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-400 shadow-2xs">
                PISTONS
              </span>
            </div>

            {/* Power Dynamo Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <PowerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Engine Power</div>
                  <div className="font-black text-sm text-sky-850">
                    {engine?.operating.powerKw ?? 78.4} kW
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-950">
                {engine?.operating.powerHp ?? 105.1} HP
              </span>
            </div>

            {/* EGT Core Flame Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FlameAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">EGT Core</div>
                  <div className="font-black text-sm text-amber-900">{avgEgt.toFixed(0)}°C</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-950">
                Δ {engine?.combustion.egt.maxDeviation.toFixed(1) ?? '10.0'}° SPREAD
              </span>
            </div>
          </div>
          )}

          {/* BOX 2: LUBRICATION */}
          {(matrixTab === 'ALL' || matrixTab === 'LUBRICATION_FUEL') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>LUBRICATION</span>
              <span className="text-amber-950 font-black">CIRCUIT</span>
            </div>

            {/* Oil Pressure Dial Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <PressureDialAnimation pressureBar={oilPress} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Oil Pressure</div>
                  <div className="font-black text-sm text-[#070d18]">{oilPress.toFixed(2)} bar</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-950 bg-emerald-200/90 px-2 py-0.5 rounded border border-emerald-400 shadow-2xs">
                NOMINAL
              </span>
            </div>

            {/* Oil Temperature Thermometer Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ThermometerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Oil Temp</div>
                  <div className="font-black text-sm text-rose-800">{oilTemp.toFixed(1)}°C</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900">MAX 130°</span>
            </div>

            {/* Oil Flow Impeller Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ImpellerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Oil Flow Rate</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.lubrication.oilFlowRate.toFixed(1) ?? '7.5'} L/min
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                PUMP
              </span>
            </div>

            {/* Oil Level Wave Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/25 border border-amber-400/60 p-1 flex items-center justify-center overflow-hidden">
                  <div className="w-full bg-amber-500 h-4 rounded-b-md animate-pulse" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Oil Level</div>
                  <div className="font-black text-sm text-emerald-900">{engine?.lubrication.oilLevel ?? 96}%</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-950 font-black">RESERVOIR</span>
            </div>

            {/* Status Beacon Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-slate-900">Health State</span>
              </div>
              <span className="text-[10px] font-black text-emerald-950 bg-emerald-200 px-3 py-0.5 rounded-full border border-emerald-400 shadow-2xs">
                {engine?.lubrication.status ?? 'OPTIMAL'}
              </span>
            </div>
          </div>
          )}

          {/* BOX 3: FUEL SYSTEM */}
          {(matrixTab === 'ALL' || matrixTab === 'LUBRICATION_FUEL') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>FUEL SYSTEM</span>
              <span className="text-sky-900 font-black">INJECTION</span>
            </div>

            {/* Fuel Flow Turbine Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ImpellerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Fuel Flow Rate</div>
                  <div className="font-black text-sm text-[#070d18]">{fuelFlow.toFixed(1)} L/h</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                FLOW
              </span>
            </div>

            {/* Rail Pressure Pulse Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-200/90 border border-sky-400 flex items-center justify-center p-1">
                  <div className="w-full h-1.5 bg-sky-700 rounded-full animate-pulse" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Rail Pressure</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.fuel.fuelPressure.toFixed(1) ?? '3.2'} bar
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900">COMMON RAIL</span>
            </div>

            {/* Fuel Remaining Float Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-200/90 border border-emerald-400 p-1 flex items-end">
                  <div className="w-full bg-emerald-600 h-5 rounded-b-sm transition-all" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Fuel Remaining</div>
                  <div className="font-black text-sm text-emerald-900">
                    {engine?.fuel.fuelRemainingPercent.toFixed(1) ?? '71.1'}%
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900">TANK 1</span>
            </div>

            {/* Injection Timing Strobe Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <TimingWheelAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Injection Timing</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.fuel.injectionTiming.toFixed(1) ?? '27.3'}° BTDC
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-400 shadow-2xs">
                STROBE
              </span>
            </div>

            {/* Pulse Width Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Solenoid Pulse Width</span>
                <div className="font-black text-sm text-[#070d18]">
                  {engine?.fuel.injectionDuration.toFixed(2) ?? '5.36'} ms
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2.5 py-0.5 rounded-full border border-sky-400 shadow-2xs">
                PULSE
              </span>
            </div>
          </div>
          )}

          {/* BOX 4: AIR INTAKE & TURBO */}
          {(matrixTab === 'ALL' || matrixTab === 'INTAKE_IGNITION') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>AIR INTAKE & TURBO</span>
              <span className="text-sky-900 font-black">35.4 inHg</span>
            </div>

            {/* Turbo Compressor Wheel Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <TurboCompressorAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Boost MAP</div>
                  <div className="font-black text-sm text-sky-800">{mapBoost.toFixed(1)} inHg</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                TURBO
              </span>
            </div>

            {/* Charge IAT Intercooler Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ThermometerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Charge IAT</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.intake.intakeAirTemperature.toFixed(1) ?? '41.8'}°C
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900">INTERCOOLER</span>
            </div>

            {/* Mass Airflow Streamlines Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <StreamlinesAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Mass Airflow</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.intake.airMassFlow.toFixed(1) ?? '207.3'} kg/h
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900">PLENUM</span>
            </div>

            {/* Wastegate Actuator Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-white p-1 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Wastegate Servo</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.intake.wastegatePosition.toFixed(0) ?? '69'}% OPEN
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-950 bg-emerald-200/90 px-2 py-0.5 rounded border border-emerald-400 shadow-2xs">
                SERVO
              </span>
            </div>

            {/* Boost Delta Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Boost Differential</span>
                <div className="font-black text-sm text-sky-800">
                  +{engine?.intake.pressureDifferential.toFixed(2) ?? '0.26'} bar
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2.5 py-0.5 rounded-full border border-sky-400 shadow-2xs">
                DELTA
              </span>
            </div>
          </div>
          )}

          {/* BOX 5: VIBRATION */}
          {(matrixTab === 'ALL' || matrixTab === 'MECHANICAL_VIB') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>VIBRATION (3-AXIAL)</span>
              <span className="text-emerald-900 font-black">ISO 10816-3</span>
            </div>

            {/* RMS Vibration Waveform Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <VibrationSineAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">RMS Vibration</div>
                  <div className="font-black text-sm text-emerald-900">{vibRms.toFixed(2)} mm/s</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-950 bg-emerald-200/90 px-2 py-0.5 rounded border border-emerald-400 shadow-2xs">
                RMS
              </span>
            </div>

            {/* Dominant 1X Frequency Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 p-1 flex items-end justify-between gap-0.5 shadow-xs">
                  <div className="w-1.5 bg-emerald-400 h-3 animate-pulse" />
                  <div className="w-1.5 bg-sky-400 h-6 animate-pulse" />
                  <div className="w-1.5 bg-emerald-400 h-2 animate-pulse" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Dominant 1X</div>
                  <div className="font-black text-sm text-[#070d18]">{vibDomFreq.toFixed(1)} Hz</div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">CRANK 1X</span>
            </div>

            {/* Tri-Axial Oscillations X, Y, Z Rows */}
            <div className="glass-popped-row p-2.5 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-900 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                  X (Lateral):
                </span>
                <strong className="text-[#070d18] font-black">
                  {engine?.vibration.vibrationX.toFixed(2) ?? '1.96'} mm/s
                </strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-900 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  Y (Longitudinal):
                </span>
                <strong className="text-[#070d18] font-black">
                  {engine?.vibration.vibrationY.toFixed(2) ?? '1.67'} mm/s
                </strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-900 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  Z (Vertical):
                </span>
                <strong className="text-[#070d18] font-black">
                  {engine?.vibration.vibrationZ.toFixed(2) ?? '2.84'} mm/s
                </strong>
              </div>
            </div>
          </div>
          )}

          {/* BOX 6: ELECTRICAL 28V BUS */}
          {(matrixTab === 'ALL' || matrixTab === 'COOLING_ELEC') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>ELECTRICAL 28V BUS</span>
              <span className="text-sky-900 font-black">REGULATED</span>
            </div>

            {/* Alternator Voltage Rotor Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <AlternatorAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Alternator Voltage</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.electrical.alternatorVoltage.toFixed(1) ?? '28.4'} V
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                28V DC
              </span>
            </div>

            {/* Alternator Current Flow Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <PowerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Alternator Current</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.electrical.alternatorCurrent.toFixed(1) ?? '15.2'} A
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">LOAD</span>
            </div>

            {/* Bus Capacity Utilization Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <LoadGaugeAnimation loadPct={engine?.electrical.electricalLoad ?? 76} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Bus Load</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.electrical.electricalLoad ?? 76}%
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">CAPACITY</span>
            </div>

            {/* BMS SOC Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">BMS Battery SOC</span>
                <div className="font-black text-sm text-emerald-900">
                  {battery.percentage.toFixed(0)}%
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-950 bg-emerald-200/90 px-2.5 py-0.5 rounded-full border border-emerald-400 shadow-2xs">
                6S LIPO
              </span>
            </div>

            {/* Total Bus Power Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Total Bus Power</span>
                <div className="font-black text-sm text-sky-850">
                  {engine?.electrical.electricalPower.toFixed(1) ?? '431.7'} W
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-800 font-bold">DRAIN</span>
            </div>
          </div>
          )}

          {/* BOX 7: MAINTENANCE & RUL */}
          {(matrixTab === 'ALL' || matrixTab === 'MAINTENANCE_RUL') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>MAINTENANCE & RUL</span>
              <span className="text-emerald-900 font-black">KALMAN PROGNOSIS</span>
            </div>

            {/* Powerplant RUL Row - Dominant & Clear */}
            <div className={`glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5 border ${
              isCriticalFault ? 'border-rose-400 bg-rose-50/80 shadow-xs' : 'border-white/80'
            }`}>
              <div className="flex items-center space-x-2.5 min-w-0">
                <ShieldPulseAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Powerplant RUL (To Overhaul)</div>
                  <div className={`font-black text-sm ${isCriticalFault ? 'text-rose-600 animate-pulse' : 'text-emerald-900'}`}>
                    {(engine?.rul.estimatedRul ?? 580.0).toFixed(1)} h remaining
                  </div>
                </div>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded border shadow-2xs ${
                isCriticalFault 
                  ? 'bg-rose-200 text-rose-950 border-rose-400 animate-pulse' 
                  : 'bg-emerald-200/90 text-emerald-950 border-emerald-400'
              }`}>
                {isCriticalFault ? 'CRITICAL ACTION' : 'TBO 2000 H'}
              </span>
            </div>

            {/* Inspection Due Countdown Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Due 100-Hour Inspection</span>
                <div className="font-black text-sm text-amber-900">
                  In {Math.min(57.5, engine?.rul.estimatedRul ?? 57.5).toFixed(1)} h
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                ROUTINE
              </span>
            </div>

            {/* Airworthiness Index Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Engine Health Index</span>
                <div className={`font-black text-sm ${
                  (engine?.health.overallEngineHealth ?? 94) < 50 ? 'text-rose-600' : 'text-emerald-900'
                }`}>
                  {(engine?.health.overallEngineHealth ?? 94.2).toFixed(1)}%
                </div>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                (engine?.health.overallEngineHealth ?? 94) < 50
                  ? 'bg-rose-200 text-rose-950 border-rose-400'
                  : 'bg-emerald-200 text-emerald-950 border-emerald-400'
              }`}>
                {(engine?.health.overallEngineHealth ?? 94) < 50 ? 'DEGRADED' : 'AIRWORTHY'}
              </span>
            </div>

            {/* Engine Cycle Count Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/90 border border-white p-1 flex items-center justify-center font-mono font-black text-xs text-slate-950 shadow-xs">
                  {engine?.maintenance.engineCycleCount ?? 842}
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Engine Sorties</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {engine?.maintenance.engineCycleCount ?? 842} starts
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">CYCLES</span>
            </div>

            {/* Flight Hours Hobbs Drum Row - Clearly designated as Lifetime Total */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <HobbsDrumAnimation hours={engine?.maintenance.engineOperatingHours ?? 1420.4} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Total Operating Time (Hobbs)</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {(engine?.maintenance.engineOperatingHours ?? 1420.4).toFixed(1)} h
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">TOTAL LOG</span>
            </div>
          </div>
          )}

          {/* BOX 8: ENVIRONMENT CONTEXT */}
          {(matrixTab === 'ALL' || matrixTab === 'AVIONICS') && (
          <div className="glass-popped-card rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-white/60 flex items-center justify-between">
              <span>ENVIRONMENT CONTEXT</span>
              <span className="text-sky-900 font-black">ATMOSPHERE</span>
            </div>

            {/* Altitude Altimeter Dial Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <AltimeterAnimation altitude={telemetry.flightControl.actualAltitude} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Altitude MSL</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {telemetry.flightControl.actualAltitude.toFixed(0)} m
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                BARO
              </span>
            </div>

            {/* Airspeed Streamlines Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <StreamlinesAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Airspeed</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {telemetry.movement.airSpeed.toFixed(1)} m/s
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">PITOT</span>
            </div>

            {/* OAT Thermometer Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ThermometerAnimation />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Outside Temp (OAT)</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {telemetry.environment.ambientTemperature.toFixed(1)}°C
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">AMBIENT</span>
            </div>

            {/* Air Density Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="truncate">
                <span className="text-[11px] text-slate-900 font-extrabold">Air Density</span>
                <div className="font-black text-sm text-[#070d18]">
                  {(engine?.environment.airDensity ?? 1.225).toFixed(3)} kg/m³
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-900 font-black">ISA+4°C</span>
            </div>

            {/* Wind Vector Compass Row */}
            <div className="glass-popped-row p-2.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <WindCompassAnimation dir={telemetry.environment.windDirection} />
                <div className="truncate">
                  <div className="text-[11px] text-slate-900 font-extrabold">Wind Vector</div>
                  <div className="font-black text-sm text-[#070d18]">
                    {telemetry.environment.windSpeed.toFixed(1)} km/h
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded border border-sky-400 shadow-2xs">
                {telemetry.environment.windDirection.toFixed(0)}°
              </span>
            </div>
          </div>
          )}

        </div>

      </div>

    </div>
  );
};

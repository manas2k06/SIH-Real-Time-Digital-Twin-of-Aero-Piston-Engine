import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Activity, 
  ChevronRight, 
  Search, 
  User, 
  Gauge, 
  Flame, 
  Droplet, 
  Zap, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Compass, 
  Wind, 
  Maximize2, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  X
} from 'lucide-react';
import { 
  ThermalGradientPlaceholder, 
  VibrationFFTPlaceholder, 
  RULDegradationPlaceholder 
} from '../ui/TechnicalPlaceholders';

interface HotspotPin {
  id: string;
  name: string;
  category: string;
  topPct: number;
  leftPct: number;
  tagPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  headline: string;
  description: string;
  specs: { label: string; value: string }[];
}

const ENGINE_HOTSPOTS: HotspotPin[] = [
  {
    id: 'core-powerplant',
    name: 'ROTAX 914F CORE POWERPLANT',
    category: 'THERMODYNAMIC BLOCK',
    topPct: 48,
    leftPct: 50,
    tagPosition: 'top-left',
    headline: 'Turbocharged 4-Cylinder Boxer Aero-Engine',
    description: 'Liquid-cooled cylinder heads with air-cooled cylinders, equipped with integrated turbocharger and automatic wastegate controller for sustained MALE-UAV high-altitude cruise.',
    specs: [
      { label: 'DISPLACEMENT', value: '1,211 cc (4-Cyl Boxer)' },
      { label: 'TAKEOFF POWER', value: '84.5 kW / 115 HP @ 5800 RPM' },
      { label: 'MAX CRUISE RPM', value: '5,500 RPM Continuous' },
      { label: 'COMPRESSION', value: '9.0 : 1 Ratio' },
    ]
  },
  {
    id: 'lubrication-crankcase',
    name: 'DRY-SUMP LUBRICATION & CRANKCASE',
    category: 'MECHANICAL / FLUIDS',
    topPct: 62,
    leftPct: 38,
    tagPosition: 'bottom-left',
    headline: 'Forced Lubrication Loop with Dual Transducers',
    description: 'Dry sump forced lubrication with separate oil tank, magnetic chip detector, and calibrated piezoresistive pressure/temperature sensors monitoring oil film breakdown.',
    specs: [
      { label: 'OIL PRESSURE', value: '4.2 BAR (Nominal 2.0-5.0)' },
      { label: 'OIL TEMP', value: '92.4°C (Limit: 130°C)' },
      { label: 'OIL FLOW RATE', value: '6.8 L / MIN' },
      { label: 'VIBRATION RMS', value: '2.1 mm/s (Healthy)' },
    ]
  },
  {
    id: 'fuel-injection-ecu',
    name: 'ELECTRONIC FUEL INJECTION & ECU',
    category: 'AVIONICS & COMBUSTION',
    topPct: 36,
    leftPct: 68,
    tagPosition: 'top-right',
    headline: 'Dual Redundant Multi-Point Injection Bus',
    description: 'Microprocessor-controlled injection timing and pulse-width modulation mapped against barometric manifold pressure for stoichiometric combustion at up to 25,000 ft MSL.',
    specs: [
      { label: 'INJECTION TIMING', value: '26.0° BTDC @ Cruise' },
      { label: 'FUEL FLOW', value: '24.5 L/H (Nominal)' },
      { label: 'MANIFOLD PRESS.', value: '35.4 inHg (Boosted)' },
      { label: 'AIR/FUEL RATIO', value: 'λ = 1.02 Stoichiometric' },
    ]
  },
  {
    id: 'electrical-alternator',
    name: '28V DUAL-BUS ALTERNATOR & BMS',
    category: 'ELECTRICAL POWER',
    topPct: 75,
    leftPct: 62,
    tagPosition: 'bottom-right',
    headline: 'Internal 250W Alternator & Auxiliary Generator',
    description: 'Dedicated 28V DC bus charging the avionics buffer battery and powering actuator servos, engine ECU, spark ignition coils, and telemetry transmitter arrays.',
    specs: [
      { label: 'BUS VOLTAGE', value: '28.4 V DC Regulated' },
      { label: 'ALTERNATOR LOAD', value: '14.2 AMPS / 400W' },
      { label: 'BATTERY STATE', value: '94% (Float Mode)' },
      { label: 'ELECTRICAL RUL', value: '1,840 Flight Hours' },
    ]
  }
];

export const BentoShowcaseView: React.FC = () => {
  const { syncStatus } = useTelemetry();

  // High-performance GPU-composited Scroll Progress
  const { scrollYProgress } = useScroll();

  // Interactive UI States
  const [activeHotspotId, setActiveHotspotId] = useState<string>('core-powerplant');
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [simulatedThrottle, setSimulatedThrottle] = useState<number>(82); // 82% Cruise

  // Derived Dynamic Engine Parameters from Throttle
  const derivedRPM = Math.round(4200 + (simulatedThrottle / 100) * 1600);
  const derivedCHT = (95 + (simulatedThrottle / 100) * 35).toFixed(1);
  const derivedEGT = Math.round(720 + (simulatedThrottle / 100) * 125);
  const derivedFuelFlow = (14.5 + (simulatedThrottle / 100) * 12.8).toFixed(1);
  const derivedDegradationPerHour = ((simulatedThrottle / 100) * 0.08).toFixed(3);

  // Subsystem Cards with Icons, Metrics, and Staggered Widths for Continuous Infinite Marquee
  const subsystemCards = [
    {
      id: 'thermo',
      title: 'THERMODYNAMIC CORE',
      subtitle: 'Cylinder Block & Exhaust',
      metric: `${derivedCHT}°C`,
      metricLabel: 'CHT (CYL 1-4)',
      secondaryMetric: `${derivedEGT}°C`,
      secondaryLabel: 'EGT STOICH',
      status: 'NOMINAL',
      statusColor: 'text-emerald-400',
      icon: Flame,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/15 border-amber-400/30',
      cardWidth: 'w-48 sm:w-52',
      hotspotId: 'core-powerplant',
    },
    {
      id: 'fluids',
      title: 'LUBRICATION & FUEL',
      subtitle: 'Dry-Sump & Injection Loop',
      metric: '4.2 BAR',
      metricLabel: 'OIL PRESSURE',
      secondaryMetric: `${derivedFuelFlow} L/H`,
      secondaryLabel: 'FUEL FLOW',
      status: 'OPTIMAL',
      statusColor: 'text-sky-400',
      icon: Droplet,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-400/15 border-sky-400/30',
      cardWidth: 'w-44 sm:w-48',
      hotspotId: 'lubrication-crankcase',
    },
    {
      id: 'vib-lstm',
      title: 'VIBRATION & LSTM',
      subtitle: 'Spectral Anomaly Detector',
      metric: '2.1 mm/s',
      metricLabel: 'VIB RMS 1X-2X',
      secondaryMetric: '0.012',
      secondaryLabel: 'LATENT ERROR',
      status: 'RECONSTRUCTED',
      statusColor: 'text-emerald-400',
      icon: Activity,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/15 border-emerald-400/30',
      cardWidth: 'w-52 sm:w-56',
      hotspotId: 'core-powerplant',
    },
    {
      id: 'turbo',
      title: 'TURBO BOOST & MAP',
      subtitle: 'High-Altitude Charger',
      metric: '35.4 inHg',
      metricLabel: 'MANIFOLD BOOST',
      secondaryMetric: '+0.45 BAR',
      secondaryLabel: 'DELTA P',
      status: 'REGULATED',
      statusColor: 'text-cyan-400',
      icon: Wind,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/15 border-cyan-400/30',
      cardWidth: 'w-46 sm:w-50',
      hotspotId: 'core-powerplant',
    },
    {
      id: 'electrical',
      title: '28V ELECTRICAL BUS',
      subtitle: 'Alternator & Avionics Rail',
      metric: '28.4 V',
      metricLabel: 'DC REGULATED',
      secondaryMetric: '14.2 A',
      secondaryLabel: 'LOAD CURRENT',
      status: 'ONLINE',
      statusColor: 'text-blue-400',
      icon: Zap,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/15 border-blue-400/30',
      cardWidth: 'w-44 sm:w-48',
      hotspotId: 'electrical-alternator',
    },
    {
      id: 'injection',
      title: 'ECU INJECTION TIMING',
      subtitle: 'Dual FADEC Mapping',
      metric: '26.0° BTDC',
      metricLabel: 'CRANK ADVANCE',
      secondaryMetric: 'λ = 1.02',
      secondaryLabel: 'STOICH RATIO',
      status: 'SYNCHRONIZED',
      statusColor: 'text-emerald-400',
      icon: Clock,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/15 border-purple-400/30',
      cardWidth: 'w-50 sm:w-54',
      hotspotId: 'fuel-injection-ecu',
    },
    {
      id: 'rul-engine',
      title: 'XGBOOST RUL TARGET',
      subtitle: 'Remaining Useful Life',
      metric: '580.0 H',
      metricLabel: 'TBO TIME REMAINING',
      secondaryMetric: '96.4%',
      secondaryLabel: 'MODEL CONF.',
      status: 'HEALTHY (92%)',
      statusColor: 'text-emerald-400',
      icon: Cpu,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/15 border-emerald-400/30',
      cardWidth: 'w-52 sm:w-56',
      hotspotId: 'core-powerplant',
    },
    {
      id: 'baro-env',
      title: 'BAROMETRIC AIR DATA',
      subtitle: 'Altitude Pressure & OAT',
      metric: '0.725 kg/m³',
      metricLabel: 'AIR DENSITY @ 18.5K',
      secondaryMetric: '-18.2°C',
      secondaryLabel: 'OAT TEMP',
      status: 'CALIBRATED',
      statusColor: 'text-sky-300',
      icon: Compass,
      iconColor: 'text-sky-300',
      iconBg: 'bg-sky-300/15 border-sky-300/30',
      cardWidth: 'w-48 sm:w-52',
      hotspotId: 'core-powerplant',
    }
  ];

  const activeHotspot = ENGINE_HOTSPOTS.find(h => h.id === activeHotspotId) || ENGINE_HOTSPOTS[0];

  return (
    <div className="relative w-full min-h-screen py-8 px-4 sm:px-6 md:px-10 lg:px-16 space-y-24 max-w-[1600px] mx-auto select-none">
      
      {/* Dynamic Luminous Top Scroll Progress Bar */}
      <motion.div 
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-[#0c1524] to-emerald-400 origin-left z-50 shadow-[0_0_12px_rgba(56,189,248,0.9)] pointer-events-none transform-gpu"
      />

      {/* =========================================================================
          SECTION 1: CINEMATIC FLOATING PANORAMIC VIEWPORT (USER LAYOUT REPLICA)
          ========================================================================= */}
      <motion.section 
        id="overview"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full rounded-[32px] overflow-hidden text-white hero-dense-shadow border border-slate-700/50 min-h-[760px] flex flex-col justify-between p-6 sm:p-10 lg:p-14 transform-gpu bg-[#0c1524]"
      >
        {/* Full-bleed Background Video from the Video Folder */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 scale-105 pointer-events-none"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Vignette & Radial Contrast Overlay for Crystal-Clear Text & Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1524]/90 via-[#0c1524]/60 to-[#0c1524]/75 z-0 pointer-events-none" />
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, transparent 40%, rgba(12, 21, 36, 0.85) 95%)'
          }}
        />

        {/* --- Top Navigation Header inside Viewport Canvas --- */}
        <div className="relative z-20 flex items-center justify-between border-b border-white/10 pb-5">
          {/* Brand Mark */}
          <div className="flex items-center space-x-3.5">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.92 }}
              className="w-11 h-11 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md flex items-center justify-center font-display font-extrabold text-white text-lg tracking-wider shadow-lg cursor-pointer"
            >
              AT
            </motion.div>
            <div>
              <div className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                AEROTWIN AI
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider font-bold">
                SIH26054 · MALE-UAV DIGITAL TWIN
              </div>
            </div>
          </div>

          {/* Section Anchors */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-mono tracking-wider text-slate-300 font-bold">
            <a href="#overview" className="hover:text-white transition-colors text-white font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              OVERVIEW
            </a>
            <a href="#bento-studio" className="hover:text-white transition-colors">
              BENTO STUDIO
            </a>
            <a href="#telemetry-matrix" className="hover:text-white transition-colors">
              TELEMETRY MATRIX
            </a>
            <a href="#ai-diagnostics" className="hover:text-white transition-colors">
              AI DIAGNOSTICS
            </a>
            <a href="#mission-sim" className="hover:text-white transition-colors">
              MISSION SIM
            </a>
          </nav>

          {/* Operator Status & Search Icons */}
          <div className="flex items-center space-x-3">
            <motion.button 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md flex items-center justify-center text-slate-200 transition-all shadow-sm"
              title="Search telemetry nodes"
            >
              <Search className="w-4 h-4" />
            </motion.button>
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left text-[11px] font-mono leading-tight">
                <div className="text-white font-extrabold">OPERATOR MCC</div>
                <div className="text-emerald-400 text-[9px] font-bold">UPLINK ACTIVE (20 Hz)</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Viewport Body: Left Stepper + Hero Typography & Action --- */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8">
          
          {/* Vertical Stepper Timeline (Left Edge) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="w-0.5 h-10 bg-white/20" />
              
              {/* Active Step Indicator */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-7 h-7 rounded-full bg-sky-400/30 animate-ping" />
                <span className="w-4 h-4 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,1)]" />
              </div>

              <div className="w-0.5 h-10 bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="w-0.5 h-10 bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 pt-2 font-bold">
              CRUISE 18.5K FT
            </div>
          </div>

          {/* Hero Narrative Typography Block */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-mono text-sky-200 tracking-wider font-bold">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>ROTAX 914F AERO-PISTON POWERPLANT</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white uppercase text-shadow-hero leading-[0.95]">
                AEROTWIN
              </h1>
              <div className="text-xl sm:text-2xl font-display font-bold text-slate-200 text-shadow-subtle">
                Real-Time Digital Twin for MALE-UAV Aero-Piston Engine
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 font-sans max-w-xl leading-relaxed text-shadow-subtle font-medium">
              Continuously updated virtual representation receiving live thermodynamic, lubrication, vibration, and electrical telemetry. Integrates <strong>LSTM Autoencoders</strong> for temporal sequence anomaly detection and <strong>XGBoost</strong> for predictive Remaining Useful Life (RUL) estimation under harsh operational envelopes.
            </p>

            {/* Dynamic Buttons with Spring Click Animation */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.a 
                href="#bento-studio"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="btn-dynamic-glass group flex items-center space-x-3 px-8 py-4 rounded-full font-mono text-xs font-extrabold tracking-wider shadow-lg"
              >
                <span>EXPLORE ENGINE TWIN</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 text-sky-300" />
              </motion.a>

              <motion.a 
                href="#telemetry-matrix"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="group flex items-center space-x-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white font-mono text-xs font-bold transition-all duration-300 shadow-md"
              >
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>INSPECT TELEMETRY MATRIX</span>
              </motion.a>
            </div>
          </div>

          {/* Right Preview Card / Drone Specimen */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl p-6 bg-white/10 border border-white/25 backdrop-blur-xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 pb-2 border-b border-white/10 font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  MALE-UAV LIVE CARRIER
                </span>
                <span className="text-sky-300 font-extrabold">ALT: 18,500 FT</span>
              </div>

              {/* Drone Specimen Thumbnail */}
              <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-900/70 border border-white/15 flex items-center justify-center group">
                <img 
                  src="/assets/drone-specimen.jpg" 
                  alt="AeroTwin MALE-UAV Model"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-40" />
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/15 font-bold">
                  CARRIER: AERO-SPECIMEN V8
                </div>
              </div>

              {/* Dynamic Live Telemetry Badges */}
              <div className="grid grid-cols-2 gap-2.5 text-center text-xs font-mono">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                  <div className="text-[10px] text-slate-300 font-bold">ENGINE SPEED</div>
                  <div className="text-lg font-extrabold text-white font-mono-nums">{derivedRPM} RPM</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                  <div className="text-[10px] text-slate-300 font-bold">EST. RUL</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono-nums">580.0 HRS</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- Bottom Row: Telemetry Indicators & Continuous Infinite Subsystem Marquee --- */}
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 pt-6 border-t border-white/10">
          
          {/* Bottom-Left Hardware Link Status & Stream Indicator */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 shrink-0">
            <div className="flex flex-col text-left">
              <div className="text-[10px] font-mono text-slate-300 tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MONITORED SUBSYSTEMS
              </div>
              <div className="text-[10px] font-mono text-sky-400 font-extrabold">
                CONTINUOUS TELEMETRY LOOP · {subsystemCards.length} NODES
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-4 text-[11px] font-mono text-slate-300 font-bold border-l border-white/10 pl-5">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>28V BUS: <strong className="text-white font-extrabold">NOMINAL</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>STREAM: <strong className="text-white font-extrabold">{syncStatus?.updateRateHz || 20} HZ</strong></span>
              </div>
              <div className="hidden 2xl:flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>LATENCY: <strong className="text-white font-extrabold">{syncStatus?.latencyMs || 28} MS</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Smooth Infinite Looping Horizontal Marquee (Right to Left, Zero-Jump, Edge Masking) */}
          <div className="flex-1 w-full xl:w-auto min-w-0 overflow-hidden marquee-edge-mask marquee-container-pause py-1">
            <div className="flex w-max">
              {/* Primary Infinite Track */}
              <div className="flex shrink-0 items-center gap-3.5 sm:gap-4 animate-marquee-continuous pr-3.5 sm:pr-4">
                {subsystemCards.map((item, idx) => (
                  <motion.div
                    key={`marquee-t1-${item.id}-${idx}`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`${item.cardWidth} p-3 sm:p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] hover:border-sky-400/50 backdrop-blur-md transition-all duration-200 cursor-pointer text-left shadow-md shrink-0`}
                    onClick={() => {
                      setActiveHotspotId(item.hotspotId);
                      setInspectModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <div className={`w-4 h-4 rounded-md ${item.iconBg} border flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-2.5 h-2.5 ${item.iconColor}`} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-wider font-bold truncate">
                          {item.title}
                        </span>
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-white font-mono-nums tracking-tight my-1 truncate">
                      {item.metric}
                    </div>
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono mt-0.5 text-slate-300 font-bold gap-2">
                      <span className="truncate text-slate-400">{item.metricLabel}</span>
                      <span className={`${item.statusColor} font-extrabold tracking-wider shrink-0`}>
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Duplicate Clone Track for 100% Seamless Infinite Loop with Zero Jump */}
              <div className="flex shrink-0 items-center gap-3.5 sm:gap-4 animate-marquee-continuous pr-3.5 sm:pr-4" aria-hidden="true">
                {subsystemCards.map((item, idx) => (
                  <motion.div
                    key={`marquee-t2-${item.id}-${idx}`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`${item.cardWidth} p-3 sm:p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] hover:border-sky-400/50 backdrop-blur-md transition-all duration-200 cursor-pointer text-left shadow-md shrink-0`}
                    onClick={() => {
                      setActiveHotspotId(item.hotspotId);
                      setInspectModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <div className={`w-4 h-4 rounded-md ${item.iconBg} border flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-2.5 h-2.5 ${item.iconColor}`} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-wider font-bold truncate">
                          {item.title}
                        </span>
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-white font-mono-nums tracking-tight my-1 truncate">
                      {item.metric}
                    </div>
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono mt-0.5 text-slate-300 font-bold gap-2">
                      <span className="truncate text-slate-400">{item.metricLabel}</span>
                      <span className={`${item.statusColor} font-extrabold tracking-wider shrink-0`}>
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>


      {/* =========================================================================
          SECTION 2: THE AERO-PISTON BENTO STUDIO (CLEANED UP & BOLD PALETTE)
          ========================================================================= */}
      <motion.section 
        id="bento-studio"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full space-y-8 transform-gpu"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-600 tracking-widest uppercase">
              // SECTION 02 · ARCHIVAL BENTO STUDIO
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0c1524] tracking-tight">
              MALE-UAV Aero-Piston Bento Cockpit
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 font-bold">
            MODEL: <strong className="text-[#0c1524]">ROTAX 914F TURBOCHARGED</strong> · TBO: <strong className="text-sky-600">2,000 HRS</strong>
          </div>
        </div>

        {/* --- Top Floating Navigation Capsule Bar (Options Removed as Requested!) --- */}
        <div className="w-full flex items-center justify-between p-3.5 px-6 rounded-full bg-white border border-slate-200 capsule-dense-shadow">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0c1524]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>SYS.SYNC: NOMINAL (20 HZ)</span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:flex items-center space-x-3 text-xs font-mono text-slate-600 font-bold">
              <span>LAT: 37.7749° N</span>
              <span>LNG: -122.4194° W</span>
              <span>ALT: 18,500 FT MSL</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="px-4 py-1.5 rounded-full bg-[#0c1524] text-white shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              MALE-UAV ROTAX 914F TWIN
            </span>
          </div>
        </div>

        {/* --- Main Bento Grid Container --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Bento Column (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* Top Left Bento: 1,420 / 2,000 TBO Hours Challenge */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bento-card-light p-6 flex flex-col justify-between space-y-6 bg-white border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="ops-label text-slate-500 font-bold">OPERATIONAL CYCLE</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold border border-emerald-300">
                  92.4% HEALTH
                </span>
              </div>

              <div>
                <div className="text-4xl font-display font-extrabold text-[#0c1524] tracking-tight">
                  1,420 /
                </div>
                <div className="text-3xl font-display font-extrabold text-slate-400 tracking-tight">
                  2,000 HRS
                </div>
                <div className="text-xs font-mono text-slate-600 mt-1 uppercase tracking-wider font-bold">
                  TIME BEFORE OVERHAUL (TBO)
                </div>
              </div>

              {/* Flight Hours Histogram Bar Chart */}
              <div className="space-y-2">
                <div className="flex items-end justify-between h-20 gap-1.5 pt-4 border-b border-slate-200 pb-2">
                  {[45, 60, 30, 85, 95, 70, 80, 50, 90, 65, 88].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          i === 8 ? 'bg-sky-600' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`} 
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                  <span>LAST 10 SORTIES</span>
                  <span className="text-sky-600 font-extrabold">CRUISE STABLE</span>
                </div>
              </div>

              <div className="text-[11px] font-sans text-slate-700 bg-slate-100 p-3 rounded-2xl leading-relaxed font-medium">
                Aero-piston engine operating profile exhibits continuous degradation rate within nominal bounds. <strong>580.0 flight hours</strong> remaining before depot-level teardown.
              </div>
            </motion.div>

            {/* Bottom Left Bento: Active Mission Profile */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bento-card-light p-6 space-y-4 bg-white border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="ops-label text-slate-500 font-bold">ACTIVE MISSION PROFILE</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="font-display font-extrabold text-lg text-[#0c1524]">
                ISR-ALPHA PATROL 18.5K
              </div>

              {/* Dynamic Throttle Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-600">THROTTLE DEMAND:</span>
                  <span className="font-extrabold text-sky-700">{simulatedThrottle}%</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="100"
                  value={simulatedThrottle}
                  onChange={(e) => setSimulatedThrottle(Number(e.target.value))}
                  className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>40% IDLE</span>
                  <span>75% CRUISE</span>
                  <span>100% WOT</span>
                </div>
              </div>

              {/* Key Calculated Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[9px] font-bold">FUEL BURN</div>
                  <div className="font-extrabold text-[#0c1524]">{derivedFuelFlow} L/h</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] font-bold">DERIVED RPM</div>
                  <div className="font-extrabold text-sky-700">{derivedRPM}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] font-bold">WEAR RATE</div>
                  <div className="font-extrabold text-amber-600">{derivedDegradationPerHour}/h</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Hero Bento: The Aero-Piston Carrier Specimen (6 cols) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="lg:col-span-6 bento-card-light p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-white border border-slate-200"
          >
            {/* Top Bar inside Center Bento */}
            <div className="flex items-center justify-between z-10 pb-4 border-b border-slate-200">
              <div>
                <span className="ops-label text-sky-600 font-extrabold">PHYSICAL SPECIMEN VIEW</span>
                <h3 className="text-2xl font-display font-extrabold text-[#0c1524]">
                  MALE-UAV AIRFRAME & ROTAX 914F
                </h3>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setInspectModalOpen(true)}
                className="btn-dynamic-light px-4 py-2 rounded-full text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                <span>INSPECT SPECS</span>
              </motion.button>
            </div>

            {/* Specimen Display Canvas - Clean High-Res Model Inspection */}
            <div className="relative my-6 min-h-[400px] rounded-3xl bg-radial-card border border-slate-200 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center p-6">
                <img 
                  src="/assets/drone-specimen.jpg" 
                  alt="AeroTwin Drone Model Specimen"
                  className="max-h-[360px] w-auto object-contain drop-shadow-2xl" 
                />

                {/* Interactive Hotspot Callout Pins with Click Animations */}
                {ENGINE_HOTSPOTS.map((pin) => {
                  const isActive = activeHotspotId === pin.id;
                  return (
                    <motion.div
                      key={pin.id}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute cursor-pointer transition-all duration-300"
                      style={{ top: `${pin.topPct}%`, left: `${pin.leftPct}%` }}
                      onClick={() => {
                        setActiveHotspotId(pin.id);
                        setInspectModalOpen(true);
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute w-8 h-8 rounded-full ${isActive ? 'bg-sky-500/35 animate-ping' : 'bg-slate-400/20'}`} />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-extrabold shadow-lg transition-transform ${
                          isActive 
                            ? 'bg-[#0c1524] border-sky-400 text-white scale-125' 
                            : 'bg-white border-slate-700 text-slate-800'
                        }`}>
                          +
                        </div>
                      </div>

                      {/* Leader-line pill tooltip */}
                      <div className="mt-1 px-3 py-1 rounded-full bg-[#0c1524]/90 backdrop-blur-md border border-white/20 text-white text-[9px] font-mono whitespace-nowrap shadow-lg font-bold">
                        {pin.name.split(' ')[0]} {pin.name.split(' ')[1]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Specimen Information Drawer */}
            <div className="z-10 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">ACTIVE SUBSYSTEM INSPECTOR</div>
                <div className="font-extrabold text-sm text-[#0c1524] font-display">{activeHotspot.name}</div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setInspectModalOpen(true)}
                className="btn-dynamic-primary px-6 py-2.5 rounded-full text-xs font-mono font-extrabold flex items-center gap-2 shadow-sm"
              >
                <span>OPEN SYSTEM TELEMETRY</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-300" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Bento Column: Subsystem Placeholders (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* Card 1: Thermal Gradient Diagram */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bento-card-light p-4 cursor-pointer hover:border-sky-500 transition-all bg-white border border-slate-200"
              onClick={() => setInspectModalOpen(true)}
            >
              <ThermalGradientPlaceholder className="h-44" />
            </motion.div>

            {/* Card 2: Vibration FFT Waterfall */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bento-card-light p-4 cursor-pointer hover:border-sky-500 transition-all bg-white border border-slate-200"
              onClick={() => setInspectModalOpen(true)}
            >
              <VibrationFFTPlaceholder className="h-44" />
            </motion.div>

            {/* Card 3: XGBoost RUL Degradation */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bento-card-light p-4 cursor-pointer hover:border-sky-500 transition-all bg-white border border-slate-200"
              onClick={() => setInspectModalOpen(true)}
            >
              <RULDegradationPlaceholder className="h-44" />
            </motion.div>

          </div>
        </div>
      </motion.section>


      {/* =========================================================================
          SECTION 3: REAL-TIME THERMODYNAMIC & TELEMETRY MATRIX
          ========================================================================= */}
      <motion.section 
        id="telemetry-matrix"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full space-y-8 transform-gpu"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-600 tracking-widest uppercase">
              // SECTION 03 · CALIBRATED INSTRUMENTATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0c1524] tracking-tight">
              Aero-Piston Telemetry Matrix
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 font-bold">
            TRANSDUCER STREAM: <strong className="text-emerald-700">ALL 9 SENSORS OPERATIONAL</strong>
          </div>
        </div>

        {/* Telemetry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Commanded vs Actual RPM */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-6 space-y-4 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">PROPULSION SPEED</span>
              <Gauge className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold text-[#0c1524] font-mono-nums">
                {derivedRPM} <span className="text-base text-slate-500 font-bold">RPM</span>
              </div>
              <div className="text-xs font-mono text-slate-600 mt-1 font-bold">
                TARGET: 5,450 RPM (Δ {derivedRPM - 5450} RPM)
              </div>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(derivedRPM / 5800) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>IDLE: 4200</span>
              <span>MAX: 5800 RPM</span>
            </div>
          </motion.div>

          {/* Card 2: CHT Cylinder Head Temperature */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-6 space-y-4 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">CYLINDER HEAD TEMP</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold text-[#0c1524] font-mono-nums">
                {derivedCHT} <span className="text-base text-slate-500 font-bold">°C</span>
              </div>
              <div className="text-xs font-mono text-emerald-700 mt-1 font-extrabold">
                NOMINAL THERMAL ENVELOPE
              </div>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(Number(derivedCHT) / 135) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>WARN: 125°C</span>
              <span>REDLINE: 135°C</span>
            </div>
          </motion.div>

          {/* Card 3: Oil Pressure & Temperature */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-6 space-y-4 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">LUBRICATION LOOP</span>
              <Droplet className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold text-[#0c1524] font-mono-nums">
                4.2 <span className="text-base text-slate-500 font-bold">BAR</span>
              </div>
              <div className="text-xs font-mono text-slate-600 mt-1 font-bold">
                OIL TEMP: 92.4°C (LIMIT: 130°C)
              </div>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: '70%' }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>MIN: 2.0 BAR</span>
              <span>MAX: 5.0 BAR</span>
            </div>
          </motion.div>

          {/* Card 4: Fuel Consumption & Flow */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-6 space-y-4 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">FUEL FLOW RATE</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold text-[#0c1524] font-mono-nums">
                {derivedFuelFlow} <span className="text-base text-slate-500 font-bold">L/h</span>
              </div>
              <div className="text-xs font-mono text-slate-600 mt-1 font-bold">
                EST. FLIGHT TIME: 4.8 HOURS
              </div>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(Number(derivedFuelFlow) / 30) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>LEAN: 18 L/h</span>
              <span>WOT: 28 L/h</span>
            </div>
          </motion.div>

        </div>
      </motion.section>


      {/* =========================================================================
          SECTION 4: AI PREDICTIVE ANALYTICS & DEGRADATION LAB
          ========================================================================= */}
      <motion.section 
        id="ai-diagnostics"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full space-y-8 transform-gpu"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-600 tracking-widest uppercase">
              // SECTION 04 · DUAL AI ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0c1524] tracking-tight">
              LSTM Autoencoder & XGBoost Predictive Lab
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 font-bold">
            PIPELINE: <strong className="text-[#0c1524]">TIME-SERIES ANOMALY + RUL REGRESSION</strong>
          </div>
        </div>

        {/* Dual AI Model Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Model 1: LSTM Autoencoder Anomaly Detection */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-8 space-y-6 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#0c1524]">LSTM Autoencoder</h3>
                  <div className="text-xs font-mono text-slate-500 font-bold">Temporal Sequence Anomaly Detection</div>
                </div>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-extrabold border border-emerald-300">
                LOSS: 0.012 (NOMINAL)
              </span>
            </div>

            <p className="text-sm text-slate-700 font-sans leading-relaxed font-medium">
              Processes sliding historical telemetry sequences (RPM, CHT, EGT, vibration, oil pressure) through an encoder-decoder neural bottleneck. Reconstruction error tracks deviations from learned healthy combustion dynamics.
            </p>

            {/* Reconstruction Loss Gauge Chart */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-700 font-extrabold">CURRENT RECONSTRUCTION ERROR</span>
                <span className="text-emerald-700 font-extrabold">0.012 / THRESHOLD: 0.045</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '26%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                <span>0.000 (PERFECT RECONSTRUCTION)</span>
                <span className="text-red-600 font-extrabold">0.045 (ANOMALY TRIGGER)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold">SEQUENCE LEN</div>
                <div className="font-extrabold text-[#0c1524]">60 STEPS</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold">INFERENCE TIME</div>
                <div className="font-extrabold text-sky-700">8.4 MS</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold">FALSE ALARM</div>
                <div className="font-extrabold text-emerald-700">&lt; 0.3%</div>
              </div>
            </div>
          </motion.div>

          {/* Model 2: XGBoost Degradation & RUL Classifier */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bento-card-light p-8 space-y-6 bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#0c1524]">XGBoost Regressor</h3>
                  <div className="text-xs font-mono text-slate-500 font-bold">Remaining Useful Life (RUL) & Fault Class</div>
                </div>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-mono font-extrabold border border-sky-300">
                CONFIDENCE: 96.4%
              </span>
            </div>

            <p className="text-sm text-slate-700 font-sans leading-relaxed font-medium">
              Gradient-boosted decision trees trained on structured telemetry aggregates, operating hours, cycle stress count, and thermal excursions. Yields calibrated operational hours remaining until scheduled overhaul.
            </p>

            {/* Component RUL Breakdown */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                  <span className="text-slate-800">ENGINE BLOCK & PISTONS</span>
                  <span className="text-sky-700 font-extrabold">580.0 FLIGHT HRS</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '71%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                  <span className="text-slate-800">TURBOCHARGER BEARINGS</span>
                  <span className="text-amber-700 font-extrabold">410.5 FLIGHT HRS</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                  <span className="text-slate-800">HIGH-PRESSURE OIL PUMP</span>
                  <span className="text-emerald-700 font-extrabold">720.0 FLIGHT HRS</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-200 flex justify-between font-bold">
              <span>TARGET OVERHAUL: 2,000 HRS</span>
              <span className="text-emerald-700 font-extrabold">NO UNPLANNED TEARDOWN REQUIRED</span>
            </div>
          </motion.div>

        </div>
      </motion.section>


      {/* =========================================================================
          SECTION 5: MISSION SCENARIO & ENVIRONMENTAL SIMULATOR
          ========================================================================= */}
      <motion.section 
        id="mission-sim"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full space-y-8 pb-12 transform-gpu"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-600 tracking-widest uppercase">
              // SECTION 05 · ENVIRONMENTAL ENVELOPE
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0c1524] tracking-tight">
              Operational Scenario & Stress Simulation
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 font-bold">
            PHYSICAL DYNAMICS: <strong className="text-sky-600">ALTITUDE · TEMPERATURE · DENSITY</strong>
          </div>
        </div>

        {/* Environmental Preset Cards with Click Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.div 
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="bento-card-light p-6 space-y-4 hover:border-sky-500 cursor-pointer transition-all bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">SCENARIO 01</span>
              <Wind className="w-4 h-4 text-sky-600" />
            </div>
            <div className="font-display font-extrabold text-lg text-[#0c1524]">HIGH ALTITUDE (25K FT)</div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Rarefied air density (0.54 kg/m³). Turbocharger wastegate engages full boost; reduced convective cooling increases cylinder head thermal stress.
            </p>
            <div className="text-[10px] font-mono text-sky-600 font-extrabold pt-2 border-t border-slate-200">
              WASTEGATE: 98% ENGAGED
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="bento-card-light p-6 space-y-4 hover:border-amber-500 cursor-pointer transition-all bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">SCENARIO 02</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-display font-extrabold text-lg text-[#0c1524]">HOT WEATHER (45°C)</div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Elevated ambient ground temps test oil cooler heat-rejection limits. CHT approaches caution threshold at full takeoff throttle demand.
            </p>
            <div className="text-[10px] font-mono text-amber-600 font-extrabold pt-2 border-t border-slate-200">
              OIL COOLER: 100% FLOW
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="bento-card-light p-6 space-y-4 hover:border-emerald-500 cursor-pointer transition-all bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">SCENARIO 03</span>
              <Compass className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-display font-extrabold text-lg text-[#0c1524]">LONG-ENDURANCE PATROL</div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Extended 14-hour steady cruise at 75% throttle. Steady-state lubrication temperature allows precise baseline vibration harmonic tracking.
            </p>
            <div className="text-[10px] font-mono text-emerald-600 font-extrabold pt-2 border-t border-slate-200">
              CRUISE EFFICIENCY: OPTIMAL
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="bento-card-light p-6 space-y-4 hover:border-red-500 cursor-pointer transition-all bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="ops-label font-bold">SCENARIO 04</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="font-display font-extrabold text-lg text-[#0c1524]">FAULT INJECTION BENCH</div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Controlled introduction of injector clogging, oil pressure loss, or bearing vibration unbalance to benchmark AI model detection speed.
            </p>
            <div className="text-[10px] font-mono text-red-600 font-extrabold pt-2 border-t border-slate-200">
              SAFETY INTERLOCK: ACTIVE
            </div>
          </motion.div>

        </div>
      </motion.section>


      {/* =========================================================================
          INSPECTION MODAL: HARDWARE SUBSYSTEM DETAIL
          ========================================================================= */}
      <AnimatePresence>
        {inspectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 border border-slate-300 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="ops-label text-sky-600 font-extrabold">{activeHotspot.category}</span>
                  <h3 className="text-2xl font-display font-extrabold text-[#0c1524]">{activeHotspot.name}</h3>
                  <div className="text-xs font-mono text-slate-500 mt-0.5 font-bold">{activeHotspot.headline}</div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setInspectModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
                {activeHotspot.description}
              </p>

              {/* Technical Specifications Matrix */}
              <div className="space-y-2">
                <div className="ops-label text-slate-500 font-bold">CALIBRATED SUBSYSTEM PARAMETERS</div>
                <div className="grid grid-cols-2 gap-3">
                  {activeHotspot.specs.map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-mono text-slate-400 font-bold">{s.label}</div>
                      <div className="text-sm font-mono font-extrabold text-[#0c1524] mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs font-mono">
                <span className="text-emerald-700 font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  CALIBRATION CERTIFIED (SIH26054)
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setInspectModalOpen(false)}
                  className="btn-dynamic-primary px-7 py-3 rounded-full text-xs font-mono font-extrabold shadow-sm"
                >
                  DISMISS INSPECTOR
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

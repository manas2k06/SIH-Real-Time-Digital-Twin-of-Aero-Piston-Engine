<div align="center">

# ✈️ AEROTWIN AI

### Real-Time AI Digital Twin for MALE-UAV Aero-Piston Engine (Rotax 914 F)

**Smart India Hackathon 2026 · Problem Statement SIH26054**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r165-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

*A software-based AI-enabled real-time Digital Twin system for continuous monitoring, multi-physics simulation, anomaly detection, failure prediction, component degradation tracking, Remaining Useful Life (RUL) estimation, mission replay, and 25-fault testbench validation for the certified BRP-Rotax 914 F aero-piston engine powering Medium-Altitude Long-Endurance (MALE) Unmanned Aerial Vehicles.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Capabilities](#-key-capabilities)
- [BRP-Rotax 914 F Engine Specification](#-brp-rotax-914-f-engine-specification)
- [System Architecture](#-system-architecture)
- [Interactive 3D Digital Twin](#-interactive-3d-digital-twin)
- [Engine Telemetry Parameters (60+ Variables)](#-engine-telemetry-parameters-60-variables)
- [25 Authentic Fault Injections & Testbench](#-25-authentic-fault-injections--testbench)
- [AI / ML Diagnostics & RUL Pipeline](#-ai--ml-diagnostics--rul-pipeline)
- [Tech Stack](#-tech-stack)
- [Dashboard & Telemetry Screenshots](#-dashboard--telemetry-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Team & Acknowledgements](#-team--acknowledgements)
- [License](#-license)

---

## 🔍 Overview

**AeroTwin AI** is a cyber-physical digital twin engineered to bridge physical aero-engine dynamics with predictive artificial intelligence. Built specifically around the **BRP-Rotax 914 F** certified aircraft engine — the global industry standard for tactical MALE UAVs — this platform provides engineering-grade telemetry streaming, multi-subsystem simulation, time-series anomaly detection via **LSTM Autoencoders**, multi-label fault classification via **XGBoost Ensembles**, and proactive **Remaining Useful Life (RUL)** prognosis.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AEROTWIN AI END-TO-END TELEMETRY PIPELINE                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
 ┌───────────────────────┐      ┌────────────────────────┐      ┌───────────────────────┐
 │ Rotax 914F Multi-     │ ───► │ High-Frequency Stream  │ ───► │ Digital Twin Core     │
 │ Physics Engine Sim    │      │ (20 Hz Telemetry Loop) │      │ (State Sync & Buffer) │
 └───────────────────────┘      └────────────────────────┘      └───────────┬───────────┘
                                                                            │
      ┌─────────────────────────────────────────────────────────────────────┴──────────┐
      ▼                                                                                ▼
┌───────────────────────────┐                                            ┌─────────────────────────┐
│ AI Predictive Pipeline    │                                            │ 3D Twin & GCS Viewports │
│ ├─ LSTM Temporal Autoenc. │                                            │ ├─ Rotax 914F 3D Engine │
│ ├─ XGBoost Classifiers    │                                            │ ├─ MALE-UAV Airframe    │
│ ├─ Subsystem Health Ranks │                                            │ ├─ 8 Telemetry Consoles │
│ └─ Component RUL Regress. │                                            │ └─ 25-Fault Testbench   │
└─────────────┬─────────────┘                                            └────────────┬────────────┘
              │                                                                       │
              └───────────────────────────────► ◄─────────────────────────────────────┘
                                                │
                                                ▼
                                ┌───────────────────────────────┐
                                │ Actionable Maintenance &      │
                                │ Airworthiness Advisories      │
                                └───────────────────────────────┘
```

> **Engineering Principle:** The Digital Twin is an active operational state model rather than a static visual asset. The 3D model geometry, thermal heatmaps, rotor velocities, boost dynamics, and vibration vectors are continuously synchronized with the live multi-physics mathematical model in real time.

---

## ✨ Key Capabilities

| Feature | Engineering Description |
|---|---|
| **Rotax 914 F Engine Modeling** | Full thermodynamic and kinematic simulation of the 4-stroke boxer engine, dry-sump lubrication, twin Bing 64 carburetors, turbocharger with TCU automatic wastegate, and 2.43:1 reduction gearbox. |
| **Interactive 3D Digital Twin** | Dedicated Three.js procedural 3D model with component isolation, exploded views, interactive inspection callouts, and real-time operational state synchronization (RPM spin, thermal shading, vibration flutter). |
| **Dual Viewport Twin Architecture** | Instant toggling between the dedicated **Rotax 914 F Powerplant Twin** (cylinder heads, turbocharger, wastegate, carburetors, oil tank, gearbox) and the full **MALE-UAV Airframe Twin**. |
| **60+ High-Density Telemetry Streams** | Exhaustive parameter coverage across 8 physical subsystems: CHT/EGT per cylinder, MAP, boost pressure, fuel line delta, oil gallery metrics, tri-axial vibration, and electrical buses. |
| **25 Authentic Fault Injections** | Comprehensive testbench covering 25 real-world aero-engine failure modes across 8 physical subsystems with tunable severity, instant injection, and automated clearing. |
| **Dual-Model AI Architecture** | Unsupervised **LSTM Autoencoder** for temporal anomaly detection paired with a multi-subsystem **XGBoost Ensemble Classifier** for fault localization and root-cause isolation. |
| **Component RUL Estimation** | Physics-informed and data-driven Remaining Useful Life prognosis across core powerplant, turbocharger, reduction gearbox, oil pump, ignition, and carburetors towards 2,000h TBO. |
| **Sensor Provenance Tracking** | Every health metric is tagged with its analytical provenance (`SENSOR_DERIVED`, `RULE_BASED`, `MODEL_DERIVED`, `SIMULATED`) for certification auditability. |
| **Mission Replay & Telemetry Scrubber** | Timeline-scrubbed historical mission playback for post-flight incident investigation, exceedance analysis, and degradation reviews. |
| **Aeronautical Context Simulation** | Altitude compensation, density altitude calculation, ISA temperature deviation, crosswind compensation, and critical turbo altitude modeling (~4,800 m / 15,700 ft). |

---

## ⚙️ BRP-Rotax 914 F Engine Specification

The system is rigorously tailored to the official technical documentation and certified limits of the **BRP-Rotax 914 F** (Type Certificate EASA.E.122 / FAA E00058EN):

```
┌───────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Engineering Parameter                 │ Certified Factory Specification                        │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Model & Architecture                  │ BRP-Rotax 914 F — 4-Cylinder Horizontally Opposed      │
│ Operating Cycle                       │ 4-Stroke Spark-Ignition with Central Camshaft & OHV    │
│ Bore x Stroke / Displacement          │ 79.5 mm x 61.0 mm / 1,211.2 cm³ (73.91 cu in)          │
│ Compression Ratio                     │ 9.0 : 1                                                │
│ Induction & Forced Aspiration         │ Turbocharger with Electronic TCU & Automatic Wastegate │
│ Carburetion                           │ 2x Constant Depression Carburetors (Bing 64)           │
│ Ignition Architecture                 │ Dual Ducati Capacitor Discharge Ignition (CDI), 8 Plugs│
│ Cooling System                        │ Mixed: Liquid-Cooled Heads + Ram-Air-Cooled Cylinders  │
│ Lubrication System                    │ Dry Sump Forced Lubrication with External Oil Tank     │
│ Power Transmission                    │ Propeller Reduction Gearbox (Ratio 2.42857 : 1, 51:21) │
│ Max Takeoff Power (5 min limit)       │ 115 HP (84.5 kW) @ 5,800 RPM · 39.0 inHg MAP           │
│ Max Continuous Power                  │ 100 HP (73.5 kW) @ 5,500 RPM · 35.4 inHg MAP           │
│ Max Engine Torque                     │ 144.0 Nm @ 4,900 RPM                                   │
│ Time Before Overhaul (TBO)            │ 2,000 Operating Hours                                  │
│ Dry Weight                            │ 74.4 kg (Config 3 with hydraulic governor drive)       │
│ Critical Turbo Altitude               │ 4,800 m (~15,700 ft MSL)                               │
└───────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🏗 System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TELEMETRY SOURCE & MULTI-PHYSICS                          │
│  ┌───────────────────────────────┐          ┌──────────────────────────────────────┐  │
│  │ Rotax 914F Thermodynamic Core │          │ 6-DOF Aeronautical & Wind Sim        │  │
│  │ ├─ Boxer Combustion (4-Cyl)   │          │ ├─ Density Altitude & ISA Gradient   │  │
│  │ ├─ Turbocharger & TCU Loop    │          │ ├─ Waypoint Navigation (15 Points)   │  │
│  │ ├─ Twin Bing 64 Carburetors   │          │ ├─ True & Calibrated Airspeed        │  │
│  │ └─ Dry-Sump Hydraulic Circuit │          │ └─ Tri-Axial Frame Acceleration (G)  │  │
│  └───────────────┬───────────────┘          └──────────────────┬───────────────────┘  │
│                  └──────────────────────┬──────────────────────┘                      │
└─────────────────────────────────────────┼─────────────────────────────────────────────┘
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DIGITAL TWIN REAL-TIME CORE                               │
│  ┌───────────────────────────────┐          ┌──────────────────────────────────────┐  │
│  │ Synchronous State Engine      │          │ 25-Fault Injection Matrix            │  │
│  │ ├─ 20 Hz Telemetry Dispatched │          │ ├─ Real-Time Parameter Perturbation  │  │
│  │ ├─ Sliding Window Buffers     │          │ ├─ Automated Redundancy Failover     │  │
│  │ └─ Ring Buffer History Log    │          │ └─ Sensor Integrity / Dropout Sim    │  │
│  └───────────────┬───────────────┘          └──────────────────┬───────────────────┘  │
│                  └──────────────────────┬──────────────────────┘                      │
└─────────────────────────────────────────┼─────────────────────────────────────────────┘
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PREDICTIVE AI ANALYSIS LAYER                              │
│  ┌───────────────────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Model 1: LSTM Autoencoder             │  │ Model 2: XGBoost Subsystem Ensemble  │  │
│  │ ├─ 60-Step Temporal Sliding Window    │  │ ├─ 8 Subsystem Classification Heads   │  │
│  │ ├─ Multi-Channel Feature Vectors      │  │ ├─ Feature Importance Breakdown       │  │
│  │ ├─ Reconstruction Error Scoring       │  │ ├─ Component Degradation Rate        │  │
│  │ └─ +10s / +30s / +60s Horizon Project │  │ └─ Component RUL Regression (Hours)   │  │
│  └───────────────────┬───────────────────┘  └──────────────────┬───────────────────┘  │
│                      └──────────────────┬──────────────────────┘                      │
└─────────────────────────────────────────┼─────────────────────────────────────────────┘
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               OPERATIONAL HMI & 3D VIEWPORTS                           │
│  ┌─────────────────────────┐   ┌───────────────────────────┐   ┌────────────────────┐ │
│  │ Rotax 914F 3D Twin View │   │ Deep Telemetry Consoles   │   │ Fault Testbench &  │ │
│  │ ├─ Boxer Cylinder Heads │   │ ├─ Operating Powertrain   │   │ Predictive Reports │ │
│  │ ├─ Turbocharger & Waste │   │ ├─ 4-Cylinder Thermal Map │   │ ├─ 25-Fault Bench  │ │
│  │ ├─ Twin Bing 64 Carbs   │   │ ├─ Turbo & TCU Induction  │   │ ├─ Root-Cause Tree │ │
│  │ ├─ 2.43:1 Gearbox Flange│   │ ├─ Dry-Sump Lubrication   │   │ ├─ RUL Health Deck │ │
│  │ └─ External Oil Tank    │   │ └─ Dual CDI Electrical Bus│   │ └─ Mission Replay  │ │
│  └─────────────────────────┘   └───────────────────────────┘   └────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Interactive 3D Digital Twin

The 3D visualization layer built with **Three.js** and **React Three Fiber** delivers a high-fidelity interactive representation of the engine:

- **Twin View Switcher**: Instant switching between the **Rotax 914 F Engine 3D Model** and the **MALE-UAV Airframe Twin**.
- **Crankcase & Boxer Banks**: Horizontally opposed 4-cylinder layout with ribbed air-cooling barrels and signature red Rotax cylinder head covers.
- **Turbocharger & TCU Actuator**: Detailed compressor housing, turbine scroll, intercooler ducting, and animated wastegate servo linkage.
- **Twin Bing 64 Carburetors**: Dual constant-depression carburetors with intake plenums, throttle levers, and drip tray drains.
- **Propeller Speed Reduction Gearbox**: Housing reduction ratio of 2.42857 : 1 (51T / 21T) with rotating propeller flange and spinner.
- **Dry-Sump Oil Reservoir**: External aluminum oil tank, spin-on oil filter canister, and high-pressure oil lines.
- **Inspection Hotspots**: Interactive 3D callouts displaying certified specs from the Rotax Installation Manual upon clicking.
- **Camera Presets**: Fast viewpoint jumping to Isometric (`ISO`), Front Flange (`FRONT`), Boxer Cylinders (`CYLINDERS`), Turbocharger (`TURBO`), and Overhead (`TOP`).

---

## 📊 Engine Telemetry Parameters (60+ Variables)

The digital twin continuously processes, displays, and analyzes 60+ physical engine parameters across **8 specialized subsystems**:

### 1. Core Operating Powertrain
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Crankshaft Speed** | `operating.rpm` | RPM | 4,800 – 5,500 | 5,800 (5 min takeoff) | Power output & rotational dynamics |
| **Commanded Speed** | `operating.targetRpm` | RPM | 1,400 – 5,800 | 5,800 | Governor tracking & throttle loop |
| **Speed Tracking Error** | `operating.rpmError` | RPM | ± 25 | ± 150 | Throttle response / mechanical hunting |
| **Throttle Opening** | `operating.throttlePosition` | % | 0 – 100 | 104% (Takeoff detent) | Pilot demand & engine load state |
| **Calculated Load** | `operating.engineLoad` | % | 40 – 85 | 100% | BMEP & torque generation reference |
| **Shaft Torque** | `operating.torque` | Nm | 110 – 140 | 144.0 Nm @ 4,900 RPM | Mechanical powertrain stress |
| **Brake Power (kW)** | `operating.powerKw` | kW | 50 – 73.5 | 84.5 kW (115 HP) | Useful mechanical power produced |
| **Fuel Mass Burn (BSFC)**| `operating.bsfcGkwh` | g/kWh | 275 – 295 | > 350 | Thermodynamic combustion efficiency |
| **Power-to-Weight** | `operating.powerToWeight` | kW/kg | 0.95 – 1.05 | 1.136 kW/kg | Powertrain performance metric |
| **Operating State** | `operating.operatingMode` | Enum | CRUISE / CLIMB | ABNORMAL | Operational state & safety envelope |

### 2. 4-Cylinder Boxer Combustion & Gas Path
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Cylinder 1 CHT** | `cylinders.cylinder_1.cht` | °C | 90 – 115 | 135°C (275°F) | Left-front thermal state |
| **Cylinder 2 CHT (Primary)** | `cylinders.cylinder_2.cht` | °C | 95 – 120 | 135°C (275°F) | Primary sensor head (critical) |
| **Cylinder 3 CHT (Secondary)** | `cylinders.cylinder_3.cht` | °C | 90 – 115 | 135°C (275°F) | Secondary instrumentation head |
| **Cylinder 4 CHT** | `cylinders.cylinder_4.cht` | °C | 90 – 115 | 135°C (275°F) | Right-rear thermal state |
| **CHT Thermal Spread** | `cylinders.chtSpread` | Δ °C | < 12.0 | > 25.0°C | Cylinder cooling / mixture imbalance |
| **Per-Cylinder EGT (1–4)** | `cylinders.cylinder_X.egt` | °C | 720 – 880 | 950°C (1,740°F) | Exhaust gas combustion temperature |
| **EGT Bank Spread** | `cylinders.egtSpread` | Δ °C | < 45 | > 85°C | Carburetor jetting / bank skew |
| **Cylinder Wall Temp** | `cooling.ramAirCooling.cylinderWallTemperature` | °C | 120 – 165 | 200°C (392°F) | Cylinder barrel barrel heat soak |
| **Misfire Indication** | `cylinders.cylinder_X.misfireIndication` | Bool | False | True | Spark drop or injector starvation |

### 3. Turbocharger & TCU Induction Loop
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Compressor Speed** | `turbocharger.turbochargerRpm` | RPM | 65,000 – 115,000 | 130,000 RPM | Rotor shaft inertia & spool speed |
| **Manifold Pressure (MAP)** | `intake.map` | inHg | 28.0 – 35.4 | 39.0 inHg (Takeoff limit) | Plenum air density & charge volume |
| **Boost Differential** | `intake.pressureDifferential` | bar | 0.15 – 0.30 | 0.35 bar (Overboost) | Forced induction density delta |
| **Wastegate Position** | `turbocharger.wastegate.position` | % | 20 – 85 | 0% (Closed) / 100% (Open) | Exhaust bypass regulatory position |
| **TCU Operating Status** | `turbocharger.tcu.status` | Enum | ONLINE | FAULT | Electronic boost computer status |
| **TCU Caution & Boost Lamps**| `turbocharger.tcu.boostWarningLamp` | Bool | False | True | Cockpit warning lamp activation |
| **Airbox Charge Temp** | `intake.airboxTemperatureC` | °C | 35 – 65 | 72°C (162°F) max | Intercooler efficiency & knock limit |
| **Airfilter Restriction** | `intake.intakeRestrictionHpa` | hPa | 1.5 – 3.5 | 5.0 hPa max | Induction air filter blockage |

### 4. Fuel System & Twin Bing 64 Carburetors
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Fuel Flow Rate** | `fuel_system.fuelFlow` | L/h | 18.0 – 26.5 | 33.0 L/h max | Fuel burn rate & consumption |
| **System Delivery Pressure** | `fuel_system.fuelPressure` | bar | 2.2 – 3.6 | < 1.8 bar (Starvation) | Diaphragm regulated fuel pressure |
| **Fuel Delta over Airbox** | `fuel_system.fuelPressureDeltaOverAirbox` | bar | 0.20 – 0.30 | 0.25 bar nominal (±0.1) | Pressure required above airbox |
| **Electric Fuel Pump 1 (Main)** | `fuel_system.pump_1.state` | Enum | ACTIVE | FAULT (0.0 V, 0.0 A) | Primary 12V DC electric vane pump |
| **Electric Fuel Pump 2 (Aux)** | `fuel_system.pump_2.state` | Enum | STANDBY / ACTIVE | FAULT | Redundant backup electric pump |
| **Carburetor Balance** | `carburetors.balance` | % | 94 – 100 | < 80% (Severe skew) | Bing 64 throttle synchronization |
| **Carb Slide Positions (1/2)**| `carburetors.carburetor_X.slidePosition` | % | 25 – 85 | 100% | Constant-depression vacuum pistons |
| **Air/Fuel Ratio & Lambda** | `operating.airFuelRatio` / `lambda` | Ratio | 14.5 – 14.9 (λ~1.0)| < 12.5 (Rich) / > 16 (Lean) | Stoichiometric combustion quality |
| **Fuel Temperature** | `fuel_system.fuelTemperature` | °C | 15 – 35 | 45°C (113°F) max | Vapor lock prevention threshold |

### 5. Dual Electronic Ignition (Ducati CDI)
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Ignition Circuit A** | `ignition.ignition_A.status` | Enum | ACTIVE | FAULT | Primary CDI box (Top 1,2 + Lower 3,4) |
| **Ignition Circuit B** | `ignition.ignition_B.status` | Enum | ACTIVE | FAULT | Secondary CDI box (Top 3,4 + Lower 1,2)|
| **Ignition Timing** | `ignition.ignitionTiming` | ° BTDC | 22.0 – 26.0 | 26.0° BTDC nominal | Spark timing advance curve |
| **Spark Plug Array (8x)** | `ignition.sparkPlugStatus` | Enum[8] | All OK | FAULT | Individual plug ignition verification |
| **Dual CDI Consistency** | `ignition.dualIgnitionConsistency` | % | 98.0 – 100.0 | < 90.0% | Stator coil & trigger synchronization |

### 6. Mixed Head/Cylinder Cooling Architecture
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Coolant Exit Temperature** | `cooling.coolantTemperature` | °C | 80 – 105 | 120°C (248°F) max | Liquid cylinder head jacket cooling |
| **Expansion Loop Pressure** | `cooling.coolantPressure` | bar | 1.10 – 1.25 | 1.20 bar cap relief | Pressurized closed-loop circuit |
| **Coolant Circulation Flow** | `cooling.coolantFlow` | L/min | 35 – 58 | < 18 L/min (Cavitation) | Mechanical water pump delivery |
| **Radiator Heat Rejection** | `cooling.liquidCooling.radiatorHeatDissipationKw`| kW | 15 – 30 | ~35 kW capacity | Radiator thermal dissipation load |
| **Ram Air Fin Velocity** | `cooling.coolingAirFlow` | m/s | 15 – 35 | < 8 m/s (Low speed) | Airflow through cylinder fin baffles |
| **Overall Cooling Health** | `cooling.coolingEfficiency` | % | 90 – 100 | < 60% | Combined liquid/air cooling capacity |

### 7. Dry-Sump Forced Lubrication System
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Oil Gallery Pressure** | `oil_system.oil_pump.pressureBar` | bar | 2.0 – 5.0 | 1.5 bar min / 7.0 bar max | Hydrodynamic bearing lubrication |
| **Oil Temperature** | `oil_system.lubrication_circuit.oilTemperature` | °C | 90 – 110 | 130°C (266°F) redline | Lubricant thermal breakdown & cooling |
| **Oil Reservoir Level** | `oil_system.oil_tank.levelPercent` | % | 85 – 100 | < 60% (Starvation risk)| External 2.8L aluminum tank quantity |
| **Scavenge Return Flow** | `oil_system.oil_pump.flowRateLmin` | L/min | 5.5 – 8.5 | < 3.0 L/min | Crankcase scavenge pump operation |
| **Crankcase Pressure** | `oil_system.oil_pump.crankcasePressureBar` | bar | 0.10 – 0.25 | 0.45 bar max | Ring blow-by & crankcase breather |
| **Oil Filter Delta-P** | `oil_system.oil_filter.differentialPressureBar`| bar | 0.15 – 0.35 | > 0.8 bar (Bypass open) | Filter element particulate clogging |

### 8. Propeller Reduction Gearbox (Ratio 2.43:1) & Propeller
| Parameter | Symbol / Key | Unit | Nominal Range | Certified Limit / Redline | Diagnostic Purpose |
|---|---|---|---|---|---|
| **Crankshaft Input RPM** | `gearbox.engine_input_rpm` | RPM | 4,800 – 5,500 | 5,800 RPM | Engine input shaft speed |
| **Propeller Flange RPM** | `gearbox.propeller_output_rpm` | RPM | 1,976 – 2,265 | 2,388 RPM | Flange speed (Engine RPM / 2.42857) |
| **Overload Slipper Clutch** | `gearbox.overloadClutchStatus` | Enum | ENGAGED | SLIPPING / LOCK | Torsional protection clutch state |
| **Gearbox Housing Temp** | `gearbox.gearbox_temperature` | °C | 70 – 95 | 115°C (239°F) max | Gear tooth friction & heat soak |
| **Gearbox Vibration** | `gearbox.gearbox_vibration` | mm/s | 1.2 – 2.8 | > 6.0 mm/s (Flutter) | Dog clutch flutter / mechanical shock |
| **Propeller Shaft Torque** | `gearbox.gearbox_torque` | Nm | 250 – 320 | 340 Nm max | Torque delivered to propeller hub |
| **Propeller Blade Pitch** | `propeller.propellerPitchDeg` | deg | 18.0 – 25.0 | Governed range | Constant-speed governor control |
| **Propeller Thrust** | `propeller.propellerThrustN` | N | 1,800 – 2,600 | 3,100 N | Aerodynamic propulsive force |

---

## 🧪 25 Authentic Fault Injections & Testbench

The **Fault Testbench** implements 25 authentic aero-engine failure modes modeled directly from certified Rotax service bulletins and aerospace failure mode effects analyses (FMEA). Every fault triggers multi-parameter physical cascading effects and tests the AI model's detection and isolation capabilities:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        25 AUTHENTIC ROTAX 914 F FAULT MODES MATRIX                     │
├─────┬──────────────────────────┬──────────────────────┬──────────┬─────────────────────┤
│ No. │ Fault Code / Type        │ Physical Subsystem   │ Severity │ Target AI Anomaly   │
├─────┼──────────────────────────┼──────────────────────┼──────────┼─────────────────────┤
│  1  │ TURBO_OVERBOOST          │ Turbocharger & TCU   │ CRITICAL │ Turbo Induction     │
│  2  │ TURBO_WASTEGATE_STUCK    │ Turbocharger & TCU   │ WARNING  │ Turbo Induction     │
│  3  │ TCU_FAULT                │ Turbocharger & TCU   │ WARNING  │ Turbo Induction     │
│  4  │ TURBO_DEGRADATION        │ Turbocharger & TCU   │ WARNING  │ Turbo Induction     │
│  5  │ FUEL_SYSTEM_LEAK         │ Fuel & Carburetors   │ CRITICAL │ Fuel Delivery       │
│  6  │ FUEL_PUMP_1_FAILURE      │ Fuel & Carburetors   │ WARNING  │ Fuel Delivery       │
│  7  │ FUEL_PUMP_2_FAILURE      │ Fuel & Carburetors   │ WARNING  │ Fuel Delivery       │
│  8  │ CARBURETOR_IMBALANCE     │ Fuel & Carburetors   │ WARNING  │ Fuel & Carburetors  │
│  9  │ CYLINDER_MISFIRE         │ Dual CDI Ignition    │ CRITICAL │ Ignition / CHT      │
│ 10  │ IGNITION_A_FAILURE       │ Dual CDI Ignition    │ WARNING  │ Ignition System     │
│ 11  │ IGNITION_B_FAILURE       │ Dual CDI Ignition    │ WARNING  │ Ignition System     │
│ 12  │ ENGINE_OVERHEATING       │ Mixed Cooling System │ CRITICAL │ Thermodynamic Core  │
│ 13  │ COOLANT_TEMP_RISE        │ Mixed Cooling System │ CRITICAL │ Liquid Cooling Loop │
│ 14  │ REDUCED_COOLANT_FLOW     │ Mixed Cooling System │ WARNING  │ Liquid Cooling Loop │
│ 15  │ OIL_PRESSURE_LOSS        │ Dry-Sump Lubrication │ CRITICAL │ Lubrication System  │
│ 16  │ HIGH_OIL_TEMP            │ Dry-Sump Lubrication │ CRITICAL │ Lubrication System  │
│ 17  │ OIL_SYSTEM_DEGRADATION   │ Dry-Sump Lubrication │ WARNING  │ Lubrication System  │
│ 18  │ GEARBOX_VIBRATION        │ Reduction Gearbox    │ CRITICAL │ Reduction Gearbox   │
│  19 │ BEARING_DEGRADATION      │ Mechanical Integrity │ CRITICAL │ Mechanical Bearings │
│ 20  │ GEARBOX_TEMP_INCREASE    │ Reduction Gearbox    │ WARNING  │ Reduction Gearbox   │
│ 21  │ VIBRATION_ANOMALY        │ Mechanical Integrity │ WARNING  │ Mechanical Mounts   │
│ 22  │ EXHAUST_RESTRICTION      │ Exhaust & Gas Path   │ CRITICAL │ Exhaust Gas Path    │
│ 23  │ CYLINDER_EGT_IMBALANCE   │ Exhaust & Gas Path   │ WARNING  │ Exhaust Gas Path    │
│ 24  │ GENERATOR_FAILURE        │ Electrical System    │ WARNING  │ Electrical System   │
│ 25  │ ALTERNATOR_FAILURE       │ Electrical System    │ WARNING  │ Electrical System   │
└─────┴──────────────────────────┴──────────────────────┴──────────┴─────────────────────┘
```

### Detailed Failure Mode Catalog

#### 1. Turbocharger & TCU System
1. **`TURBO_OVERBOOST`** (Critical): Wastegate flapper valve jammed closed. Exhaust energy cannot bypass the turbine, driving MAP to 43.8 inHg (+0.48 bar over redline) with high IAT surge. *AI Detection: Turbo Induction Anomaly -> 0.97.*
2. **`TURBO_WASTEGATE_STUCK`** (Warning): Wastegate actuator seized in open bypass position. Boost collapses to atmospheric ambient pressure (~27.5 inHg MAP). Engine loses high-altitude climb capability. *AI Detection: Turbo Induction Anomaly -> 0.94.*
3. **`TCU_FAULT`** (Warning): Electronic Turbo Control Unit servo feedback loss. Causes boost fallback to mechanical safety stop and illuminates orange caution lamp. *AI Detection: Turbo Induction Anomaly -> 0.94.*
4. **`TURBO_DEGRADATION`** (Warning): Compressor aerodynamic fouling and turbine journal bearing drag. Limits turbo shaft speed to 58,000 RPM, inducing spool lag and ~20% power derating. *AI Detection: Turbo Induction Warning -> 0.58.*

#### 2. Fuel System & Twin Bing 64 Carburetors
5. **`FUEL_SYSTEM_LEAK`** (Critical): Fuel delivery line fracture or diaphragm regulator rupture. Fuel pressure drops to 1.78 bar (below required airbox+0.25 bar delta), accompanied by a 1.6x surge in indicated fuel burn. *AI Detection: Fuel Delivery Anomaly -> 0.96.*
6. **`FUEL_PUMP_1_FAILURE`** (Warning): Primary 12V DC vane pump electrical trip (0V, 0A). Triggers automatic check valve failover to redundant auxiliary pump 2. *AI Detection: Fuel Delivery Warning -> 0.64.*
7. **`FUEL_PUMP_2_FAILURE`** (Warning): Secondary standby electric fuel pump offline. Engine operates on pump 1 without redundant backup. *AI Detection: Fuel Delivery Warning -> 0.64.*
8. **`CARBURETOR_IMBALANCE`** (Warning): Twin Bing 64 throttle cable linkage skew. Balance drops to 71.4%, causing differential vacuum and CHT divergence between left (1/3) and right (2/4) cylinder banks. *AI Detection: Fuel & Carburetor Warning -> 0.64.*

#### 3. Dual Electronic Ignition (Ducati CDI)
9. **`CYLINDER_MISFIRE`** (Critical): Spark plug fouling or ignition coil breakdown on Cylinder 3. Cyl 3 EGT plunges by -135°C, Cyl 3 CHT drops by -42°C, and engine experiences rotational speed hunting and vibration spikes. *AI Detection: Ignition & Combustion Anomaly -> 0.90.*
10. **`IGNITION_A_FAILURE`** (Warning): Primary capacitor discharge ignition circuit A cutout. Engine operates on circuit B alone, exhibiting the classic single-CDI ~75 RPM drop. *AI Detection: Ignition System Warning -> 0.72.*
11. **`IGNITION_B_FAILURE`** (Warning): Secondary CDI circuit B cutout. Engine continues running on circuit A alone with single-CDI RPM droop. *AI Detection: Ignition System Warning -> 0.72.*

#### 4. Mixed Cooling Architecture
12. **`ENGINE_OVERHEATING`** (Critical): Thermodynamic core thermal runaway. Cylinder head temperatures surge past the 135°C redline, accompanied by coolant loop overheating beyond 115°C. *AI Detection: Thermodynamic Core Anomaly -> 0.96.*
13. **`COOLANT_TEMP_RISE`** (Critical): Expansion tank pressure relief or radiator fan failure. Cylinder head coolant exit temperature rapidly surges past 115°C. *AI Detection: Thermodynamic Core Anomaly -> 0.96.*
14. **`REDUCED_COOLANT_FLOW`** (Warning): Mechanical water pump cavitation or coolant hose constriction. Circulation drops below 18 L/min, causing rear cylinders (3 and 4) CHT to climb +38°C. *AI Detection: Thermodynamic Core Warning -> 0.68.*

#### 5. Dry-Sump Forced Lubrication
15. **`OIL_PRESSURE_LOSS`** (Critical): Pressure relief valve sticking open or scavenge pump failure. Oil pressure collapses to 1.1 bar (< 1.5 bar threshold), putting hydrodynamic crank bearings at immediate risk of metal-to-metal contact. *AI Detection: Lubrication Anomaly -> 0.95.*
16. **`HIGH_OIL_TEMP`** (Critical): Thermostatic bypass valve jammed or oil cooler matrix blocked. Oil gallery temperature exceeds 130°C redline, causing viscosity breakdown. *AI Detection: Lubrication Anomaly -> 0.95.*
17. **`OIL_SYSTEM_DEGRADATION`** (Warning): Oil aeration in dry-sump tank or ferrous particulate on magnetic drain plug. Causes oil pressure fluctuations of ±0.6 bar. *AI Detection: Lubrication Warning -> 0.62.*

#### 6. Propeller Reduction Gearbox (2.43:1) & Mechanical
18. **`GEARBOX_VIBRATION`** (Critical): Dog clutch overload flutter and torsional shock damper wear. Gearbox housing vibration spikes to > 6.0 mm/s RMS with casing temperature surging past 100°C. *AI Detection: Reduction Gearbox Anomaly -> 0.93.*
19. **`BEARING_DEGRADATION`** (Critical): Crankshaft journal hydrodynamic plain bearing wear. Triggers 1X harmonic mechanical vibration (> 6.5 mm/s RMS) and elevated oil temperature. *AI Detection: Mechanical Bearings Anomaly -> 0.93.*
20. **`GEARBOX_TEMP_INCREASE`** (Warning): Gearbox casing temperature exceeds 115°C due to gear tooth friction, oil degradation, or improper bevel gear lash. *AI Detection: Reduction Gearbox Warning -> 0.60.*
21. **`VIBRATION_ANOMALY`** (Warning): Rubber engine mount damper fatigue and harmonic resonance. Induces 1X–2X crankshaft vibration anomalies exceeding 5.5 mm/s RMS. *AI Detection: Mechanical Integrity Warning -> 0.60.*

#### 7. Exhaust System & Gas Path
22. **`EXHAUST_RESTRICTION`** (Critical): Pre-turbine collector constriction or muffler baffle collapse. Pre-turbine backpressure surges, driving average EGT past the 950°C redline and choking engine power by ~28%. *AI Detection: Exhaust Gas Path Anomaly -> 0.95.*
23. **`CYLINDER_EGT_IMBALANCE`** (Warning): Differential mixture skew between cylinder banks. Induces an EGT spread greater than 85°C between opposing cylinder banks. *AI Detection: Exhaust Gas Path Warning -> 0.65.*

#### 8. Electrical Generation & Avionics Bus
24 **`GENERATOR_FAILURE`** (Warning): Internal 250W AC generator stator cutout. AC stator output drops to 0W, forcing engine sensors and TCU to rely on DC bus buffer battery drain. *AI Detection: Electrical System Warning -> 0.65.*
25. **`ALTERNATOR_FAILURE`** (Warning): External engine-driven 40A / 28V DC alternator regulator trip. Main avionics bus voltage sags from 28.4V nominal down to battery buffer level (24.1V). *AI Detection: Electrical System Warning -> 0.65.*

---

## 🤖 AI / ML Diagnostics & RUL Pipeline

### Dual-Model AI Architecture

```
                                  LIVE TELEMETRY STREAM
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ┌─────────────────────────┐                   ┌─────────────────────────┐
        │  LSTM Autoencoder Core  │                   │ XGBoost Subsystem Heads │
        │  (Temporal Anomaly)     │                   │ (Fault Classification)  │
        └────────────┬────────────┘                   └────────────┬────────────┘
                     │                                             │
      Reconstruction Error Scoring                    Multi-Label Fault Probabilities
      & Prediction Horizon Projections                & Feature Importance Rankings
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            ▼
                              ┌───────────────────────────┐
                              │ Health Index & Degradation│
                              │ Estimation Engine         │
                              └─────────────┬─────────────┘
                                            ▼
                              ┌───────────────────────────┐
                              │ Component-Level Remaining │
                              │ Useful Life (RUL) Deck    │
                              └───────────────────────────┘
```

1. **Unsupervised Temporal Model — LSTM Autoencoder**:
   - Analyzes a 60-step sliding window of multivariate time-series data.
   - Evaluates multivariate deviations in dynamic correlations (e.g., Throttle vs. MAP vs. Fuel Flow vs. RPM).
   - Generates normalized **reconstruction error scores (0.000 to 1.000)** to flag subtle, emerging temporal anomalies before hard limits are crossed.
   - Computes kinematic and physical extrapolation horizons (**+10s**, **+30s**, **+60s**) with uncertainty bounds.

2. **Supervised Multi-Head Model — XGBoost Ensemble**:
   - Operates on instantaneous and rolling statistical feature vectors.
   - Classifies across the **8 physical subsystems** and isolates the active failure modes.
   - Generates real-time **feature importance rankings** to provide maintenance engineers with explainable root-cause diagnosis.

3. **Physics-Informed Remaining Useful Life (RUL) Prognosis**:
   - Models accelerated wear and component fatigue based on thermal stress (CHT > 135°C), boundary lubrication friction (Oil Pressure < 1.5 bar), and mechanical vibration (> 6.0 mm/s).
   - Component-level RUL curves for:
     - **Rotax 914F Core Powerplant** (Nominal: 2,000h TBO)
     - **Turbocharger & Wastegate Servo** (Nominal: 2,000h)
     - **Propeller Reduction Gearbox** (Nominal: 2,000h)
     - **Dry-Sump Lubrication Pump** (Nominal: 2,000h)
     - **Twin Bing 64 Carburetors** (Nominal: 1,000h)
     - **Dual Ducati CDI Ignition Units** (Nominal: 1,000h)
     - **Dual 12V Electric Fuel Pumps** (Nominal: 1,000h)
     - **28V Dual-Bus Alternator** (Nominal: 1,000h)
     - **Crankshaft Hydrodynamic Bearings** (Nominal: 2,000h)

---

## 🛠 Tech Stack

### Frontend & 3D Visualization
- **React 18.3** + **TypeScript 5.4**: Strict typed component architecture and state management.
- **Three.js** + **React Three Fiber (r165)**: WebGL 3D rendering pipeline for the engine and airframe twins.
- **@react-three/drei**: Camera controllers, orbit matrices, lighting environments, and coordinate gizmos.
- **Vite 5.2**: Build tooling with sub-second hot module replacement.
- **Tailwind CSS v3**: Precision aviation styling, dark/light aeronautical UI, glassmorphic cards, and custom micro-animations.
- **Lucide React**: Engineering symbology and iconography.

### Physics Engine & Simulation
- **Rotax 914 F Multi-Physics Engine**: Custom TypeScript simulation engine modeling four-stroke thermodynamic combustion, dry-sump hydraulics, dual CDI timing, and TCU automatic turbo boost loops at 20 Hz.
- **6-DOF Kinematic State Model**: Density altitude computation, ISA deviation, airframe aerodynamics, and 15-waypoint survey mission routing.

### AI / Machine Learning
- **Python ML Pipeline**: Deep learning model training and inference pipelines.
- **PyTorch / TensorFlow**: LSTM Autoencoder architectures for multivariate temporal anomaly detection.
- **XGBoost / Scikit-learn**: Gradient-boosted decision trees for fault mode classification and RUL regression.

---

## 📸 Dashboard & Telemetry Screenshots

<div align="center">

| Primary Mission Operations Dashboard | Subsystem Sensor Matrix |
|---|---|
| ![Primary Dashboard](frontend/screenshots/redesign/01_primary_dashboard.png) | ![Sensor Matrix](frontend/screenshots/redesign/02_sensor_matrix.png) |

| 15-Waypoint Mission Route | AI Anomaly & RUL Predictions |
|---|---|
| ![Mission Route](frontend/screenshots/redesign/03_mission_route.png) | ![AI Predictions](frontend/screenshots/redesign/04_ai_predictions.png) |

| 25-Fault Injection Testbench | Ground Station System Settings |
|---|---|
| ![Fault Testbench](frontend/screenshots/redesign/05_fault_bench.png) | ![System Settings](frontend/screenshots/redesign/06_system_settings.png) |

| Live Fault Injection Control Modal | Injected Fault Real-Time Alert State |
|---|---|
| ![Fault Modal](frontend/screenshots/redesign/07_fault_modal.png) | ![Fault Dashboard](frontend/screenshots/redesign/08_fault_injected_dashboard.png) |

</div>

---

## 📁 Project Structure

```
SIH-Real-Time-Digital-Twin-of-Aero-Piston-Engine/
├── frontend/                                # Primary Vite + React Application
│   ├── src/
│   │   ├── App.tsx                          # App root with view routing & alert toasts
│   │   ├── components/
│   │   │   ├── 3d/                          # Common Three.js scene lighting & arena
│   │   │   ├── dashboard/                   # Flight ops telemetry cards
│   │   │   │   ├── Header.tsx               # Master operations flight bar
│   │   │   │   ├── PropulsionCard.tsx       # Rotax 2.43:1 gearbox & VTOL motor views
│   │   │   │   ├── TelemetryCharts.tsx      # Real-time multi-variable SVG telemetry
│   │   │   │   ├── RemainingUsefulLifeCard.tsx # Component RUL & degradation deck
│   │   │   │   ├── AIPredictionCard.tsx     # LSTM horizons & XGBoost classifications
│   │   │   │   ├── FaultInjectionModal.tsx  # 25-fault interactive injection modal
│   │   │   │   ├── FlightPathMap.tsx        # 15-waypoint GPS survey map
│   │   │   │   ├── AlertEventLog.tsx        # System event timeline & fault log
│   │   │   │   ├── SimulationControls.tsx   # Sim speed & mission playback controls
│   │   │   │   └── ...                      # Battery, Environment, Mission widgets
│   │   │   ├── digital-twin/                # 3D Digital Twin Viewports
│   │   │   │   ├── DigitalTwinView.tsx      # Dual twin viewport controller
│   │   │   │   ├── RotaxEngineModel3D.tsx   # Full 3D Rotax 914F Engine Model
│   │   │   │   ├── DroneModel3D.tsx         # MALE-UAV Airframe Twin Model
│   │   │   │   └── CoordinateGizmo.tsx      # Orientation triad
│   │   │   ├── pages/                       # Full-page application views
│   │   │   │   ├── BentoShowcaseView.tsx    # High-density engineering bento grid
│   │   │   │   ├── MainDashboard.tsx        # Operations mission control
│   │   │   │   ├── DetailedTelemetry.tsx    # 8-subsystem deep telemetry analysis
│   │   │   │   ├── AIAnalysis.tsx           # Machine learning diagnostic report
│   │   │   │   ├── FaultTestbench.tsx       # 25-fault testbench & validation catalog
│   │   │   │   ├── MissionPlanner.tsx       # Flight route & waypoint management
│   │   │   │   └── SystemSettings.tsx       # GCS configuration & telemetry rates
│   │   │   └── ui/                          # Navigation rail, HUD, buttons, badges
│   │   ├── context/
│   │   │   └── TelemetryContext.tsx         # React context binding 20Hz telemetry
│   │   ├── services/
│   │   │   ├── simulationEngine.ts          # Rotax 914F multi-physics & fault engine
│   │   │   ├── aiPredictor.ts               # LSTM & XGBoost inference logic
│   │   │   └── config.ts                    # Thresholds & configuration constants
│   │   └── types/
│   │       ├── engine.ts                    # Rotax 914F comprehensive data model
│   │       ├── simulation.ts                # Fault types & event logs
│   │       ├── telemetry.ts                 # Drone & sensor data definitions
│   │       └── prediction.ts                # AI predictions & RUL structures
│   ├── public/assets/                       # 3D textures, specimens & media
│   └── screenshots/                         # System validation screenshots
│
├── src/                                     # Machine Learning Pipeline
│   ├── data/                                # Data ingestion & transforms
│   ├── models/                              # LSTM Autoencoder & XGBoost models
│   ├── training/                            # Training & validation scripts
│   └── evaluation/                          # Model scoring & metrics
│
├── docs/                                    # Architectural & Project Documentation
│   ├── ARCHITECTURE.md                      # System architecture specification
│   ├── PROJECT_SPECIFICATION.md             # Complete project specification
│   └── EVALUATION_STANDARDS.md              # Model validation standards
│
├── start.bat                                # Windows One-Click Launcher
├── start.sh                                 # Linux/macOS One-Click Launcher
└── README.md                                # This documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x ([Download Node.js](https://nodejs.org/))
- **npm** ≥ 9.x (Included with Node.js)
- **Git** ([Download Git](https://git-scm.com/))
- **Python** ≥ 3.10 *(Optional, for standalone ML training pipelines)*

### Quick Start (One-Click Launch)

**1. Clone the repository**
```bash
git clone https://github.com/manas2k06/SIH-Real-Time-Digital-Twin-of-Aero-Piston-Engine.git
cd SIH-Real-Time-Digital-Twin-of-Aero-Piston-Engine
```

**2. Launch using one-click script**

*Windows:*
```cmd
start.bat
```

*Linux / macOS:*
```bash
chmod +x start.sh
./start.sh
```

The launcher will verify prerequisites, install dependencies if needed, launch the development server, and automatically open your default browser at **http://localhost:3000/**.

**3. Manual launch (Alternative)**
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Team & Acknowledgements

Developed for the **Smart India Hackathon 2026** under Problem Statement **SIH26054**:
*Software-based AI-enabled real-time Digital Twin for Aero-Piston Engine (Rotax 914 F) powering a MALE-UAV.*

- **Problem Statement ID**: SIH26054
- **Engine Baseline**: BRP-Rotax 914 F (Type Certificate EASA.E.122)
- **Aircraft Role**: Medium-Altitude Long-Endurance (MALE) Unmanned Aerial Vehicle

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ✈️ for Smart India Hackathon 2026**

*AeroTwin AI — Precision Digital Twin Engineering for Aerospace Propulsion*

</div>

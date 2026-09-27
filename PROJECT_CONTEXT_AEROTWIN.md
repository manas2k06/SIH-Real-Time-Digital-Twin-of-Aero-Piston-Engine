# PROJECT CONTEXT — AEROTWIN AI (SIH26054)

## Project Name
**AI Real-Time Digital Twin for MALE-UAV Aero-Piston Engine**

Project concept / name used in the SIH context:
**AEROTWIN AI**

Problem Statement: **SIH26054**

The project is a software-based AI-enabled real-time Digital Twin system intended for monitoring, simulation, anomaly/fault prediction, degradation analysis, Remaining Useful Life (RUL) estimation, mission simulation/replay, and environmental scenario analysis for an aero-piston engine used in a MALE-UAV (Medium-Altitude Long-Endurance Unmanned Aerial Vehicle).

The system is intended as a software/simulation prototype rather than a physical drone-control system.

---

## 1. CORE CONCEPT

The central concept is a **Real-Time Digital Twin** of the UAV's aero-piston engine.

A Digital Twin is a continuously updated virtual representation of a physical system.
In this project, the virtual engine receives telemetry representing the operating condition of the physical/simulated engine.

The system concept is:
```
Engine / Simulation 
  → Telemetry 
  → Digital Twin 
  → Historical State 
  → AI Analysis 
  → Anomaly / Fault Detection 
  → Degradation Analysis 
  → RUL Prediction 
  → Mission / Maintenance Insight
```

The Digital Twin is not merely a static 3D model. Its state corresponds to changing telemetry and operating conditions.
The AI layer is an analytical component of the Digital Twin rather than the entire identity of the project.

---

## 2. PRIMARY OBJECTIVES

The project covers the following major capabilities:

- **Real-Time Engine-State Monitoring**: Monitor the operating condition of the aero-piston engine through telemetry.
- **Anomaly Detection**: Identify unusual temporal behavior in engine parameters.
- **Fault Prediction / Classification**: Identify or classify potential engine faults based on telemetry and operating conditions.
- **Degradation Monitoring**: Track changes in engine/component condition over time.
- **Remaining Useful Life (RUL)**: Estimate how much operational life remains before a component is expected to require maintenance or replacement.
- **Mission Simulation**: Represent engine behavior during simulated UAV missions.
- **Mission Replay**: Allow historical engine/mission telemetry to be represented as a replayable sequence.
- **Environmental Simulation**: Represent engine behavior under changing environmental conditions.
- **Digital Twin Visualization**: Represent the current state of the engine/UAV system through a real-time digital representation.
- **Dashboard / HMI**: Provide a human-readable engineering interface for monitoring telemetry, system state, predictions, alerts, mission information, and Digital Twin state.

---

## 3. DIGITAL TWIN SCOPE

The Digital Twin has two related levels of representation:

### Primary Digital Twin
The technical core is the **aero-piston engine**.
The engine's virtual state is represented using:
- RPM
- Cylinder Head Temperature (CHT)
- Exhaust Gas Temperature (EGT)
- Oil pressure
- Oil temperature
- Fuel flow
- Vibration
- Battery/alternator state
- Injection timing
- Throttle/load
- Environmental conditions
- Derived engine-state variables

### UAV / Mission Context
The engine exists as part of a MALE-UAV. The wider system contains contextual information such as:
- Mission & flight phase
- Altitude & airspeed / ground speed
- Environmental conditions
- Engine load & operating history
- Mission timeline

The UAV-level context explains *why* engine telemetry changes. The engine remains the primary technical focus.

---

## 4. ENGINE TELEMETRY PARAMETERS

1. **RPM**: Engine rotational speed (RPM).
2. **Cylinder Head Temperature (CHT)**: Unit: °C. Detects overheating, abnormal combustion, thermal stress.
3. **Exhaust Gas Temperature (EGT)**: Unit: °C. Identifies abnormal combustion, mixture changes, thermal abnormalities.
4. **Oil Pressure**: Unit: bar or PSI. Lubrication-system pressure.
5. **Oil Temperature**: Unit: °C. Lubrication-system thermal state, overheating, degradation.
6. **Fuel Flow**: Unit: L/h or kg/h. Rate of fuel consumption, load analysis, fuel-leak / abnormal fuel behavior.
7. **Vibration**: Amplitude, RMS, frequency spectrum, or X/Y/Z directional vibration. Mechanical abnormality detection.
8. **Battery / Electrical System**: Voltage, current, temperature, state of charge, alternator output, electrical load.
9. **Injection Timing**: Fuel injection timing parameter.

---

## 5. ADDITIONAL ENGINE & OPERATING PARAMETERS
- Throttle position, Engine load, Torque, Power output
- Fuel consumption rate, Operating hours, Cycle count
- Trends for temperature, pressure, vibration
- Flight phase, Altitude, Ambient temperature, Ambient pressure, Humidity, Wind conditions

---

## 6. ENVIRONMENTAL PARAMETERS
- Ambient temperature, Atmospheric pressure, Altitude, Humidity, Wind speed & direction, Air density
- These directly affect combustion, cooling, fuel flow, load, and performance.

---

## 7. ENGINE SIMULATION DYNAMICS
```
Throttle / Load 
  → Fuel input 
  → Combustion 
  → Engine torque / RPM 
  → Temperature (CHT/EGT) 
  → Oil behavior (P/T) 
  → Vibration 
  → Electrical / auxiliary behavior
```
The simulation generates physically consistent telemetry rather than independent random numbers.

---

## 8. SIMULATION SCENARIOS
- **High Altitude**: Reduced atmospheric pressure / air-density.
- **Hot Weather**: Elevated ambient temperature, thermal cooling stress.
- **Endurance Operation**: Prolonged running for degradation & RUL analysis.
- **Rapid Throttle Changes**: Transient response testing.
- **Normal Operation**: Baseline healthy envelope.
- **Fault Injection**: Controlled abnormal states for AI benchmarking.

---

## 9. FAULT / FAILURE SCENARIOS
- **Engine Overheating**: Abnormal CHT / EGT / Oil Temp rise.
- **Oil Pressure Abnormality**: Low lubrication pressure or pump failure.
- **Excessive Vibration**: Unbalance, mechanical wear, bearing fault.
- **RPM Abnormality**: Hunting, drop under load, surge.
- **Fuel-System Abnormality**: Injector clogging, abnormal flow, leak.
- **Injection Timing Abnormality**: Advance/retard deviation.
- **Electrical / Alternator Fault**: Low voltage, over-current, alternator failure.
- **Sensor Fault / Noise**: Drift, noise, stuck value, drop-out.

---

## 10. AI / MACHINE-LEARNING ARCHITECTURE

### Model 1: LSTM / LSTM Autoencoder
- **Domain**: Time-series sequence modeling.
- **Mechanism**:
  ```
  Historical telemetry sequence 
    → LSTM encoder 
    → Latent temporal representation 
    → LSTM decoder 
    → Reconstructed sequence 
    → Reconstruction error 
    → Anomaly score
  ```
- **Purpose**: Detect anomalous temporal behaviors, non-linear correlations, and temporal pattern deviations.

### Model 2: XGBoost
- **Domain**: Structured/tabular telemetry & engineered features.
- **Inputs**: Aggregated telemetry, rolling statistics, delta features, environmental parameters, cycle counts.
- **Purpose**: Supervised fault classification, degradation tracking, and RUL estimation (when paired with labeled degradation targets).

---

## 11. REMAINING USEFUL LIFE (RUL) & PREDICTIVE MAINTENANCE

- **Definition**: Estimated remaining operational life before maintenance or replacement is required.
- **Distinction**:
  - *Remaining Flight Time* = hours/minutes the UAV can stay airborne on remaining fuel/battery right now.
  - *RUL* = operational life of the engine / components (in operating hours, cycles, or % remaining).
- **Predictive Maintenance Pipeline**:
  ```
  Telemetry 
    → Health monitoring 
    → Anomaly detection (LSTM Autoencoder) 
    → Degradation assessment 
    → RUL estimation (XGBoost) 
    → Maintenance advisory
  ```

---

## 12. DIGITAL TWIN SYNCHRONIZATION & HMI

- **Real-Time Sync**: Telemetry stream changes virtual state, 3D twin, instrumentation, AI predictions, and alert logs in real time.
- **Target vs Actual**: Visual comparison (e.g. Target RPM vs Actual RPM, Commanded Fuel vs Actual Flow).
- **Mission Replay**: Timeline scrubber to replay past missions, anomalies, and degradation events.
- **UI Character**: High-density, professional engineering/telemetry workstation interface:
  - **NO**: Purple neon gradients, pill buttons, fake AI reviews/testimonials, GIS/crop NDVI overlays, YOLO tree detection, AI marketing copy, decorative brain graphics.
  - **YES**: Crisp engineering data, high legibility, structural telemetry hierarchy, physical units, calibrated dials/charts, explicit uncertainty/limits, clean industrial aesthetic.

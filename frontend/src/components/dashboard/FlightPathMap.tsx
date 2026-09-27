import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const FlightPathMap: React.FC = () => {
  const { telemetry, predictions } = useTelemetry();
  const [showPredicted, setShowPredicted] = useState<boolean>(true);

  if (!telemetry) return null;

  const { mission, simCoordinates, attitude } = telemetry;
  const waypoints = mission.waypoints;

  // Map bounds in local Cartesian meters
  const mapMinX = -250;
  const mapMaxX = 780;
  const mapMinY = -380;
  const mapMaxY = 300;

  const mapWidth = mapMaxX - mapMinX;
  const mapHeight = mapMaxY - mapMinY;

  const svgWidth = 540;
  const svgHeight = 280;

  const toSvgX = (x: number) => ((x - mapMinX) / mapWidth) * svgWidth;
  const toSvgY = (y: number) => svgHeight - ((y - mapMinY) / mapHeight) * svgHeight;

  // Planned Route
  const plannedPathD = waypoints
    .map((wp, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(wp.x)} ${toSvgY(wp.y)}`)
    .join(' ');

  // Recorded Breadcrumb Track
  const historyPathD = telemetry.flightPathHistory
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(pt.y)}`)
    .join(' ');

  // AI Predicted Trajectory (LSTM Polyline)
  const predictedPathD =
    predictions?.lstm.trajectoryPolyline && predictions.lstm.trajectoryPolyline.length > 0
      ? `M ${toSvgX(simCoordinates.x)} ${toSvgY(simCoordinates.y)} ` +
        predictions.lstm.trajectoryPolyline
          .map((pt) => `L ${toSvgX(pt.x)} ${toSvgY(pt.y)}`)
          .join(' ')
      : '';

  const currentSvgX = toSvgX(simCoordinates.x);
  const currentSvgY = toSvgY(simCoordinates.y);

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Tactical Situation Radar (2D TSR)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-[#786c5f]">Range: 1.0 km</span>
          <span className="text-[#d5ccbe]">|</span>
          <button
            onClick={() => setShowPredicted(!showPredicted)}
            className={`px-2 py-0.5 rounded-full border text-[9px] font-bold transition-colors ${
              showPredicted ? 'bg-white text-[#d8533c] border-[#d8d0c2] shadow-xs' : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
            }`}
          >
            AI Trajectory: {showPredicted ? 'Active' : 'Off'}
          </button>
        </div>
      </div>

      {/* SVG Tactical Radar Display */}
      <div className="relative w-full h-[220px] bg-[#efeae2] border border-[#ded5c7] rounded-xl mt-3 overflow-hidden shadow-inner">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Concentric Range Rings */}
          {[250, 500, 750].map((radiusM) => {
            const rPx = (radiusM / mapWidth) * svgWidth;
            return (
              <g key={radiusM} opacity="0.6">
                <circle
                  cx={toSvgX(0)}
                  cy={toSvgY(0)}
                  r={rPx}
                  fill="none"
                  stroke="#d5ccbe"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={toSvgX(0) + rPx + 4}
                  y={toSvgY(0) + 3}
                  fill="#8c8074"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {radiusM}M
                </text>
              </g>
            );
          })}

          {/* Coordinate Crosshairs at Origin (0,0) */}
          <line
            x1={toSvgX(0)}
            y1={0}
            x2={toSvgX(0)}
            y2={svgHeight}
            stroke="#ded5c7"
            strokeWidth="1"
          />
          <line
            x1={0}
            y1={toSvgY(0)}
            x2={svgWidth}
            y2={toSvgY(0)}
            stroke="#ded5c7"
            strokeWidth="1"
          />

          {/* Survey Operational Perimeter Boundary */}
          <polygon
            points={`${toSvgX(-120)},${toSvgY(240)} ${toSvgX(700)},${toSvgY(240)} ${toSvgX(700)},${toSvgY(-320)} ${toSvgX(-120)},${toSvgY(-320)}`}
            fill="none"
            stroke="#b8aca0"
            strokeWidth="1"
            strokeDasharray="6 4"
          />

          {/* Planned Mission Route Track */}
          <path
            d={plannedPathD}
            fill="none"
            stroke="#b8aca0"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Recorded Historical Telemetry Breadcrumb Vector */}
          {historyPathD && (
            <path
              d={historyPathD}
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* AI Predicted Future Trajectory Line */}
          {showPredicted && predictedPathD && (
            <path
              d={predictedPathD}
              fill="none"
              stroke="#d8533c"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {/* Waypoints */}
          {waypoints.map((wp) => {
            const wx = toSvgX(wp.x);
            const wy = toSvgY(wp.y);
            const isCurrent = wp.id === mission.currentWaypoint;
            const isReached = wp.reached;

            return (
              <g key={wp.id}>
                {/* Waypoint Diamond Marker */}
                <rect
                  x={wx - (isCurrent ? 4.5 : 3.5)}
                  y={wy - (isCurrent ? 4.5 : 3.5)}
                  width={isCurrent ? 9 : 7}
                  height={isCurrent ? 9 : 7}
                  transform={`rotate(45 ${wx} ${wy})`}
                  fill={isCurrent ? '#d8533c' : isReached ? '#2d6a4f' : '#ffffff'}
                  stroke={isCurrent ? '#ffffff' : '#8c8074'}
                  strokeWidth="1.2"
                />
                {/* Active Waypoint Acquisition Ring */}
                {isCurrent && (
                  <circle
                    cx={wx}
                    cy={wy}
                    r="9"
                    fill="none"
                    stroke="#d8533c"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Waypoint ID label */}
                <text
                  x={wx}
                  y={wy - 8}
                  fill={isCurrent ? '#d8533c' : '#786c5f'}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  WP{wp.id.toString().padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* Current Drone Location Icon & Heading Vector */}
          <g transform={`translate(${currentSvgX}, ${currentSvgY})`}>
            <g transform={`rotate(${attitude.yaw})`}>
              <line x1="0" y1="0" x2="0" y2="-22" stroke="#d8533c" strokeWidth="1.5" />
              <polygon
                points="0,-8 -5,6 0,2 5,6"
                fill="#d8533c"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          </g>
        </svg>

        {/* Tactical Legend Strip */}
        <div className="absolute bottom-2 left-2 bg-[#ffffff]/90 backdrop-blur-sm border border-[#ded5c7] rounded-lg px-2.5 py-1 text-[8px] font-mono text-[#5c544d] flex items-center space-x-3 shadow-xs">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-[2px] bg-[#2d6a4f] inline-block rounded" />
            <span className="font-semibold">RECORDED</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-[2px] bg-[#d8533c] border-b border-dashed inline-block" />
            <span className="font-semibold">AI PREDICTION (+60S)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-[#d8533c] inline-block rounded-xs" />
            <span className="font-semibold">ACTIVE TARGET</span>
          </div>
        </div>
      </div>
    </div>
  );
};

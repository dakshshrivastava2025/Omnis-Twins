import React, { useState } from "react";
import { HISTORICAL_TRENDS } from "../../data/vehicleData.js";
import { TOKENS } from "../../theme/tokens.js";

export function TrendChart({
  timeRange = "24H",
  onTimeRangeChange,
  metric = "health",
  title = "VEHICLE DEGRADATION TREND HISTORY",
  height = 170,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const data = HISTORICAL_TRENDS[timeRange] || HISTORICAL_TRENDS["24H"];
  const values = data.map((d) => d[metric] || d.health || 0);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const svgWidth = 600;
  const svgHeight = height;
  const padding = 24;

  const points = data.map((d, idx) => {
    const val = d[metric] || d.health || 0;
    const x = padding + (idx / (data.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((val - min) / range) * (svgHeight - padding * 2);
    return { x, y, time: d.time, value: val };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  const lineColor = metric === "health" ? "#969DA6" : metric === "vibration" ? "#C28A32" : "#C94A4A";

  return (
    <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 shadow-sm select-none font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#343A42]">
        <div>
          <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider">
            {title}
          </h3>
          <p className="text-[10px] text-[#69717B] font-mono">
            Instrumentation trend sampling
          </p>
        </div>

        {/* Time Range Selector */}
        {onTimeRangeChange && (
          <div className="flex items-center gap-1 bg-[#14171B] p-0.5 rounded border border-[#343A42] text-[10px]">
            {["1H", "6H", "24H", "7D", "30D"].map((rangeKey) => (
              <button
                key={rangeKey}
                onClick={() => onTimeRangeChange && onTimeRangeChange(rangeKey)}
                className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                  timeRange === rangeKey
                    ? "bg-[#2A3037] text-[#E2E5E8] border border-[#343A42]"
                    : "text-[#969DA6] hover:text-[#E2E5E8]"
                }`}
              >
                {rangeKey}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          {/* Subtle Grid Lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = padding + ratio * (svgHeight - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={svgWidth - padding}
                y2={y}
                stroke="#282E35"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={lineColor} fillOpacity="0.05" />

          {/* Signal Line */}
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.75" />

          {/* Data Sample Dots */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 5 : 3}
                fill={lineColor}
                stroke="#14171B"
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute rounded border border-[#343A42] bg-[#14171B] px-2 py-1 text-[11px] font-mono shadow-md pointer-events-none transition-all transform -translate-x-1/2 -translate-y-10 text-[#E2E5E8]"
            style={{
              left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / svgHeight) * 100}%`,
            }}
          >
            <p className="text-[#69717B] text-[9px]">{points[hoveredIdx].time}</p>
            <p style={{ color: lineColor }} className="font-bold">
              VAL: {points[hoveredIdx].value}
            </p>
          </div>
        )}
      </div>

      {/* Axis Timestamps */}
      <div className="flex justify-between px-1 pt-1.5 text-[10px] font-mono text-[#69717B] border-t border-[#282E35] mt-1">
        <span>{data[0]?.time}</span>
        <span>{data[Math.floor(data.length / 2)]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
    </div>
  );
}

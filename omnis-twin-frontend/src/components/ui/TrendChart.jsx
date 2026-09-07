import React, { useState } from "react";
import { HISTORICAL_TRENDS } from "../../data/vehicleData.js";

export function TrendChart({
  timeRange = "24H",
  onTimeRangeChange,
  metric = "health",
  title = "System Degradation Trend",
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

  const lineColor = metric === "health" ? "#C9547A" : metric === "vibration" ? "#E091A8" : "#EDAFC0";

  return (
    <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-4 select-none font-sans shadow-card-dark">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#222222]">
        <div>
          <h3 className="text-sm font-semibold text-[#F0F0F0] tracking-wide flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9547A]" />
            {title}
          </h3>
          <p className="text-[11px] text-[#555555] mt-0.5">
            Real-time degradation telemetry
          </p>
        </div>

        {onTimeRangeChange && (
          <div className="flex items-center gap-0.5 bg-[#111111] p-1 rounded-[8px] border border-[#2A2A2A] text-[10px]">
            {["1H", "6H", "24H", "7D", "30D"].map((rangeKey) => (
              <button
                key={rangeKey}
                onClick={() => onTimeRangeChange && onTimeRangeChange(rangeKey)}
                className={`rounded-[6px] px-2 py-0.5 font-semibold transition-all duration-200 ${
                  timeRange === rangeKey
                    ? "bg-[#C9547A] text-white"
                    : "text-[#B0B0B0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]"
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
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = padding + ratio * (svgHeight - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={svgWidth - padding}
                y2={y}
                stroke="#222222"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaD} fill={`url(#gradient-${metric})`} />
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 3.5}
                fill={hoveredIdx === i ? lineColor : "#111111"}
                stroke={lineColor}
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute rounded-[8px] border border-[#C9547A]/30 bg-[#111111] px-3 py-2 text-[11px] pointer-events-none transform -translate-x-1/2 -translate-y-14 text-[#F0F0F0] shadow-lg"
            style={{
              left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / svgHeight) * 100}%`,
            }}
          >
            <p className="text-[#555555] text-[9px]">{points[hoveredIdx].time}</p>
            <p style={{ color: lineColor }} className="font-bold font-mono">
              {points[hoveredIdx].value}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between px-2 pt-2.5 text-[10px] text-[#555555] border-t border-[#222222] mt-2">
        <span>{data[0]?.time}</span>
        <span>{data[Math.floor(data.length / 2)]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
    </div>
  );
}

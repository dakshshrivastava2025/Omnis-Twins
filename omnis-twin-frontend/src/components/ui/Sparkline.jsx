import React from "react";

export function Sparkline({ data = [50, 60, 55, 70, 65, 80], status = "healthy", color, height = 20, width = 50 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  let strokeColor = color;
  if (!strokeColor) {
    if (status === "critical") strokeColor = "#E5466B";
    else if (status === "warning" || status === "attention") strokeColor = "#D4915C";
    else if (status === "offline") strokeColor = "#3A3A3A";
    else strokeColor = "#5CB88A";
  }

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

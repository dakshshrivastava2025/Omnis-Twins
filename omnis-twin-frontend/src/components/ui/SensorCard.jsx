import React from "react";
import { StatusBadge } from "./StatusBadge.jsx";
import { Sparkline } from "./Sparkline.jsx";

export function SensorCard({ sensor, onSelectSensor }) {
  if (!sensor) return null;

  const isOnline = sensor.status === "online";

  return (
    <div
      className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] hover:border-[#C9547A] cursor-pointer p-4 transition-all duration-200 font-sans select-none card-hover"
      onClick={() => onSelectSensor && onSelectSensor(sensor)}
    >
      <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
        <span className="text-[10px] text-[#E091A8] font-semibold uppercase tracking-wider">
          {sensor.type}
        </span>
        <StatusBadge status={isOnline ? "healthy" : "offline"} size="sm" />
      </div>

      <div className="py-3 space-y-1.5">
        <h4 className="font-semibold text-[#F0F0F0] text-[13px] truncate">{sensor.name}</h4>
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xl font-bold text-[#F0F0F0] font-mono">{sensor.value}</span>
            <span className="ml-1.5 text-xs text-[#E091A8] font-medium">{sensor.unit}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[#555555] block uppercase tracking-wide">Nominal</span>
            <span className="text-[#5CB88A] text-xs font-mono font-medium">{sensor.healthyRange}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#222222] pt-2.5 mt-1 text-[10px] text-[#B0B0B0]">
        <div className="truncate max-w-[60%]">
          <span className="text-[#555555]">Target: </span>
          <span className="text-[#F0F0F0] font-medium">{sensor.componentName}</span>
        </div>
        <Sparkline data={sensor.trend} status={isOnline ? "healthy" : "offline"} height={20} width={50} />
      </div>
    </div>
  );
}

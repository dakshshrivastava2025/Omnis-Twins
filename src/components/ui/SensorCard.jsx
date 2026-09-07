import React from "react";
import { StatusBadge } from "./StatusBadge.jsx";
import { Sparkline } from "./Sparkline.jsx";

export function SensorCard({ sensor, onSelectSensor }) {
  if (!sensor) return null;

  const isOnline = sensor.status === "online";

  return (
    <div
      className="rounded border border-[#343A42] bg-[#1B1F24] hover:border-[#5C6470] cursor-pointer p-3 transition-colors text-xs font-mono"
      onClick={() => onSelectSensor && onSelectSensor(sensor)}
    >
      <div className="flex items-center justify-between border-b border-[#282E35] pb-2">
        <span className="text-[10px] text-[#69717B] font-bold uppercase tracking-wider">
          {sensor.type} SENSOR
        </span>
        <StatusBadge status={isOnline ? "healthy" : "offline"} size="sm" />
      </div>

      <div className="py-2 space-y-1">
        <h4 className="font-bold text-[#E2E5E8] text-xs font-sans truncate">{sensor.name}</h4>
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xl font-bold text-[#E2E5E8]">{sensor.value}</span>
            <span className="ml-1 text-xs text-[#969DA6]">{sensor.unit}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[#69717B] block uppercase font-sans">LIMIT</span>
            <span className="text-[#3A9B72] text-xs">{sensor.healthyRange}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#282E35] pt-2 mt-1 text-[10px] text-[#969DA6]">
        <div className="truncate max-w-[60%]">
          <span className="text-[#69717B]">TARGET: </span>
          <span className="text-[#E2E5E8] font-sans">{sensor.componentName}</span>
        </div>
        <Sparkline data={sensor.trend} status="healthy" height={18} width={45} />
      </div>
    </div>
  );
}

import React from "react";
import { Radio } from "lucide-react";
import { SensorCard } from "../ui/SensorCard.jsx";

export function SensorsView({ sensors, onSelectSensor }) {
  return (
    <div className="space-y-6 pb-8 font-sans text-[#F0F0F0] bg-canvas select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3 animate-fade-in-up">
        <div>
          <h2 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2">
            <Radio size={16} className="text-[#E091A8]" /><span>Sensor Telemetry Matrix</span>
          </h2>
          <p className="text-[12px] text-[#B0B0B0] mt-0.5">Continuous sampling across accelerometers, microphones, and thermal arrays</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#E091A8] font-semibold bg-[#E091A8]/10 border border-[#E091A8]/20 px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-[#E091A8] animate-pulse" />
          <span>{sensors.length} Active Channels</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map((sensor, i) => (
          <div key={sensor.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <SensorCard sensor={sensor} onSelectSensor={onSelectSensor} />
          </div>
        ))}
      </div>
    </div>
  );
}

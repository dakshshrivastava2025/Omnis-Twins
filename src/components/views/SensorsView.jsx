import React from "react";
import { Radio } from "lucide-react";
import { SensorCard } from "../ui/SensorCard.jsx";

export function SensorsView({ sensors, onSelectSensor }) {
  return (
    <div className="space-y-4 pb-6 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#343A42] pb-2">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
            <Radio size={15} className="text-[#3A9B72]" />
            <span>SENSOR TELEMETRY MATRIX</span>
          </h2>
          <p className="text-[11px] font-mono text-[#69717B]">
            Realtime sampling across tri-axial accelerometers, audio microphones, and infrared thermal arrays
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#3A9B72] font-bold bg-[#3A9B72]/15 border border-[#3A9B72]/30 px-2.5 py-1 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3A9B72] animate-pulse" />
          <span>{sensors.length} ACTIVE STREAM CHANNELS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} onSelectSensor={onSelectSensor} />
        ))}
      </div>
    </div>
  );
}

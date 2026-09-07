import React from "react";
import { Clock, Bell, Cpu, Activity } from "lucide-react";

export function Header({
  vehicle,
  timeRange,
  onTimeRangeChange,
  activeAlertsCount = 4,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#222222] px-5 z-10 select-none font-sans text-sm bg-[#141414] text-[#F0F0F0]">
      {/* Left: Vehicle Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#C9547A]" />
            <span className="font-semibold text-[#F0F0F0] tracking-wide text-sm">
              <span className="text-[#C9547A]">OMNIS</span> TWIN
            </span>
            <span className="text-[#B0B0B0] text-xs font-normal">/ {vehicle.name}</span>
          </div>

          <span className="text-[11px] text-[#B0B0B0] bg-[#111111] px-2.5 py-1 rounded-[8px] border border-[#2A2A2A] font-mono">
            VIN: <span className="text-[#F0F0F0] font-medium">{vehicle.vin}</span>
          </span>
          <span className="text-[11px] text-[#B0B0B0] bg-[#111111] px-2.5 py-1 rounded-[8px] border border-[#2A2A2A] font-mono hidden md:inline">
            ODO: <span className="text-[#F0F0F0] font-medium">{vehicle.odometer}</span>
          </span>
          <span className="text-[11px] text-[#B0B0B0] bg-[#111111] px-2.5 py-1 rounded-[8px] border border-[#2A2A2A] font-mono hidden lg:inline">
            FW: <span className="text-[#F0F0F0] font-medium">{vehicle.firmware}</span>
          </span>
        </div>

        {/* Live Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-[#E091A8]/10 text-[#E091A8] border border-[#E091A8]/20 text-[10px] font-medium">
          <span className="h-2 w-2 rounded-full bg-[#E091A8] animate-pulse" />
          <span className="tracking-wide font-semibold">TELEMETRY LIVE</span>
        </div>
      </div>

      {/* Right: Time Filter & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-[#111111] p-1 rounded-[8px] border border-[#2A2A2A] text-[11px]">
          <Clock size={12} className="text-[#555555] ml-1 mr-1" />
          {["1H", "6H", "24H", "7D", "30D"].map((tKey) => (
            <button
              key={tKey}
              onClick={() => onTimeRangeChange && onTimeRangeChange(tKey)}
              className={`rounded-[6px] px-2.5 py-1 font-sans font-medium transition-all duration-200 ${
                timeRange === tKey
                  ? "bg-[#C9547A] text-white font-semibold shadow-sm"
                  : "text-[#B0B0B0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]"
              }`}
            >
              {tKey}
            </button>
          ))}
        </div>

        {/* Health */}
        <div className="flex items-center gap-2 border-l border-[#2A2A2A] pl-3">
          <span className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold">Health</span>
          <span className="font-mono text-xs font-bold text-[#5CB88A] bg-[#111111] px-2.5 py-1 rounded-[8px] border border-[#5CB88A]/20 flex items-center gap-1.5">
            <Activity size={12} className="text-[#5CB88A]" />
            {vehicle.health}%
          </span>
        </div>

        {/* Alert Bell */}
        <div className="relative">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[#F0F0F0] bg-[#111111] hover:bg-[#1E1E1E] border border-[#2A2A2A] transition-colors duration-200 text-[11px] font-medium"
            title="Active Diagnostic Incidents"
          >
            <Bell size={13} className="text-[#B0B0B0]" />
            {activeAlertsCount > 0 && (
              <span className="text-[#E5466B] font-bold">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

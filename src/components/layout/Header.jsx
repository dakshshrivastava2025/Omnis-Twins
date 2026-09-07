import React from "react";
import { Clock, Bell, Radio } from "lucide-react";
import { TOKENS } from "../../theme/tokens.js";

export function Header({
  vehicle,
  timeRange,
  onTimeRangeChange,
  activeAlertsCount = 4,
}) {
  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between border-b px-4 z-10 select-none font-mono text-xs"
      style={{
        backgroundColor: TOKENS.colors.bgHeader,
        borderColor: TOKENS.colors.border,
      }}
    >
      {/* Vehicle Info Toolbar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#E2E5E8] tracking-wide text-xs">
            {vehicle.name}
          </span>
          <span className="text-[10px] text-[#969DA6] bg-[#14171B] px-2 py-0.5 rounded border border-[#343A42]">
            VIN: {vehicle.vin}
          </span>
          <span className="text-[10px] text-[#969DA6] hidden md:inline">
            ODO: <strong className="text-[#E2E5E8]">{vehicle.odometer}</strong>
          </span>
          <span className="text-[10px] text-[#969DA6] hidden lg:inline">
            FW: <strong className="text-[#E2E5E8]">{vehicle.firmware}</strong>
          </span>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#3A9B72]/15 text-[#3A9B72] border border-[#3A9B72]/30 text-[10px]">
          <Radio size={11} className="animate-pulse" />
          <span>REALTIME STREAM</span>
        </div>
      </div>

      {/* Controls & Time Range Filter */}
      <div className="flex items-center gap-3">
        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 bg-[#14171B] p-0.5 rounded border border-[#343A42] text-[10px]">
          <Clock size={11} className="text-[#69717B] ml-1" />
          {["1H", "6H", "24H", "7D", "30D"].map((tKey) => (
            <button
              key={tKey}
              onClick={() => onTimeRangeChange && onTimeRangeChange(tKey)}
              className={`rounded px-1.5 py-0.5 font-mono font-semibold transition-colors ${
                timeRange === tKey
                  ? "bg-[#2A3037] text-[#E2E5E8] border border-[#343A42]"
                  : "text-[#969DA6] hover:text-[#E2E5E8]"
              }`}
            >
              {tKey}
            </button>
          ))}
        </div>

        {/* System Health Gauge */}
        <div className="flex items-center gap-2 border-l border-[#343A42] pl-3">
          <span className="text-[10px] text-[#969DA6] uppercase font-sans">SYS HEALTH:</span>
          <span className="font-mono text-sm font-bold text-[#C28A32] bg-[#C28A32]/15 px-2 py-0.5 rounded border border-[#C28A32]/30">
            {vehicle.health}%
          </span>
        </div>

        {/* Alert Counter Icon */}
        <div className="relative">
          <button className="p-1 rounded text-[#8F969F] hover:text-[#E2E5E8] hover:bg-[#22272D] border border-[#343A42] transition-colors">
            <Bell size={14} />
          </button>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C94A4A] text-[9px] font-mono font-bold text-white">
              {activeAlertsCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

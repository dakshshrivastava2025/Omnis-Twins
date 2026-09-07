import React from "react";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge.jsx";
import { Sparkline } from "./Sparkline.jsx";

export function ComponentCard({ component, onSelectComponent, viewMode = "table" }) {
  if (!component) return null;

  const isCritical = component.status === "critical";
  const isWarning = component.status === "warning" || component.status === "attention";

  const telemetrySummary = component.sensorEvidence
    ? component.sensorEvidence.map((e) => e.value).join(" · ")
    : "Nominal telemetry";

  if (viewMode === "table") {
    return (
      <tr
        onClick={() => onSelectComponent && onSelectComponent(component)}
        className={`border-b border-[#222222] cursor-pointer font-sans text-[13px] transition-colors duration-200 ${
          isCritical
            ? "bg-[#E5466B]/8 hover:bg-[#E5466B]/15 text-[#F0F0F0]"
            : isWarning
            ? "bg-[#D4915C]/8 hover:bg-[#D4915C]/15 text-[#F0F0F0]"
            : "hover:bg-[#1E1E1E] text-[#B0B0B0]"
        }`}
      >
        <td className="px-4 py-3.5 font-semibold text-[#F0F0F0]">
          {component.name}
        </td>
        <td className="px-4 py-3.5 text-[#B0B0B0]">
          {component.category}
        </td>
        <td className="px-4 py-3.5">
          <StatusBadge status={component.status} size="sm" />
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold font-mono ${
                isCritical ? "text-[#E5466B]" : isWarning ? "text-[#D4915C]" : "text-[#5CB88A]"
              }`}
            >
              {component.health}%
            </span>
            <div className="w-16 h-1.5 rounded-full bg-[#111111] overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? "bg-[#E5466B]" : isWarning ? "bg-[#D4915C]" : "bg-[#5CB88A]"
                }`}
                style={{ width: `${component.health}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-[#B0B0B0] truncate max-w-xs font-mono text-xs">
          {telemetrySummary}
        </td>
        <td className="px-4 py-3.5 text-[#555555] text-[11px]">
          {component.lastUpdated}
        </td>
        <td className="px-4 py-3.5 text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent && onSelectComponent(component);
            }}
            className="px-3 py-1.5 rounded-[8px] bg-[#C9547A] hover:bg-[#B54A6C] text-white font-semibold text-[11px] transition-all duration-200 shadow-sm"
          >
            Inspect
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div
      onClick={() => onSelectComponent && onSelectComponent(component)}
      className={`rounded-[12px] border p-4 cursor-pointer font-sans transition-all duration-200 card-hover ${
        isCritical
          ? "bg-[#1A1A1A] border-[#E5466B]/30 hover:border-[#E5466B]"
          : isWarning
          ? "bg-[#1A1A1A] border-[#D4915C]/30 hover:border-[#D4915C]"
          : "bg-[#1A1A1A] border-[#222222] hover:border-[#C9547A]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#222222] pb-3">
        <div>
          <span className="text-[10px] uppercase text-[#555555] tracking-wider font-medium">{component.category}</span>
          <h4 className="font-semibold text-[#F0F0F0] text-sm mt-0.5">{component.name}</h4>
        </div>
        <StatusBadge status={component.status} size="sm" />
      </div>

      <div className="py-3 space-y-2 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-[#B0B0B0]">Health</span>
          <span className={`font-bold font-mono ${isCritical ? "text-[#E5466B]" : isWarning ? "text-[#D4915C]" : "text-[#5CB88A]"}`}>
            {component.health}%
          </span>
        </div>
        <p className="text-[#555555] truncate text-xs font-mono">{telemetrySummary}</p>
      </div>

      <div className="flex items-center justify-between border-t border-[#222222] pt-3 mt-1">
        <Sparkline data={component.trend} status={component.status} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent && onSelectComponent(component);
          }}
          className="text-[#C9547A] text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all duration-200"
        >
          <span>Inspect</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

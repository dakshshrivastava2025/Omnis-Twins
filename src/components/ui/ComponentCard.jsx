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
        className={`border-b border-[#343A42] cursor-pointer font-mono text-xs transition-colors ${
          isCritical
            ? "bg-[#C94A4A]/10 hover:bg-[#C94A4A]/20 text-[#E2E5E8]"
            : isWarning
            ? "bg-[#C28A32]/10 hover:bg-[#C28A32]/20 text-[#E2E5E8]"
            : "hover:bg-[#22272D] text-[#969DA6]"
        }`}
      >
        <td className="px-3 py-2.5 font-bold text-[#E2E5E8] font-sans">
          {component.name}
        </td>
        <td className="px-3 py-2.5 text-[#969DA6] font-sans">
          {component.category}
        </td>
        <td className="px-3 py-2.5">
          <StatusBadge status={component.status} size="sm" />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${
                isCritical ? "text-[#C94A4A]" : isWarning ? "text-[#C28A32]" : "text-[#3A9B72]"
              }`}
            >
              {component.health}%
            </span>
            <div className="w-16 h-1.5 rounded bg-[#2A3037] overflow-hidden hidden sm:block">
              <div
                className={`h-full ${
                  isCritical ? "bg-[#C94A4A]" : isWarning ? "bg-[#C28A32]" : "bg-[#3A9B72]"
                }`}
                style={{ width: `${component.health}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5 text-[#E2E5E8] truncate max-w-xs">
          {telemetrySummary}
        </td>
        <td className="px-3 py-2.5 text-[#69717B] text-[11px]">
          {component.lastUpdated}
        </td>
        <td className="px-3 py-2.5 text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent && onSelectComponent(component);
            }}
            className="px-2 py-0.5 rounded bg-[#282E35] hover:bg-[#343A42] text-[#E2E5E8] font-bold text-[10px] border border-[#343A42] transition-colors"
          >
            INSPECT
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div
      onClick={() => onSelectComponent && onSelectComponent(component)}
      className={`rounded border p-3 cursor-pointer text-xs transition-colors ${
        isCritical
          ? "bg-[#1B1F24] border-[#C94A4A]/50"
          : isWarning
          ? "bg-[#1B1F24] border-[#C28A32]/40"
          : "bg-[#1B1F24] border-[#343A42] hover:border-[#5C6470]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#343A42] pb-2">
        <div>
          <span className="text-[10px] uppercase text-[#69717B] font-mono">{component.category}</span>
          <h4 className="font-bold text-[#E2E5E8] font-sans">{component.name}</h4>
        </div>
        <StatusBadge status={component.status} size="sm" />
      </div>

      <div className="py-2 space-y-1 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[#969DA6]">Health Index</span>
          <span className={`font-bold ${isCritical ? "text-[#C94A4A]" : isWarning ? "text-[#C28A32]" : "text-[#3A9B72]"}`}>
            {component.health}%
          </span>
        </div>
        <p className="text-[#969DA6] truncate">{telemetrySummary}</p>
      </div>

      <div className="flex items-center justify-between border-t border-[#343A42] pt-2 mt-1">
        <Sparkline data={component.trend} status={component.status} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent && onSelectComponent(component);
          }}
          className="text-[#E2E5E8] font-mono text-[10px] font-bold flex items-center gap-1 hover:underline"
        >
          <span>INSPECT</span>
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

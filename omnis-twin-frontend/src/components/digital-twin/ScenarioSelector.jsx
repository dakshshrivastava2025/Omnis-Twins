import React from "react";
import { Activity } from "lucide-react";
import { DIAGNOSTIC_SCENARIOS } from "../../diagnostics/DiagnosticAdapter.js";

export function ScenarioSelector({ activeScenarioId, onSelectScenario }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <Activity size={13} className="text-[#FFA000]" />
      <span className="text-[#7A7A7A] uppercase font-mono">SCENARIO:</span>
      <select
        value={activeScenarioId}
        onChange={(e) => onSelectScenario(e.target.value)}
        className="rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] px-2.5 py-1 text-white font-mono font-medium outline-none focus:border-[#76B900] cursor-pointer"
      >
        {Object.values(DIAGNOSTIC_SCENARIOS).map((sc) => (
          <option key={sc.id} value={sc.id} className="bg-[#1A1A1A] text-white">
            {sc.name}
          </option>
        ))}
      </select>
    </div>
  );
}

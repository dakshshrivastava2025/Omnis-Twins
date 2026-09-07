import React from "react";
import { Activity } from "lucide-react";
import { DIAGNOSTIC_SCENARIOS } from "../../diagnostics/DiagnosticAdapter.js";

export function ScenarioSelector({ activeScenarioId, onSelectScenario }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <Activity size={13} className="text-[#C28A32]" />
      <span className="text-[#969DA6] uppercase font-sans">Preset:</span>
      <select
        value={activeScenarioId}
        onChange={(e) => onSelectScenario(e.target.value)}
        className="rounded bg-[#22272D] border border-[#343A42] px-2 py-0.5 text-[#E2E5E8] font-mono font-medium outline-none focus:border-[#5C6470]"
      >
        {Object.values(DIAGNOSTIC_SCENARIOS).map((sc) => (
          <option key={sc.id} value={sc.id}>
            {sc.name}
          </option>
        ))}
      </select>
    </div>
  );
}

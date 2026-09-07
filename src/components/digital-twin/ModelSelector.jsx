import React from "react";
import { Box } from "lucide-react";
import { MODEL_REGISTRY } from "../../twin/models/registry.js";

export function ModelSelector({ activeModelId, onSelectModel }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <Box size={13} className="text-[#8F969F]" />
      <span className="text-[#969DA6] uppercase font-sans">CAD Mesh:</span>
      <select
        value={activeModelId}
        onChange={(e) => onSelectModel(e.target.value)}
        className="rounded bg-[#22272D] border border-[#343A42] px-2 py-0.5 text-[#E2E5E8] font-mono font-medium outline-none focus:border-[#5C6470]"
      >
        {MODEL_REGISTRY.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

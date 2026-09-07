import React from "react";
import { Box } from "lucide-react";
import { MODEL_REGISTRY } from "../../twin/models/registry.js";

export function ModelSelector({ activeModelId, onSelectModel }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <Box size={13} className="text-[#00BFFF]" />
      <span className="text-[#7A7A7A] uppercase font-mono">CAD:</span>
      <select
        value={activeModelId}
        onChange={(e) => onSelectModel(e.target.value)}
        className="rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] px-2.5 py-1 text-white font-mono font-medium outline-none focus:border-[#76B900] cursor-pointer"
      >
        {MODEL_REGISTRY.map((model) => (
          <option key={model.id} value={model.id} className="bg-[#1A1A1A] text-white">
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

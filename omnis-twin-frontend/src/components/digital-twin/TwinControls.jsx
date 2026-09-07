import React from "react";
import { RotateCcw, ZoomIn, ZoomOut, EyeOff } from "lucide-react";

export function TwinControls({ onReset, onZoomIn, onZoomOut, isIsolated, onClearIsolate }) {
  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10 font-mono text-[10px]">
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-[6px] border border-[#3A3A3A] bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:border-[#76B900] text-white px-3 py-1.5 font-semibold transition-all shadow-md"
      >
        <RotateCcw size={13} className="text-[#76B900]" />
        <span>RESET VIEW</span>
      </button>

      {isIsolated && (
        <button
          onClick={onClearIsolate}
          className="flex items-center gap-1.5 rounded-[6px] border border-[#FFA000]/50 bg-[#1A1A1A] text-[#FFA000] px-3 py-1.5 font-semibold transition-all shadow-md hover:bg-[#FFA000]/10"
        >
          <EyeOff size={13} />
          <span>EXIT ISOLATE</span>
        </button>
      )}

      <button
        onClick={onZoomIn}
        className="rounded-[6px] border border-[#3A3A3A] bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:border-[#76B900] text-white p-1.5 transition-all shadow-md"
        title="Zoom In"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={onZoomOut}
        className="rounded-[6px] border border-[#3A3A3A] bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:border-[#76B900] text-white p-1.5 transition-all shadow-md"
        title="Zoom Out"
      >
        <ZoomOut size={14} />
      </button>
    </div>
  );
}

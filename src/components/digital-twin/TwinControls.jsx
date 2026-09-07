import React from "react";
import { RotateCcw, ZoomIn, ZoomOut, EyeOff } from "lucide-react";

export function TwinControls({ onReset, onZoomIn, onZoomOut, isIsolated, onClearIsolate }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10 font-mono text-[10px]">
      <button
        onClick={onReset}
        className="flex items-center gap-1 rounded border border-[#343A42] bg-[#1B1F24] hover:bg-[#22272D] text-[#E2E5E8] px-2.5 py-1.5 font-bold transition-colors shadow-md"
      >
        <RotateCcw size={12} />
        <span>RESET VIEW</span>
      </button>

      {isIsolated && (
        <button
          onClick={onClearIsolate}
          className="flex items-center gap-1 rounded border border-[#C28A32]/40 bg-[#C28A32]/15 text-[#C28A32] px-2.5 py-1.5 font-bold transition-colors shadow-md"
        >
          <EyeOff size={12} />
          <span>EXIT ISOLATE</span>
        </button>
      )}

      <button
        onClick={onZoomIn}
        className="rounded border border-[#343A42] bg-[#1B1F24] hover:bg-[#22272D] text-[#E2E5E8] p-1.5 transition-colors shadow-md"
        title="Zoom In"
      >
        <ZoomIn size={13} />
      </button>
      <button
        onClick={onZoomOut}
        className="rounded border border-[#343A42] bg-[#1B1F24] hover:bg-[#22272D] text-[#E2E5E8] p-1.5 transition-colors shadow-md"
        title="Zoom Out"
      >
        <ZoomOut size={13} />
      </button>
    </div>
  );
}

import React, { useState } from "react";
import { Cpu, Box, Activity } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";

export function ComponentsView({
  components,
  selectedComponentId,
  onSelectComponent,
  onNavigateToTwin,
}) {
  const [activeCompId, setActiveCompId] = useState(
    selectedComponentId || components[2]?.id || components[0]?.id
  );

  const selectedComp = components.find((c) => c.id === activeCompId) || components[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full pb-6 text-xs font-sans">
      {/* Navigation List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#343A42] pb-1.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E2E5E8]">
            MECHANICAL SUBSYSTEMS
          </h3>
          <span className="text-[10px] font-mono text-[#69717B]">{components.length} ITEMS</span>
        </div>

        <div className="space-y-1">
          {components.map((c) => {
            const isSelected = c.id === activeCompId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCompId(c.id);
                  onSelectComponent && onSelectComponent(c);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded text-left transition-colors font-mono ${
                  isSelected
                    ? "bg-[#2A3037] border border-[#343A42] text-[#E2E5E8] font-bold"
                    : "bg-[#1B1F24] border border-[#343A42] text-[#969DA6] hover:text-[#E2E5E8] hover:bg-[#22272D]"
                }`}
              >
                <div>
                  <p className="text-[9px] uppercase text-[#69717B] font-sans">{c.category}</p>
                  <p className="text-xs font-bold text-[#E2E5E8] font-sans">{c.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#E2E5E8]">{c.health}%</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Component Inspector */}
      {selectedComp && (
        <div className="lg:col-span-2 space-y-4">
          {/* Header Card */}
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#343A42] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#969DA6] font-bold">
                  {selectedComp.category} SUBSYSTEM
                </span>
                <h2 className="text-base font-bold text-[#E2E5E8] font-sans mt-0.5">{selectedComp.name}</h2>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={selectedComp.status} size="md" />
                <button
                  onClick={onNavigateToTwin}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#E2E5E8] hover:bg-[#FFFFFF] text-[#14171B] font-mono text-xs font-bold transition-colors"
                >
                  <Box size={13} />
                  <span>INSPECT IN 3D</span>
                </button>
              </div>
            </div>

            {/* Health & Wear Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#14171B] p-2.5 rounded border border-[#282E35]">
                <div className="flex justify-between text-[11px] mb-1 text-[#969DA6]">
                  <span>Health Index</span>
                  <span className="font-bold text-[#3A9B72]">{selectedComp.health}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#2A3037] rounded overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedComp.status === "critical"
                        ? "bg-[#C94A4A]"
                        : selectedComp.status === "warning"
                        ? "bg-[#C28A32]"
                        : "bg-[#3A9B72]"
                    }`}
                    style={{ width: `${selectedComp.health}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#14171B] p-2.5 rounded border border-[#282E35]">
                <div className="flex justify-between text-[11px] mb-1 text-[#969DA6]">
                  <span>Mechanical Wear Level</span>
                  <span className="font-bold text-[#C28A32]">{100 - selectedComp.health}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#2A3037] rounded overflow-hidden">
                  <div className="h-full bg-[#C28A32]" style={{ width: `${100 - selectedComp.health}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Evidence Matrix */}
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-4 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
              <Activity size={14} className="text-[#8F969F]" />
              <span>SUPPORTING TELEMETRY EVIDENCE</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              {selectedComp.sensorEvidence?.map((ev, i) => (
                <div key={i} className="rounded border border-[#282E35] bg-[#14171B] p-2.5 space-y-1">
                  <p className="text-[10px] text-[#969DA6] uppercase font-sans">{ev.type}</p>
                  <p className="text-sm font-bold text-[#E2E5E8]">{ev.value}</p>
                  <div>
                    <StatusBadge status={ev.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Action Recommendation */}
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-4 space-y-1 font-mono">
            <h4 className="text-[10px] uppercase font-bold text-[#969DA6] tracking-wider font-sans">
              DIAGNOSTIC RECOMMENDATION
            </h4>
            <p className="text-xs text-[#E2E5E8] font-sans leading-relaxed">
              {selectedComp.recommendedAction}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

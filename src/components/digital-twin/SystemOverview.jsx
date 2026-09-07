import React from "react";
import { COLOR, STATUS_META } from "../../twin/renderer/Materials.js";
import { StatusBadge } from "./StatusBadge.jsx";
import { calculateSystemHealth, getHealthStatus } from "../../twin/state/twinState.js";
import { VEHICLE_SYSTEMS, getComponentsBySystem } from "../../twin/config/vehicleConfig.js";

export function SystemOverview({ systemId, twinState, onSelectComponent }) {
  const system = VEHICLE_SYSTEMS.find((s) => s.id === systemId);
  if (!system) return null;

  const childComponents = getComponentsBySystem(systemId);
  const childIds = childComponents.map((c) => c.id);
  const health = calculateSystemHealth(twinState, childIds);
  const status = getHealthStatus(health);
  const meta = STATUS_META[status] || STATUS_META.healthy;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-5 py-4" style={{ borderColor: COLOR.border, backgroundColor: COLOR.panelRaised }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLOR.textSecondary }}>
          System Overview
        </p>
        <h2 className="mt-1 text-lg font-medium" style={{ color: COLOR.textPrimary }}>
          {system.name}
        </h2>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={status} />
          <span className="font-mono text-base font-bold" style={{ color: COLOR.textPrimary }}>
            {health}%
          </span>
        </div>
      </div>

      {/* Component Breakdown List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <p className="text-xs font-medium" style={{ color: COLOR.textSecondary }}>
          Subsystem Components ({childComponents.length})
        </p>
        <div className="space-y-2">
          {childComponents.map((c) => {
            const state = twinState[c.id];
            const compHealth = state ? state.health : 100;
            const compStatus = getHealthStatus(compHealth);
            const compMeta = STATUS_META[compStatus];

            return (
              <button
                key={c.id}
                onClick={() => onSelectComponent(c.id)}
                className="w-full text-left rounded-lg border p-3 transition-all hover:border-gray-500 active:scale-[0.98]"
                style={{
                  borderColor: COLOR.border,
                  backgroundColor: COLOR.panelRaised,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: COLOR.textPrimary }}>
                    {c.name}
                  </span>
                  <span className="font-mono text-xs font-semibold" style={{ color: compMeta.color }}>
                    {compHealth}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: COLOR.bg }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${compHealth}%`, backgroundColor: compMeta.color }}
                  />
                </div>
                {state?.fault && (
                  <p className="mt-1.5 text-xs text-amber-400 font-medium">
                    ⚠️ Fault: {state.fault.type.replace(/_/g, " ")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

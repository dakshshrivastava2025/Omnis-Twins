import React from "react";
import { X, Eye, Focus, EyeOff } from "lucide-react";
import { COLOR, STATUS_META } from "../../twin/renderer/Materials.js";
import { StatusBadge } from "./StatusBadge.jsx";
import { faultLabel } from "../../twin/state/twinState.js";

export function ComponentPanelContent({
  component,
  state,
  isIsolated,
  onClose,
  onFocusComponent,
  onToggleIsolate,
}) {
  const meta = STATUS_META[state.status] || STATUS_META.healthy;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: COLOR.textSecondary }}>
            {component.category}
          </p>
          <h2 className="mt-0.5 text-lg font-medium" style={{ color: COLOR.textPrimary }}>
            {component.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 transition-colors"
          style={{ color: COLOR.textSecondary }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLOR.panelRaised)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 px-5">
        <StatusBadge status={state.status} />
      </div>

      {/* Action Buttons: [ Focus ] [ Isolate ] */}
      <div className="mt-4 flex gap-2.5 px-5">
        <button
          onClick={onFocusComponent}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all active:scale-95"
          style={{
            borderColor: COLOR.border,
            backgroundColor: COLOR.panelRaised,
            color: COLOR.textPrimary,
          }}
        >
          <Focus size={14} />
          Focus Camera
        </button>
        <button
          onClick={onToggleIsolate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all active:scale-95"
          style={{
            borderColor: isIsolated ? COLOR.accentSelected : COLOR.border,
            backgroundColor: isIsolated ? COLOR.accentSelected + "22" : COLOR.panelRaised,
            color: isIsolated ? COLOR.accentSelected : COLOR.textPrimary,
          }}
        >
          {isIsolated ? <EyeOff size={14} /> : <Eye size={14} />}
          {isIsolated ? "Isolated" : "Isolate"}
        </button>
      </div>

      {/* Detailed Component Metrics */}
      <div className="mt-5 space-y-4 px-5 overflow-y-auto flex-1">
        {/* Health Metric */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs" style={{ color: COLOR.textSecondary }}>
              Health
            </span>
            <span className="font-mono text-sm font-bold" style={{ color: COLOR.textPrimary }}>
              {state.health}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: COLOR.panelRaised }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${state.health}%`, backgroundColor: meta.color }}
            />
          </div>
        </div>

        {/* Wear Metric */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs" style={{ color: COLOR.textSecondary }}>
              Mechanical Wear
            </span>
            <span className="font-mono text-sm" style={{ color: COLOR.textPrimary }}>
              {state.wear}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: COLOR.panelRaised }}>
            <div
              className="h-full rounded-full transition-all duration-500 bg-amber-500"
              style={{ width: `${state.wear}%` }}
            />
          </div>
        </div>

        {/* Fault Diagnosis Readout */}
        {state.fault ? (
          <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: COLOR.border, backgroundColor: COLOR.panelRaised }}>
            <p className="text-xs font-medium" style={{ color: COLOR.textSecondary }}>
              Detected Fault Condition
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: COLOR.textPrimary }}>
              {faultLabel(state.fault.type)}
            </p>
            <div className="mt-2 flex items-baseline justify-between border-t pt-2" style={{ borderColor: COLOR.border }}>
              <span className="text-xs" style={{ color: COLOR.textSecondary }}>
                Diagnostic Confidence
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: COLOR.accentSelected }}>
                {Math.round(state.fault.confidence * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: COLOR.border, backgroundColor: COLOR.panelRaised }}>
            <p className="text-sm" style={{ color: COLOR.textSecondary }}>
              No faults detected on this component.
            </p>
          </div>
        )}

        {/* Reserved for Phase 6 RUL */}
        {state.rul && (
          <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: COLOR.border, backgroundColor: COLOR.panelRaised }}>
            <p className="text-xs" style={{ color: COLOR.textSecondary }}>
              Remaining Useful Life (RUL)
            </p>
            <p className="mt-1 font-mono text-sm" style={{ color: COLOR.textPrimary }}>
              {state.rul.value} {state.rul.unit}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyPanelState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <p className="text-sm" style={{ color: COLOR.textSecondary }}>
        Select a component on the 3D vehicle or choose a system tab to inspect diagnostics.
      </p>
    </div>
  );
}

import React from "react";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { TOKENS } from "../../theme/tokens.js";
import { StatusBadge } from "./StatusBadge.jsx";

export function AlertCard({ alert, onSelectAlert, onActionClick }) {
  if (!alert) return null;

  const isCritical = alert.severity === "critical";
  const isHigh = alert.severity === "high";

  let statusType = "attention";
  if (isCritical) statusType = "critical";
  else if (isHigh) statusType = "warning";

  return (
    <div
      className={`rounded border transition-colors cursor-pointer text-xs font-sans ${
        isCritical
          ? "bg-[#1B1F24] border-[#C94A4A]/50 hover:border-[#C94A4A]"
          : "bg-[#1B1F24] border-[#343A42] hover:border-[#5C6470]"
      }`}
      onClick={() => onSelectAlert && onSelectAlert(alert)}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#343A42] bg-[#14171B]">
        <div className="flex items-center gap-2">
          <StatusBadge status={statusType} size="sm" />
          <span className="font-mono text-[11px] text-[#969DA6]">
            {alert.timestamp}
          </span>
        </div>
        {alert.confidence && (
          <span className="font-mono text-[11px] text-[#969DA6]">
            ML confidence: <strong className="text-[#E2E5E8] font-bold">{Math.round(alert.confidence * 100)}%</strong>
          </span>
        )}
      </div>

      {/* Main Alert Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-[#E2E5E8] flex items-center gap-1.5">
            {isCritical ? (
              <AlertCircle size={15} className="text-[#C94A4A] shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-[#C28A32] shrink-0" />
            )}
            <span>{alert.title}</span>
          </h4>
          <span className="font-mono text-[10px] text-[#69717B] shrink-0">
            ID: {alert.id}
          </span>
        </div>

        <p className="text-xs text-[#969DA6] leading-relaxed font-sans">
          {alert.description}
        </p>

        {/* Scannable Sensor Evidence */}
        {alert.evidence && alert.evidence.length > 0 && (
          <div className="mt-2 rounded border border-[#343A42] bg-[#14171B] p-2.5 font-mono text-[11px]">
            <p className="text-[10px] uppercase tracking-wider text-[#69717B] font-bold mb-1.5 font-sans">
              TELEMETRY EVIDENCE LOG:
            </p>
            <div className="space-y-1 text-[#E2E5E8]">
              {alert.evidence.map((ev, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#22272D] pb-0.5 last:border-0 last:pb-0">
                  <span className="text-[#969DA6]">{ev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#282E35] pt-2.5 mt-2 text-xs">
          <span className="text-[#969DA6] font-mono text-[11px]">
            Target: <strong className="text-[#E2E5E8] font-sans">{alert.componentName}</strong>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick && onActionClick(alert);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#E2E5E8] hover:bg-[#FFFFFF] text-[#14171B] font-mono text-[11px] font-bold transition-colors"
          >
            <span>{alert.actionText || "INSPECT DIAGNOSTICS"}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

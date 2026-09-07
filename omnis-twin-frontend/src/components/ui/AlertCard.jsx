import React from "react";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
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
      className={`rounded-[12px] border transition-all duration-200 cursor-pointer font-sans select-none card-hover overflow-hidden ${
        isCritical
          ? "bg-[#1A1A1A] border-[#E5466B]/30 hover:border-[#E5466B]"
          : "bg-[#1A1A1A] border-[#222222] hover:border-[#C9547A]"
      }`}
      onClick={() => onSelectAlert && onSelectAlert(alert)}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#222222] bg-[#151515]">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={statusType} size="sm" />
          <span className="text-[11px] text-[#555555]">
            {alert.timestamp}
          </span>
        </div>
        {alert.confidence && (
          <span className="text-[11px] text-[#B0B0B0]">
            Confidence: <strong className="text-[#F0F0F0] font-mono font-bold">{Math.round(alert.confidence * 100)}%</strong>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-semibold text-[#F0F0F0] flex items-center gap-2">
            {isCritical ? (
              <AlertCircle size={16} className="text-[#E5466B] shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-[#D4915C] shrink-0" />
            )}
            <span>{alert.title}</span>
          </h4>
          <span className="text-[10px] text-[#555555] shrink-0 font-mono">
            {alert.id}
          </span>
        </div>

        <p className="text-[13px] text-[#B0B0B0] leading-relaxed">
          {alert.description}
        </p>

        {/* Evidence */}
        {alert.evidence && alert.evidence.length > 0 && (
          <div className="rounded-[8px] border border-[#222222] bg-[#111111] p-3 font-mono text-[11px]">
            <p className="text-[10px] uppercase tracking-wider text-[#E091A8] font-semibold mb-2">
              Evidence Log
            </p>
            <div className="space-y-1.5 text-[#F0F0F0]">
              {alert.evidence.map((ev, i) => (
                <div key={i} className="flex items-center border-b border-[#1A1A1A] pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[#B0B0B0]">
                    <span className="text-[#C9547A] mr-1.5">•</span>
                    {ev}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#222222] pt-3">
          <span className="text-[#555555] text-[12px]">
            Target: <strong className="text-[#F0F0F0]">{alert.componentName}</strong>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick && onActionClick(alert);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#C9547A] hover:bg-[#B54A6C] text-white text-[12px] font-semibold transition-all duration-200 shadow-sm"
          >
            <span>{alert.actionText || "Inspect"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

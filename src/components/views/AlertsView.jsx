import React, { useState } from "react";
import { Filter, AlertTriangle } from "lucide-react";
import { AlertCard } from "../ui/AlertCard.jsx";

export function AlertsView({ alerts, onSelectAlert, onSelectComponent }) {
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === "all" || a.severity === filterSeverity
  );

  return (
    <div className="space-y-4 pb-6 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#343A42] pb-2">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-[#C94A4A]" />
            <span>INCIDENT LOG & DIAGNOSTIC ALERTS</span>
          </h2>
          <p className="text-[11px] font-mono text-[#69717B]">
            Realtime anomaly detections, severity hierarchy, and sensor evidence logs
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#14171B] p-0.5 rounded border border-[#343A42] font-mono text-[10px]">
          <Filter size={11} className="text-[#69717B] ml-1.5" />
          {["all", "critical", "high", "medium", "low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded px-2 py-0.5 uppercase font-bold transition-colors ${
                filterSeverity === sev
                  ? "bg-[#2A3037] text-[#E2E5E8] border border-[#343A42]"
                  : "text-[#969DA6] hover:text-[#E2E5E8]"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded border border-[#343A42] p-8 text-center bg-[#1B1F24] font-mono text-xs text-[#69717B]">
            NO ALERTS MATCHING FILTER CRITERIA
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onSelectAlert={onSelectAlert}
              onActionClick={() => onSelectComponent && onSelectComponent(alert.componentId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

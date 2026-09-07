import React, { useState } from "react";
import { Filter, AlertTriangle } from "lucide-react";
import { AlertCard } from "../ui/AlertCard.jsx";

export function AlertsView({ alerts, onSelectAlert, onSelectComponent }) {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const filteredAlerts = alerts.filter((a) => filterSeverity === "all" || a.severity === filterSeverity);

  return (
    <div className="space-y-6 pb-8 font-sans text-[#F0F0F0] bg-canvas select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3 animate-fade-in-up">
        <div>
          <h2 className="text-sm font-semibold text-[#E5466B] flex items-center gap-2">
            <AlertTriangle size={16} /><span>Incident Log & Diagnostic Alerts</span>
          </h2>
          <p className="text-[12px] text-[#B0B0B0] mt-0.5">Real-time anomaly detections with severity hierarchy</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#111111] p-1 rounded-[8px] border border-[#2A2A2A] text-[10px]">
          <Filter size={12} className="text-[#555555] ml-1 mr-1" />
          {["all", "critical", "high", "medium", "low"].map((sev) => (
            <button key={sev} onClick={() => setFilterSeverity(sev)}
              className={`rounded-[6px] px-2.5 py-1 uppercase font-semibold transition-all duration-200 ${
                filterSeverity === sev ? "bg-[#C9547A] text-white" : "text-[#B0B0B0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]"
              }`}>{sev}</button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-[12px] border border-[#222222] p-10 text-center bg-[#1A1A1A] text-[#555555] text-[13px]">No alerts matching filter</div>
        ) : filteredAlerts.map((alert, i) => (
          <div key={alert.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <AlertCard alert={alert} onSelectAlert={onSelectAlert} onActionClick={() => onSelectComponent && onSelectComponent(alert.componentId)} />
          </div>
        ))}
      </div>
    </div>
  );
}

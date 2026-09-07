import React from "react";
import { History, Clock } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";

export function HistoryView() {
  const events = [
    { time: "Today 12:48 PM", title: "Brake Lining Wear Reached Critical Threshold", component: "Front Left Brake", severity: "critical" },
    { time: "Today 11:30 AM", title: "Battery Cell Module #3 Thermal Delta Warning", component: "HV Battery Pack", severity: "high" },
    { time: "Yesterday 04:15 PM", title: "Shock Absorber Fluid Attenuation Loss", component: "Rear Left Suspension", severity: "medium" },
    { time: "Yesterday 09:00 AM", title: "System Diagnostic Scan Completed (Passed)", component: "Vehicle System", severity: "healthy" },
  ];

  return (
    <div className="space-y-4 pb-6 font-sans text-xs select-none">
      <div className="border-b border-[#343A42] pb-2">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
          <History size={15} className="text-[#8F969F]" />
          <span>HISTORICAL EVENT LOG TIMELINE</span>
        </h2>
        <p className="text-[11px] font-mono text-[#69717B]">
          Chronological audit record of vehicle fault events, sensor threshold breaches, and automated scans
        </p>
      </div>

      <div className="rounded border border-[#343A42] bg-[#1B1F24] p-4 space-y-3 font-mono">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start justify-between border-b border-[#282E35] pb-3 last:border-0 last:pb-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#69717B] flex items-center gap-1">
                  <Clock size={11} /> {ev.time}
                </span>
                <StatusBadge status={ev.severity === "high" ? "warning" : ev.severity} size="sm" />
              </div>
              <h4 className="text-xs font-bold text-[#E2E5E8] font-sans">{ev.title}</h4>
              <p className="text-[11px] text-[#969DA6] font-sans">
                Target: <strong className="text-[#E2E5E8]">{ev.component}</strong>
              </p>
            </div>
            <span className="text-[10px] text-[#69717B]">REC #{1042 - i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

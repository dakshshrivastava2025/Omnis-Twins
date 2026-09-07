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
    <div className="space-y-6 pb-8 font-sans select-none text-[#F0F0F0] bg-canvas">
      <div className="border-b border-[#222222] pb-3 animate-fade-in-up">
        <h2 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2">
          <History size={16} className="text-[#C9547A]" /><span>Historical Event Log</span>
        </h2>
        <p className="text-[12px] text-[#B0B0B0] mt-0.5">Chronological audit of vehicle fault events and scans</p>
      </div>
      <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 shadow-card-dark animate-fade-in-up stagger-2">
        {events.map((ev, i) => (
          <div key={i} className={`flex items-start justify-between border-b border-[#222222] py-4 first:pt-0 last:border-0 last:pb-0 animate-fade-in-up stagger-${Math.min(i + 2, 8)}`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#555555] flex items-center gap-1.5"><Clock size={12} /> {ev.time}</span>
                <StatusBadge status={ev.severity === "high" ? "warning" : ev.severity} size="sm" />
              </div>
              <h4 className="text-[13px] font-semibold text-[#F0F0F0]">{ev.title}</h4>
              <p className="text-[12px] text-[#B0B0B0]">Target: <strong className="text-[#F0F0F0]">{ev.component}</strong></p>
            </div>
            <span className="text-[10px] font-semibold text-[#C9547A] bg-[#C9547A]/10 border border-[#C9547A]/20 px-2.5 py-1 rounded-full shrink-0">#{1042 - i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import {
  LayoutDashboard,
  Box,
  Cpu,
  Activity,
  AlertTriangle,
  History,
  FileText,
  Settings,
  ActivitySquare,
} from "lucide-react";
import { TOKENS } from "../../theme/tokens.js";

export function Sidebar({ activeTab, onSelectTab, alertsCount = 4 }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "twin", label: "Digital Twin", icon: Box, badge: "3D" },
    { id: "components", label: "Components", icon: Cpu },
    { id: "sensors", label: "Sensors", icon: Activity },
    { id: "calibration", label: "Calibration", icon: ActivitySquare, badge: "μ±σ" },
    { id: "alerts", label: "Alerts", icon: AlertTriangle, count: alertsCount },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className="flex flex-col w-56 shrink-0 border-r h-full overflow-y-auto select-none"
      style={{
        backgroundColor: TOKENS.colors.bgSidebar,
        borderColor: TOKENS.colors.border,
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: TOKENS.colors.border }}>
        <div className="flex items-center justify-center h-7 w-7 rounded bg-[#282E35] text-[#E2E5E8] font-mono font-bold border border-[#343A42]">
          <ActivitySquare size={16} />
        </div>
        <div>
          <h1 className="text-xs font-mono font-bold tracking-wider text-[#E2E5E8] uppercase">OMNIS-DIAG</h1>
          <p className="text-[9px] font-mono tracking-widest text-[#69717B] uppercase">
            WORKSTATION v4.2
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="px-2 text-[9px] font-mono font-semibold text-[#69717B] uppercase tracking-widest mb-1.5">
          System View
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                isActive
                  ? "bg-[#2A3037] text-[#E2E5E8] font-bold border border-[#343A42]"
                  : "text-[#969DA6] hover:text-[#E2E5E8] hover:bg-[#22272D]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={14} className={isActive ? "text-[#E2E5E8]" : "text-[#8F969F]"} />
                <span>{item.label}</span>
              </div>

              {item.count ? (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-[#C94A4A]/20 text-[#C94A4A] border border-[#C94A4A]/40">
                  {item.count}
                </span>
              ) : item.badge ? (
                <span className="px-1 py-0.2 text-[9px] font-mono rounded bg-[#282E35] text-[#969DA6] border border-[#343A42]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Technical Status */}
      <div className="p-3 border-t text-[11px] font-mono" style={{ borderColor: TOKENS.colors.border }}>
        <div className="flex items-center justify-between">
          <span className="text-[#69717B] text-[10px]">TELEMETRY</span>
          <span className="flex items-center gap-1 text-[#3A9B72] text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3A9B72]" />
            ONLINE
          </span>
        </div>
        <p className="text-[9px] text-[#69717B] font-mono mt-0.5">
          FREQ: 4.4kHz | LATENCY: 12ms
        </p>
      </div>
    </aside>
  );
}

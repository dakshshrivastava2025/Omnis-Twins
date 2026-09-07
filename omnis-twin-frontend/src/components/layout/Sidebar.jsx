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
  Sliders,
  Zap,
} from "lucide-react";

export function Sidebar({ activeTab, onSelectTab, alertsCount = 4 }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "twin", label: "Digital Twin", icon: Box, badge: "3D" },
    { id: "components", label: "Subsystems", icon: Cpu },
    { id: "sensors", label: "Sensors", icon: Activity },
    { id: "calibration", label: "Calibration", icon: Sliders },
    { id: "alerts", label: "Alerts", icon: AlertTriangle, count: alertsCount },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-[#222222] h-full overflow-y-auto select-none font-sans bg-[#141414] text-[#F0F0F0]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#222222]">
        <div className="flex items-center justify-center h-9 w-9 rounded-[12px] bg-gradient-to-br from-[#C9547A] to-[#E091A8] text-white font-bold text-sm shadow-md">
          OT
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-[#F0F0F0]">
            OMNIS TWIN
          </h1>
          <p className="text-[10px] text-[#E091A8] font-medium tracking-wide">
            AI DIAGNOSTICS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-[#555555] uppercase tracking-wider mb-3">
          Platform
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-[12px] text-[13px] font-sans transition-all duration-200 ${
                isActive
                  ? "bg-[#C9547A]/12 text-[#C9547A] font-semibold"
                  : "text-[#B0B0B0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-3">
                {isActive && (
                  <span className="absolute left-0 w-[3px] h-5 rounded-r-full bg-[#C9547A]" />
                )}
                <Icon
                  size={16}
                  className={isActive ? "text-[#C9547A]" : "text-[#666666]"}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </div>

              {item.count ? (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? "bg-[#E5466B] text-white"
                      : "bg-[#E5466B]/15 text-[#E5466B]"
                  }`}
                >
                  {item.count}
                </span>
              ) : item.badge ? (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                    isActive
                      ? "bg-[#E091A8] text-[#111111]"
                      : "bg-[#E091A8]/15 text-[#E091A8]"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-3 border-t border-[#222222]">
        <div className="p-3 rounded-[12px] bg-[#111111] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#B0B0B0] font-semibold flex items-center gap-1.5">
              <Zap size={11} className="text-[#E091A8]" />
              AI ENGINE
            </span>
            <span className="flex items-center gap-1 text-[#5CB88A] text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5CB88A] animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[9px] text-[#555555]">
            IsolationForest · 99% accuracy
          </p>
          <p className="text-[9px] text-[#555555]">
            ChromaDB · 512-dim vectors
          </p>
        </div>
      </div>
    </aside>
  );
}

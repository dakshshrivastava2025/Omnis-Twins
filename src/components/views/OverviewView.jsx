import React from "react";
import { AlertCircle, Box, Radio, Cpu } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { ComponentCard } from "../ui/ComponentCard.jsx";
import { AlertCard } from "../ui/AlertCard.jsx";
import { TrendChart } from "../ui/TrendChart.jsx";
import { SensorCard } from "../ui/SensorCard.jsx";

export function OverviewView({
  vehicle,
  components,
  alerts,
  sensors,
  timeRange,
  onTimeRangeChange,
  onSelectComponent,
  onSelectAlert,
  onNavigateToTwin,
}) {
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "high");

  return (
    <div className="space-y-4 pb-6 font-sans text-xs">
      {/* Vehicle Instrument Status Header */}
      <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#969DA6] font-bold">
                WORKSTATION COMMAND CENTER
              </span>
              <StatusBadge status={vehicle.status} size="sm" />
            </div>
            <h2 className="text-base font-bold text-[#E2E5E8] font-sans mt-0.5">
              {vehicle.name}
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-[#343A42] pl-4 font-mono text-[11px] text-[#969DA6]">
            <div>
              <span className="text-[#69717B] block text-[9px] uppercase">VIN</span>
              <span className="text-[#E2E5E8]">{vehicle.vin}</span>
            </div>
            <div>
              <span className="text-[#69717B] block text-[9px] uppercase">ODOMETER</span>
              <span className="text-[#E2E5E8]">{vehicle.odometer}</span>
            </div>
            <div>
              <span className="text-[#69717B] block text-[9px] uppercase">FIRMWARE</span>
              <span className="text-[#E2E5E8]">{vehicle.firmware}</span>
            </div>
          </div>
        </div>

        {/* System Health Gauge & 3D Launch CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#14171B] px-3 py-1.5 rounded border border-[#343A42] font-mono">
            <span className="text-[10px] text-[#969DA6] uppercase font-sans">HEALTH INDEX:</span>
            <span className="text-sm font-bold text-[#C28A32]">{vehicle.health}%</span>
          </div>

          <button
            onClick={onNavigateToTwin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E2E5E8] hover:bg-[#FFFFFF] text-[#14171B] font-mono font-bold text-xs transition-colors"
          >
            <Box size={14} />
            <span>LAUNCH 3D TWIN</span>
          </button>
        </div>
      </div>

      {/* Priority Diagnostic Incident Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[#343A42] pb-1.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C94A4A] flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>PRIORITY DIAGNOSTIC ALERTS ({criticalAlerts.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-[#69717B]">ACTION REQUIRED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onSelectAlert={onSelectAlert}
                onActionClick={() => {
                  const comp = components.find((c) => c.id === alert.componentId);
                  if (comp) onSelectComponent(comp);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Component Health Diagnostic Matrix Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#343A42] pb-1.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
            <Cpu size={14} className="text-[#8F969F]" />
            <span>COMPONENT DIAGNOSTIC MATRIX</span>
          </h3>
          <span className="text-[10px] font-mono text-[#969DA6]">
            {components.length} Mechanical Subsystems Tracked
          </span>
        </div>

        {/* Structured Table */}
        <div className="rounded border border-[#343A42] bg-[#1B1F24] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#343A42] bg-[#14171B] text-[10px] font-mono uppercase text-[#69717B] tracking-wider">
                  <th className="px-3 py-2">Component Name</th>
                  <th className="px-3 py-2">System</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Health Index</th>
                  <th className="px-3 py-2">Key Telemetry Evidence</th>
                  <th className="px-3 py-2">Last Sync</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp) => (
                  <ComponentCard
                    key={comp.id}
                    component={comp}
                    onSelectComponent={onSelectComponent}
                    viewMode="table"
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Degradation History Chart & Live Sensor Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <div className="lg:col-span-2">
          <TrendChart
            timeRange={timeRange}
            onTimeRangeChange={onTimeRangeChange}
            metric="health"
            title="SYSTEM DEGRADATION TREND HISTORY"
          />
        </div>

        {/* Live Telemetry Sensor Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[#343A42] pb-1.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
              <Radio size={14} className="text-[#3A9B72]" />
              <span>KEY TELEMETRY INSTRUMENTS</span>
            </h3>
          </div>

          <div className="space-y-2">
            {sensors.slice(0, 3).map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

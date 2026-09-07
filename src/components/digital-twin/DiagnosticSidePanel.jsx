import React, { useState } from "react";
import {
  X,
  AlertCircle,
  Activity,
  Volume2,
  Thermometer,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Focus,
  Eye,
  Wrench,
  Clock,
  Radio,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { TOKENS } from "../../theme/tokens.js";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { Sparkline } from "../ui/Sparkline.jsx";
import { TrendChart } from "../ui/TrendChart.jsx";

export function DiagnosticSidePanel({
  component,
  components = [],
  sensors = [],
  alerts = [],
  timeRange = "24H",
  onTimeRangeChange,
  onSelectComponent,
  onFocus3D,
  onToggleIsolate3D,
  isIsolated = false,
  onClose,
}) {
  const [actionSuccess, setActionSuccess] = useState(false);

  if (!component) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#69717B] bg-[#1B1F24] border-l border-[#343A42] font-mono text-xs">
        <Layers size={32} className="text-[#69717B] mb-2" />
        <h4 className="text-sm font-bold text-[#E2E5E8]">NO COMPONENT SELECTED</h4>
        <p className="text-[11px] text-[#969DA6] mt-1 max-w-xs">
          Select any component on the 3D vehicle model or choose from the system dropdown.
        </p>
      </div>
    );
  }

  // Filter alerts & sensors for this component
  const componentAlerts = alerts.filter((a) => a.componentId === component.id);
  const componentSensors = sensors.filter(
    (s) => s.componentId === component.id || component.sensors?.includes(s.id)
  );

  const getSensorIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "vibration":
        return <Activity size={14} className="text-[#8F969F]" />;
      case "audio":
        return <Volume2 size={14} className="text-[#8F969F]" />;
      case "temperature":
        return <Thermometer size={14} className="text-[#C28A32]" />;
      case "pressure":
      case "tpms":
        return <Gauge size={14} className="text-[#3A9B72]" />;
      default:
        return <Radio size={14} className="text-[#8F969F]" />;
    }
  };

  const sensorEvidenceList = (componentSensors.length > 0 ? componentSensors : [
    {
      id: "s-default-1",
      name: "Tri-Axial Vibration",
      type: "Vibration",
      value: component.health < 60 ? "6.82" : "1.42",
      unit: "g RMS",
      baseline: "1.82",
      change: component.health < 60 ? "+275%" : "0%",
      status: component.health < 60 ? "critical" : "healthy",
      lastUpdate: "Just now",
      trend: component.health < 60 ? [1.2, 2.4, 4.1, 5.8, 6.82] : [1.4, 1.41, 1.42, 1.42],
    },
    {
      id: "s-default-2",
      name: "High-Freq Audio Spectrum",
      type: "Audio",
      value: component.health < 60 ? "78.4" : "42.0",
      unit: "dB",
      baseline: "50.0",
      change: component.health < 60 ? "+57%" : "-16%",
      status: component.health < 60 ? "critical" : "healthy",
      lastUpdate: "12 sec ago",
      trend: component.health < 60 ? [48, 55, 66, 74, 78.4] : [42, 42, 41, 42],
    },
    {
      id: "s-default-3",
      name: "Thermal Sensor",
      type: "Temperature",
      value: component.health < 60 ? "112.0" : "78.0",
      unit: "°C",
      baseline: "75.0",
      change: component.health < 60 ? "+49%" : "+4%",
      status: component.health < 60 ? "attention" : "healthy",
      lastUpdate: "3 sec ago",
      trend: component.health < 60 ? [75, 84, 98, 108, 112] : [76, 77, 78, 78],
    },
  ]).map((s) => {
    let baseline = s.baseline || (parseFloat(s.value) * 0.75).toFixed(1);
    let change = s.change;
    if (!change && s.value) {
      const valNum = parseFloat(s.value);
      const baseNum = parseFloat(baseline);
      if (!isNaN(valNum) && !isNaN(baseNum) && baseNum !== 0) {
        const diff = ((valNum - baseNum) / baseNum) * 100;
        change = (diff >= 0 ? "+" : "") + diff.toFixed(0) + "%";
      } else {
        change = "Nominal";
      }
    }
    return { ...s, baseline, change: change || "+0%" };
  });

  const primaryAlert = componentAlerts[0];
  const possibleIssue = primaryAlert?.title || (component.health < 70 ? `${component.name} Friction & Thermal Wear` : "Normal Operational Envelope");
  const confidence = primaryAlert?.confidence ? Math.round(primaryAlert.confidence * 100) : component.health < 70 ? 87 : 99;

  const handleActionClick = () => {
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 4000);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar border-l border-[#343A42] bg-[#1B1F24] text-[#E2E5E8] font-sans text-xs select-none">
      {/* Panel Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 border-b border-[#343A42] bg-[#14171B] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#969DA6]">
            DIAGNOSTIC INSPECTOR
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Component Selector Dropdown */}
          <select
            value={component.id}
            onChange={(e) => {
              const target = components.find((c) => c.id === e.target.value);
              if (target && onSelectComponent) onSelectComponent(target);
            }}
            className="bg-[#22272D] text-[11px] font-mono font-medium text-[#E2E5E8] border border-[#343A42] rounded px-2 py-0.5 outline-none focus:border-[#5C6470]"
          >
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.health}%)
              </option>
            ))}
          </select>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8F969F] hover:text-white hover:bg-[#22272D] transition-colors"
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Component Title & Health Banner */}
        <div className="rounded border border-[#343A42] bg-[#22272D] p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#969DA6] tracking-wider">
                {component.category || "Subsystem"}
              </span>
              <h3 className="text-sm font-bold text-[#E2E5E8] leading-snug">{component.name}</h3>
              <p className="text-[10px] text-[#69717B] font-mono flex items-center gap-1 mt-0.5">
                <Clock size={11} />
                <span>Updated: {component.lastUpdated || "Just now"}</span>
              </p>
            </div>
            <StatusBadge status={component.status} size="sm" />
          </div>

          {/* Health Gauge Bar */}
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#969DA6]">Health Index</span>
              <span
                className={`font-bold ${
                  component.health >= 85
                    ? "text-[#3A9B72]"
                    : component.health >= 60
                    ? "text-[#C28A32]"
                    : "text-[#C94A4A]"
                }`}
              >
                {component.health}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded bg-[#2A3037] overflow-hidden">
              <div
                className={`h-full ${
                  component.health >= 85
                    ? "bg-[#3A9B72]"
                    : component.health >= 60
                    ? "bg-[#C28A32]"
                    : "bg-[#C94A4A]"
                }`}
                style={{ width: `${component.health}%` }}
              />
            </div>
          </div>

          {/* 3D Action Tools */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#343A42] font-mono text-[11px]">
            <button
              onClick={() => onFocus3D && onFocus3D(component.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-[#282E35] text-[#E2E5E8] hover:bg-[#343A42] border border-[#343A42] transition-colors font-bold"
            >
              <Focus size={13} />
              <span>FOCUS 3D</span>
            </button>
            <button
              onClick={() => onToggleIsolate3D && onToggleIsolate3D(component.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded border transition-colors font-bold ${
                isIsolated
                  ? "bg-[#2A3037] text-[#E2E5E8] border-[#5C6470]"
                  : "bg-[#282E35] text-[#969DA6] hover:bg-[#343A42] border-[#343A42]"
              }`}
            >
              <Eye size={13} />
              <span>{isIsolated ? "ISOLATED" : "ISOLATE"}</span>
            </button>
          </div>
        </div>

        {/* Suspected Issue & Confidence */}
        <div className="rounded border border-[#343A42] bg-[#22272D] p-3 space-y-2">
          <div className="flex items-center justify-between font-mono">
            <h4 className="text-[10px] uppercase font-bold text-[#C28A32] tracking-wider flex items-center gap-1">
              <AlertCircle size={12} />
              <span>DIAGNOSTIC FAULT LOG</span>
            </h4>
            <span className="text-[10px] font-mono text-[#969DA6]">
              Confidence: <strong className="text-[#E2E5E8]">{confidence}%</strong>
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-[#E2E5E8]">{possibleIssue}</p>
            <p className="text-[11px] text-[#969DA6] mt-1 leading-relaxed">
              {primaryAlert?.description || component.recommendedAction}
            </p>
          </div>
        </div>

        {/* Active Related Alerts */}
        {componentAlerts.length > 0 && (
          <div className="space-y-1.5 font-mono">
            <h4 className="text-[10px] uppercase font-bold text-[#C94A4A] tracking-wider flex items-center gap-1">
              <AlertCircle size={12} />
              <span>ACTIVE SYSTEM INCIDENTS ({componentAlerts.length})</span>
            </h4>
            {componentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded border border-[#C94A4A]/40 bg-[#C94A4A]/10 p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#C94A4A] uppercase">
                    {alert.severity} PRIORITY
                  </span>
                  <span className="text-[10px] text-[#969DA6]">{alert.timestamp}</span>
                </div>
                <p className="text-xs font-bold text-[#E2E5E8] font-sans">{alert.title}</p>
                {alert.evidence && alert.evidence.length > 0 && (
                  <div className="text-[10px] text-[#E2E5E8] space-y-0.5 bg-[#14171B] p-2 rounded border border-[#343A42] font-mono">
                    {alert.evidence.map((ev, i) => (
                      <div key={i}>• {ev}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sensor Evidence Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono">
            <h4 className="text-[10px] uppercase font-bold text-[#969DA6] tracking-wider flex items-center gap-1">
              <Radio size={12} className="text-[#3A9B72]" />
              <span>SENSOR EVIDENCE & BASELINE LOG</span>
            </h4>
            <span className="text-[10px] text-[#69717B]">{sensorEvidenceList.length} CHANNELS</span>
          </div>

          <div className="space-y-2">
            {sensorEvidenceList.map((sensor) => (
              <div
                key={sensor.id}
                className="rounded border border-[#343A42] bg-[#22272D] p-2.5 space-y-2 font-mono text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getSensorIcon(sensor.type)}
                    <div>
                      <p className="font-bold text-[#E2E5E8] text-xs font-sans">{sensor.name || sensor.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={sensor.status || "healthy"} size="sm" />
                </div>

                {/* Telemetry Metric Grid */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded bg-[#14171B] border border-[#343A42] text-[10px]">
                  <div>
                    <span className="text-[#69717B] block text-[9px] uppercase font-sans">Current</span>
                    <span className="font-bold text-[#E2E5E8]">
                      {sensor.value} {sensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[9px] uppercase font-sans">Baseline</span>
                    <span className="text-[#969DA6]">
                      {sensor.baseline} {sensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[9px] uppercase font-sans">Delta</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        sensor.change.startsWith("+") && sensor.change !== "+0%"
                          ? "text-[#C28A32]"
                          : "text-[#3A9B72]"
                      }`}
                    >
                      {sensor.change.startsWith("+") ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {sensor.change}
                    </span>
                  </div>
                </div>

                {/* Sparkline */}
                {sensor.trend && (
                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <span className="text-[#69717B]">Live Telemetry</span>
                    <div className="w-24 h-4">
                      <Sparkline data={sensor.trend} status={sensor.status || "healthy"} height={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Timeframe Degradation Trend Chart */}
        <div className="rounded border border-[#343A42] bg-[#22272D] p-3 space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold text-[#969DA6]">
              DEGRADATION TREND HISTORY
            </h4>
            <div className="flex items-center gap-1 bg-[#14171B] p-0.5 rounded border border-[#343A42] text-[9px]">
              {["1H", "6H", "24H", "7D", "30D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeRangeChange && onTimeRangeChange(tf)}
                  className={`px-1.5 py-0.5 font-mono font-semibold transition-colors ${
                    timeRange === tf
                      ? "bg-[#2A3037] text-[#E2E5E8] border border-[#343A42]"
                      : "text-[#969DA6] hover:text-[#E2E5E8]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <TrendChart
            timeRange={timeRange}
            data={component.trend || [90, 85, 80, 75, 70, component.health]}
            height={140}
          />
        </div>

        {/* Primary Action Button */}
        <div className="rounded border border-[#343A42] bg-[#22272D] p-3 space-y-2">
          <h4 className="text-[10px] uppercase font-mono font-bold text-[#969DA6] tracking-wider flex items-center gap-1">
            <Wrench size={12} />
            <span>RECOMMENDED ACTION PLAN</span>
          </h4>

          <p className="text-xs text-[#E2E5E8]">
            {component.recommendedAction || "System operating within nominal threshold."}
          </p>

          {actionSuccess ? (
            <div className="flex items-center gap-2 p-2 rounded bg-[#3A9B72]/15 border border-[#3A9B72]/30 text-[#3A9B72] text-xs font-mono font-bold">
              <CheckCircle2 size={14} />
              <span>WORK ORDER DISPATCHED (#WO-{Math.floor(1000 + Math.random() * 9000)})</span>
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#E2E5E8] hover:bg-[#FFFFFF] text-[#14171B] font-mono text-xs font-bold transition-colors shadow-sm"
            >
              <Wrench size={13} />
              <span>
                {component.health < 60 ? "DISPATCH PRIORITY WORK ORDER" : "ACKNOWLEDGE & LOG RECORD"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

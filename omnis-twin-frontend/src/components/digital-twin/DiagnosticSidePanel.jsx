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
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#7A7A7A] bg-[#222222] border-l border-[#3A3A3A] font-mono text-xs">
        <Layers size={36} className="text-[#4A4A4A] mb-3" />
        <h4 className="text-sm font-bold text-white tracking-wide">NO COMPONENT SELECTED</h4>
        <p className="text-[11px] text-[#BDBDBD] mt-1.5 max-w-xs leading-relaxed">
          Select any subsystem component on the 3D vehicle CAD model to inspect real-time neural telemetry.
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
        return <Activity size={14} className="text-[#00BFFF]" />;
      case "audio":
        return <Volume2 size={14} className="text-[#76B900]" />;
      case "temperature":
        return <Thermometer size={14} className="text-[#FFA000]" />;
      case "pressure":
      case "tpms":
        return <Gauge size={14} className="text-[#6EFA5F]" />;
      default:
        return <Radio size={14} className="text-[#BDBDBD]" />;
    }
  };

  const sensorEvidenceList = (componentSensors.length > 0 ? componentSensors : [
    {
      id: "s-default-1",
      name: "Tri-Axial High-G Vibration",
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
      name: "Acoustic Friction Spectrum",
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
      name: "Bearing Thermal Probe",
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
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar border-l border-[#3A3A3A] bg-[#222222] text-white font-mono text-xs select-none">
      {/* Panel Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 border-b border-[#3A3A3A] bg-[#222222]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#76B900]">
            TELEMETRY DIAGNOSTIC INSPECTOR
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
            className="bg-[#1A1A1A] text-[11px] font-mono font-medium text-white border border-[#3A3A3A] rounded-[6px] px-2.5 py-1 outline-none focus:border-[#76B900] cursor-pointer"
          >
            {components.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#1A1A1A] text-white">
                {c.name} ({c.health}%)
              </option>
            ))}
          </select>

          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#BDBDBD] hover:text-white hover:bg-[#2A2A2A] transition-colors"
            title="Close Inspector"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 font-mono">
        {/* Component Title & Health Banner Card */}
        <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-3.5 space-y-3 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#76B900] font-bold tracking-wider">
                {component.category || "Subsystem"}
              </span>
              <h3 className="text-sm font-bold text-white leading-snug mt-0.5">{component.name}</h3>
              <p className="text-[10px] text-[#7A7A7A] flex items-center gap-1 mt-1">
                <Clock size={11} />
                <span>Updated: {component.lastUpdated || "Just now"}</span>
              </p>
            </div>
            <StatusBadge status={component.status} size="sm" />
          </div>

          {/* Health Gauge Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#BDBDBD]">Health Status</span>
              <span
                className={`font-bold ${
                  component.health >= 85
                    ? "text-[#6EFA5F]"
                    : component.health >= 60
                    ? "text-[#FFA000]"
                    : "text-[#FF4B4B]"
                }`}
              >
                {component.health}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#1A1A1A] overflow-hidden border border-[#3A3A3A]">
              <div
                className={`h-full ${
                  component.health >= 85
                    ? "bg-[#6EFA5F]"
                    : component.health >= 60
                    ? "bg-[#FFA000]"
                    : "bg-[#FF4B4B]"
                }`}
                style={{ width: `${component.health}%` }}
              />
            </div>
          </div>

          {/* 3D Action Tools */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-[#3A3A3A] font-mono text-[11px]">
            <button
              onClick={() => onFocus3D && onFocus3D(component.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-[6px] bg-[#1A1A1A] text-white hover:bg-[#333333] hover:border-[#76B900] border border-[#4A4A4A] transition-all font-semibold"
            >
              <Focus size={13} className="text-[#76B900]" />
              <span>FOCUS 3D</span>
            </button>
            <button
              onClick={() => onToggleIsolate3D && onToggleIsolate3D(component.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-[6px] border transition-all font-semibold ${
                isIsolated
                  ? "bg-[#FFA000]/15 text-[#FFA000] border-[#FFA000]"
                  : "bg-[#1A1A1A] text-[#BDBDBD] hover:bg-[#333333] hover:text-white border-[#4A4A4A]"
              }`}
            >
              <Eye size={13} />
              <span>{isIsolated ? "ISOLATED" : "ISOLATE"}</span>
            </button>
          </div>
        </div>

        {/* Suspected Issue & Confidence Card */}
        <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-3.5 space-y-2 shadow-card">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold text-[#FFA000] tracking-wider flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>NEURAL DIAGNOSTIC LOG</span>
            </h4>
            <span className="text-[10px] text-[#76B900] font-bold">
              CONFIDENCE: {confidence}%
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-white">{possibleIssue}</p>
            <p className="text-[11px] text-[#BDBDBD] mt-1 leading-relaxed">
              {primaryAlert?.description || component.recommendedAction}
            </p>
          </div>
        </div>

        {/* Active Related Alerts */}
        {componentAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-[#FF4B4B] tracking-wider flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>ACTIVE SYSTEM INCIDENTS ({componentAlerts.length})</span>
            </h4>
            {componentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-[8px] border border-[#FF4B4B]/40 bg-[#FF4B4B]/10 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#FF4B4B] uppercase">
                    {alert.severity} PRIORITY
                  </span>
                  <span className="text-[10px] text-[#BDBDBD]">{alert.timestamp}</span>
                </div>
                <p className="text-xs font-bold text-white">{alert.title}</p>
                {alert.evidence && alert.evidence.length > 0 && (
                  <div className="text-[10px] text-white space-y-1 bg-[#1A1A1A] p-2 rounded-[6px] border border-[#3A3A3A]">
                    {alert.evidence.map((ev, i) => (
                      <div key={i}>
                        <span className="text-[#FF4B4B] mr-1.5">•</span>
                        {ev}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sensor Evidence List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
              <Radio size={13} className="text-[#6EFA5F]" />
              <span>SENSOR EVIDENCE CHANNELS</span>
            </h4>
            <span className="text-[10px] text-[#7A7A7A]">{sensorEvidenceList.length} ACTIVE</span>
          </div>

          <div className="space-y-2">
            {sensorEvidenceList.map((sensor) => (
              <div
                key={sensor.id}
                className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-3 space-y-2 text-[11px] shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <p className="font-bold text-white text-xs">{sensor.name || sensor.type}</p>
                  </div>
                  <StatusBadge status={sensor.status || "healthy"} size="sm" />
                </div>

                {/* Telemetry Metric Grid */}
                <div className="grid grid-cols-3 gap-2 p-2 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] text-[10px]">
                  <div>
                    <span className="text-[#7A7A7A] block text-[9px] uppercase">Current</span>
                    <span className="font-bold text-white">
                      {sensor.value} {sensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block text-[9px] uppercase">Baseline</span>
                    <span className="text-[#BDBDBD]">
                      {sensor.baseline} {sensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block text-[9px] uppercase">Delta</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        sensor.change.startsWith("+") && sensor.change !== "+0%"
                          ? "text-[#FFA000]"
                          : "text-[#6EFA5F]"
                      }`}
                    >
                      {sensor.change.startsWith("+") ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {sensor.change}
                    </span>
                  </div>
                </div>

                {/* Sparkline */}
                {sensor.trend && (
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-[#7A7A7A]">Live Feed</span>
                    <div className="w-24 h-4">
                      <Sparkline data={sensor.trend} status={sensor.status || "healthy"} height={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Degradation Trend Chart */}
        <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-3 space-y-2 shadow-card">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold text-white">
              DEGRADATION TREND HISTORY
            </h4>
            <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-[6px] border border-[#3A3A3A] text-[9px]">
              {["1H", "6H", "24H", "7D", "30D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeRangeChange && onTimeRangeChange(tf)}
                  className={`px-2 py-0.5 font-medium rounded-[4px] transition-all ${
                    timeRange === tf
                      ? "bg-[#76B900] text-[#1A1A1A] font-bold"
                      : "text-[#BDBDBD] hover:text-white"
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
            height={130}
          />
        </div>

        {/* Primary Action Button */}
        <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-3.5 space-y-2.5 shadow-card">
          <h4 className="text-[10px] uppercase font-bold text-[#76B900] tracking-wider flex items-center gap-1.5">
            <Wrench size={13} />
            <span>RECOMMENDED ACTION PLAN</span>
          </h4>

          <p className="text-xs text-[#BDBDBD] leading-relaxed">
            {component.recommendedAction || "Subsystem operating within nominal manufacturer thresholds."}
          </p>

          {actionSuccess ? (
            <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[#6EFA5F]/15 border border-[#6EFA5F]/30 text-[#6EFA5F] text-xs font-bold">
              <CheckCircle2 size={15} />
              <span>WORK ORDER DISPATCHED: #WO-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] bg-[#76B900] hover:bg-[#6da800] text-[#1A1A1A] font-semibold text-xs transition-all shadow-sm active:translate-y-px"
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

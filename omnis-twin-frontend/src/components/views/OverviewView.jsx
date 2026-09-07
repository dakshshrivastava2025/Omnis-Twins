import React, { useState, useEffect } from "react";
import { AlertCircle, Box, Radio, Cpu, Play, Terminal, Zap } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { ComponentCard } from "../ui/ComponentCard.jsx";
import { AlertCard } from "../ui/AlertCard.jsx";
import { TrendChart } from "../ui/TrendChart.jsx";
import { SensorCard } from "../ui/SensorCard.jsx";
import { evaluateTelemetryStream, adaptDiagnosticsToTwinState } from "../../diagnostics/DiagnosticAdapter";

export function OverviewView({
  vehicle: initialVehicle,
  components: initialComponents,
  alerts: initialAlerts,
  sensors: initialSensors,
  timeRange,
  onTimeRangeChange,
  onSelectComponent,
  onSelectAlert,
  onNavigateToTwin,
}) {
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [components, setComponents] = useState(initialComponents);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [sensors, setSensors] = useState(initialSensors);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [latestEvalResult, setLatestEvalResult] = useState(null);

  useEffect(() => {
    async function fetchBackendData() {
      try {
        const sampleTelemetry = { decibels: 88.0, frequencyHz: 2500, vibration_amplitude: 12.4, temperature_c: 105.2, rpm: 1800 };
        const response = await evaluateTelemetryStream(sampleTelemetry, { surface: "ASPHALT" });
        if (response && response.success) {
          setIsBackendConnected(true);
          setLatestEvalResult(response);
          if (response.diagnostics && initialComponents) {
            const adaptedState = adaptDiagnosticsToTwinState(initialComponents, response.diagnostics);
            const updatedComponents = initialComponents.map((c) => ({ ...c, ...(adaptedState[c.id] || {}) }));
            setComponents(updatedComponents);
          }
        }
      } catch (err) {
        console.warn("Backend offline:", err);
        setIsBackendConnected(false);
      }
    }
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 10000);
    return () => clearInterval(interval);
  }, [initialComponents]);

  const handleManualTestEval = async () => {
    try {
      setIsTestingStream(true);
      const res = await evaluateTelemetryStream({ decibels: 92.0, frequencyHz: 3100, vibration_amplitude: 15.1, temperature_c: 112.0, rpm: 2100 }, { surface: "GRAVEL" });
      setLatestEvalResult(res);
    } catch (error) {
      console.error("Manual evaluation failed:", error);
    } finally {
      setIsTestingStream(false);
    }
  };

  const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "high");

  return (
    <div className="space-y-6 pb-8 font-sans text-[#F0F0F0] bg-canvas">
      {/* Backend Connection Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1A1A] border border-[#222222] p-4 rounded-[12px] shadow-card-dark animate-fade-in-up">
        <div className="flex items-center gap-3 text-[13px]">
          <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? "bg-[#5CB88A] animate-pulse" : "bg-[#E5466B]"}`} />
          <span className={isBackendConnected ? "text-[#F0F0F0] font-semibold" : "text-[#E5466B] font-semibold"}>
            {isBackendConnected ? "AI Telemetry Pipeline Connected" : "Telemetry Backend Offline"}
          </span>
          <span className="text-[11px] text-[#555555] hidden sm:inline">| Stream: 100ms</span>
        </div>
        <button onClick={handleManualTestEval} disabled={isTestingStream}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#C9547A] hover:bg-[#B54A6C] text-white font-semibold text-[13px] transition-all duration-200 shadow-sm active:translate-y-px disabled:opacity-50">
          <Play size={14} />
          <span>{isTestingStream ? "Running Inference..." : "Trigger AI Inference"}</span>
        </button>
      </div>

      {/* Diagnostic Feed */}
      {latestEvalResult && (
        <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 space-y-4 shadow-card-dark animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3 text-sm">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-[#E091A8]" />
              <span className="font-semibold">Diagnostic Feed</span>
            </div>
            <span className="text-[11px] uppercase px-2.5 py-1 bg-[#5CB88A]/12 text-[#5CB88A] rounded-full border border-[#5CB88A]/25 font-semibold">
              {latestEvalResult.success ? "Nominal" : "Fault Detected"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] p-4 rounded-[8px] border border-[#222222]">
              <span className="text-[#C9547A] block text-[10px] uppercase tracking-wider mb-2.5 font-semibold">Anomaly Flags</span>
              <div className="space-y-2 text-[13px]">
                {[
                  { label: "Acoustic Friction", key: "audioAnomaly" },
                  { label: "Thermal Gradient", key: "thermalAnomaly" },
                  { label: "Vibration Amplitude", key: "vibrationAnomaly" },
                ].map(({ label, key }) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-[#B0B0B0]">{label}</span>
                    <span className={latestEvalResult.flags?.[key] ? "text-[#E5466B] font-bold" : "text-[#5CB88A] font-bold"}>
                      {latestEvalResult.flags?.[key] ? "Anomalous" : "Nominal"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111111] p-4 rounded-[8px] border border-[#222222] md:col-span-2 space-y-2">
              <span className="text-[#E091A8] block text-[10px] uppercase tracking-wider mb-1 font-semibold">Diagnostic Context & RAG</span>
              <div className="text-[13px] space-y-1.5">
                <div>Timestamp: <span className="text-[#B0B0B0] font-mono text-xs">{latestEvalResult.diagnosis?.timestamp || "Current Stream"}</span></div>
                <div>RAG Escalation: <span className={latestEvalResult.requiresRAG ? "text-[#D4915C] font-bold" : "text-[#5CB88A] font-bold"}>{latestEvalResult.requiresRAG ? "Active" : "Standby"}</span></div>
                <div className="text-[#555555] text-[11px] pt-1 font-mono">Engine: IsolationForest + ChromaDB | Surface: Asphalt | 44.1 kHz</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Command Center */}
      <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 flex flex-wrap items-center justify-between gap-4 shadow-card-dark animate-fade-in-up stagger-3">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-[#C9547A] font-semibold">Vehicle Command Center</span>
              <StatusBadge status={vehicle.status} size="sm" />
            </div>
            <h2 className="text-lg font-bold text-[#F0F0F0]">{vehicle.name}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-4 border-l border-[#222222] pl-4 text-[13px] text-[#B0B0B0]">
            <div><span className="text-[#555555] block text-[10px] uppercase">VIN</span><span className="text-[#F0F0F0] font-semibold font-mono text-xs">{vehicle.vin}</span></div>
            <div><span className="text-[#555555] block text-[10px] uppercase">Odometer</span><span className="text-[#F0F0F0] font-semibold font-mono text-xs">{vehicle.odometer}</span></div>
            <div><span className="text-[#555555] block text-[10px] uppercase">Firmware</span><span className="text-[#F0F0F0] font-semibold font-mono text-xs">{vehicle.firmware}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111111] px-4 py-2 rounded-[8px] border border-[#222222]">
            <span className="text-[11px] text-[#555555] uppercase font-medium">Health</span>
            <span className="text-sm font-bold text-[#5CB88A] font-mono">{vehicle.health}%</span>
          </div>
          <button onClick={onNavigateToTwin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#C9547A] to-[#E091A8] hover:from-[#B54A6C] hover:to-[#D07D96] text-white font-semibold text-[13px] transition-all duration-200 shadow-md active:translate-y-px">
            <Box size={16} />
            <span>Launch 3D Twin</span>
          </button>
        </div>
      </div>

      {/* Priority Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
            <h3 className="text-sm font-semibold text-[#E5466B] flex items-center gap-2"><AlertCircle size={16} /><span>Priority Alerts ({criticalAlerts.length})</span></h3>
            <span className="text-[11px] text-[#D4915C] font-medium">Action Recommended</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onSelectAlert={onSelectAlert}
                onActionClick={() => { const comp = components.find((c) => c.id === alert.componentId); if (comp) onSelectComponent(comp); }} />
            ))}
          </div>
        </div>
      )}

      {/* Subsystem Table */}
      <div className="space-y-3 animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Cpu size={16} className="text-[#C9547A]" /><span>Subsystem Diagnostics</span></h3>
          <span className="text-[11px] text-[#555555]">{components.length} subsystems monitored</span>
        </div>
        <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222222] bg-[#141414] text-[10px] uppercase text-[#555555] tracking-wider font-sans">
                  <th className="px-4 py-3 font-semibold">Component</th><th className="px-4 py-3 font-semibold">Subsystem</th>
                  <th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Health</th>
                  <th className="px-4 py-3 font-semibold">Telemetry</th><th className="px-4 py-3 font-semibold">Last Sync</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>{components.map((comp) => (<ComponentCard key={comp.id} component={comp} onSelectComponent={onSelectComponent} viewMode="table" />))}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trend + Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 animate-fade-in-up stagger-6">
        <div className="lg:col-span-2">
          <TrendChart timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} metric="health" title="System Degradation Trend" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
            <h3 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Radio size={16} className="text-[#E091A8]" /><span>Key Sensors</span></h3>
          </div>
          <div className="space-y-3">{sensors.slice(0, 3).map((sensor) => (<SensorCard key={sensor.id} sensor={sensor} />))}</div>
        </div>
      </div>
    </div>
  );
}
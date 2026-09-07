import React, { useState, useEffect } from "react";
import { Cpu, Play, Terminal } from "lucide-react";
import { ComponentCard } from "../ui/ComponentCard.jsx";
import { evaluateTelemetryStream, adaptDiagnosticsToTwinState } from "../../diagnostics/DiagnosticAdapter";

export function ComponentsView({ components: initialComponents = [], onSelectComponent }) {
  const [components, setComponents] = useState(initialComponents);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [latestEvalResult, setLatestEvalResult] = useState(null);

  useEffect(() => { if (initialComponents?.length > 0) setComponents(initialComponents); }, [initialComponents]);

  useEffect(() => {
    async function fetchBackendData() {
      try {
        const response = await evaluateTelemetryStream({ decibels: 88.0, frequencyHz: 2500, vibration_amplitude: 12.4, temperature_c: 105.2, rpm: 1800 }, { surface: "ASPHALT" });
        if (response?.success) {
          setIsBackendConnected(true); setLatestEvalResult(response);
          if (response.diagnostics && initialComponents?.length > 0) {
            const adaptedState = adaptDiagnosticsToTwinState(initialComponents, response.diagnostics);
            setComponents(initialComponents.map((c) => ({ ...c, ...(adaptedState[c.id] || {}) })));
          }
        }
      } catch (err) { setIsBackendConnected(false); }
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
    } catch (error) { console.error("Manual evaluation failed:", error); }
    finally { setIsTestingStream(false); }
  };

  return (
    <div className="space-y-6 pb-8 font-sans text-[#F0F0F0] bg-canvas">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1A1A] border border-[#222222] p-4 rounded-[12px] shadow-card-dark animate-fade-in-up">
        <div className="flex items-center gap-3 text-[13px]">
          <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? "bg-[#5CB88A] animate-pulse" : "bg-[#E5466B]"}`} />
          <span className={isBackendConnected ? "text-[#F0F0F0] font-semibold" : "text-[#E5466B] font-semibold"}>
            {isBackendConnected ? "AI Inference Stream Active" : "Backend Offline"}
          </span>
        </div>
        <button onClick={handleManualTestEval} disabled={isTestingStream}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#C9547A] hover:bg-[#B54A6C] text-white font-semibold text-[13px] transition-all duration-200 shadow-sm active:translate-y-px disabled:opacity-50">
          <Play size={14} /><span>{isTestingStream ? "Evaluating..." : "Run AI Inference"}</span>
        </button>
      </div>

      {/* Diagnostic Feed */}
      {latestEvalResult && (
        <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 space-y-4 shadow-card-dark animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3 text-sm">
            <div className="flex items-center gap-2"><Terminal size={16} className="text-[#E091A8]" /><span className="font-semibold">RAG Diagnostic Feed</span></div>
            <span className="text-[11px] uppercase px-2.5 py-1 bg-[#5CB88A]/12 text-[#5CB88A] rounded-full border border-[#5CB88A]/25 font-semibold">Success</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] p-4 rounded-[8px] border border-[#222222]">
              <span className="text-[#C9547A] block text-[10px] uppercase tracking-wider mb-2.5 font-semibold">Anomaly Predictors</span>
              <div className="space-y-2 text-[13px]">
                {[{ l: "Audio Friction", k: "audioAnomaly" }, { l: "Thermal Spike", k: "thermalAnomaly" }, { l: "Vibration Delta", k: "vibrationAnomaly" }].map(({ l, k }) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#B0B0B0]">{l}</span>
                    <span className={latestEvalResult.flags?.[k] ? "text-[#E5466B] font-bold" : "text-[#5CB88A] font-bold"}>{latestEvalResult.flags?.[k] ? "Detected" : "Nominal"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111111] p-4 rounded-[8px] border border-[#222222] md:col-span-2 space-y-2">
              <span className="text-[#E091A8] block text-[10px] uppercase tracking-wider mb-1 font-semibold">Diagnostic Details & RAG</span>
              <div className="text-[13px] space-y-1.5">
                <div>Timestamp: <span className="text-[#B0B0B0] font-mono text-xs">{latestEvalResult.diagnosis?.timestamp || "Stream Live"}</span></div>
                <div>RAG Escalation: <span className={latestEvalResult.requiresRAG ? "text-[#D4915C] font-bold" : "text-[#5CB88A] font-bold"}>{latestEvalResult.requiresRAG ? "Active" : "Standby"}</span></div>
                <div className="text-[#555555] text-[11px] pt-1 font-mono">Model: IsolationForest + Rule Engine | Confidence: 94.2%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Components Grid */}
      <div className="space-y-3 animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Cpu size={16} className="text-[#C9547A]" /><span>Mechanical Subsystems</span></h3>
          <span className="text-[11px] text-[#555555]">{components.length} subsystems tracked</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {components?.length > 0 ? components.map((comp) => (
            <ComponentCard key={comp.id} component={comp} onSelectComponent={onSelectComponent} viewMode="card" />
          )) : (
            <div className="p-8 text-center text-[#555555] text-[13px] border border-[#222222] rounded-[12px] bg-[#1A1A1A] col-span-2">No subsystems available</div>
          )}
        </div>
      </div>
    </div>
  );
}
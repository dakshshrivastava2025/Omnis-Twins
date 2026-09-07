import React, { useEffect, useRef, useState, useCallback } from "react";
import { VEHICLE_COMPONENTS, VEHICLE_SYSTEMS } from "../../twin/config/vehicleConfig.js";
import { MockDiagnosticProvider, adaptDiagnosticsToTwinState } from "../../diagnostics/DiagnosticAdapter.js";
import { overallHealth } from "../../twin/state/twinState.js";
import { TwinControls } from "./TwinControls.jsx";
import { ModelSelector } from "./ModelSelector.jsx";
import { ScenarioSelector } from "./ScenarioSelector.jsx";
import { TwinCanvas } from "./TwinCanvas.jsx";
import { twinEventBus } from "../../twin/events/TwinEventBus.js";
import { DiagnosticSidePanel } from "./DiagnosticSidePanel.jsx";
import {
  map3DToDashboardId,
  mapDashboardTo3DTwinId,
  buildTwinStateFromComponents,
} from "../../utils/componentMapper.js";
import { Layers } from "lucide-react";

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#14171B] z-30 font-mono text-xs text-[#969DA6]">
      <div className="h-6 w-6 animate-spin rounded border-2 border-[#343A42] border-t-[#E2E5E8]" />
      <p className="font-bold text-[#E2E5E8]">INITIALIZING 3D ENGINE VIEWPORT...</p>
    </div>
  );
}

export function DigitalTwin({
  vehicle,
  components = [],
  sensors = [],
  alerts = [],
  selectedComponentId = null,
  onSelectComponent,
  timeRange = "24H",
  onTimeRangeChange,
}) {
  const [loading, setLoading] = useState(true);
  const [twinState, setTwinState] = useState({});
  const [isolatedId, setIsolatedId] = useState(null);
  const [activeSystemId, setActiveSystemId] = useState(null);
  const [activeModelId, setActiveModelId] = useState("car-anatomy-glb");
  const [activeScenarioId, setActiveScenarioId] = useState("BRAKE_WEAR");
  const [isMobile, setIsMobile] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const resetHandleRef = useRef(() => {});
  const zoomHandleRef = useRef(() => {});
  const focusHandleRef = useRef(() => {});

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const loadScenarioDiagnostics = useCallback(
    (scenarioId) => {
      setLoading(true);
      MockDiagnosticProvider.getDiagnostics(scenarioId).then((diagnostics) => {
        const adapterState = adaptDiagnosticsToTwinState(VEHICLE_COMPONENTS, diagnostics);
        const mergedState = {
          ...adapterState,
          ...buildTwinStateFromComponents(components),
        };
        setTwinState(mergedState);
        setLoading(false);
        twinEventBus.emit("DIAGNOSTIC_UPDATED", { scenarioId, twinState: mergedState });
      });
    },
    [components]
  );

  useEffect(() => {
    loadScenarioDiagnostics(activeScenarioId);
  }, [activeScenarioId, loadScenarioDiagnostics]);

  useEffect(() => {
    if (selectedComponentId) {
      const twin3DId = mapDashboardTo3DTwinId(selectedComponentId);
      if (focusHandleRef.current) {
        focusHandleRef.current(twin3DId);
      }
      setPanelOpen(true);
    }
  }, [selectedComponentId]);

  const handleSelect3DMesh = useCallback(
    (meshOr3DId) => {
      if (!meshOr3DId) return;
      const dashboardId = map3DToDashboardId(meshOr3DId);
      const matchedComp = components.find((c) => c.id === dashboardId) || components[0];
      if (onSelectComponent) {
        onSelectComponent(matchedComp);
      }
      setPanelOpen(true);
    },
    [components, onSelectComponent]
  );

  const handleFocusComponent = useCallback(
    (dashId) => {
      const twin3DId = mapDashboardTo3DTwinId(dashId || selectedComponentId);
      if (focusHandleRef.current) {
        focusHandleRef.current(twin3DId);
      }
    },
    [selectedComponentId]
  );

  const handleToggleIsolate = useCallback(
    (dashId) => {
      const twin3DId = mapDashboardTo3DTwinId(dashId || selectedComponentId);
      const next = isolatedId === twin3DId ? null : twin3DId;
      setIsolatedId(next);
      twinEventBus.emit("COMPONENT_ISOLATED", { componentId: next });
    },
    [selectedComponentId, isolatedId]
  );

  const handleClearIsolate = useCallback(() => {
    setIsolatedId(null);
    twinEventBus.emit("COMPONENT_ISOLATED", { componentId: null });
  }, []);

  const activeComponent =
    components.find((c) => c.id === selectedComponentId) ||
    components.find((c) => c.health < 60) ||
    components[0];

  const current3DSelectedId = selectedComponentId
    ? mapDashboardTo3DTwinId(selectedComponentId)
    : null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#14171B] text-[#E2E5E8] font-sans text-xs select-none">
      {/* Top Controls Toolbar */}
      <div className="z-10 flex shrink-0 flex-wrap items-center justify-between border-b px-4 py-2 gap-2 bg-[#1B1F24] border-[#343A42]">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#969DA6]">
              3D CAD / TELEMETRY VIEWPORT
            </span>
            <h2 className="text-xs font-bold text-[#E2E5E8] font-mono">
              {vehicle?.name || "Omnis Vehicle Twin"}
            </h2>
          </div>

          {/* System Hierarchy Chips */}
          <div className="hidden lg:flex items-center gap-1 bg-[#14171B] p-0.5 rounded border border-[#343A42] font-mono text-[10px]">
            <button
              onClick={() => setActiveSystemId(null)}
              className={`rounded px-2 py-0.5 font-bold uppercase transition-colors ${
                !activeSystemId ? "bg-[#2A3037] text-[#E2E5E8]" : "text-[#969DA6] hover:text-[#E2E5E8]"
              }`}
            >
              ALL SYSTEMS
            </button>
            {VEHICLE_SYSTEMS.map((sys) => (
              <button
                key={sys.id}
                onClick={() => setActiveSystemId(sys.id)}
                className={`rounded px-2 py-0.5 font-bold uppercase transition-colors ${
                  activeSystemId === sys.id ? "bg-[#2A3037] text-[#E2E5E8]" : "text-[#969DA6] hover:text-[#E2E5E8]"
                }`}
              >
                {sys.name}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic Scenarios & Model Profiles */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
          <ScenarioSelector
            activeScenarioId={activeScenarioId}
            onSelectScenario={setActiveScenarioId}
          />
          <ModelSelector activeModelId={activeModelId} onSelectModel={setActiveModelId} />

          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono font-bold transition-colors ${
              panelOpen
                ? "bg-[#2A3037] text-[#E2E5E8] border-[#343A42]"
                : "bg-[#22272D] text-[#969DA6] border-[#343A42] hover:text-[#E2E5E8]"
            }`}
          >
            <Layers size={13} />
            <span>{panelOpen ? "HIDE PANEL" : "SHOW PANEL"}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport & Side Panel */}
      <div className="relative flex min-h-0 flex-1">
        {/* 3D Viewport Area */}
        <div className="relative min-w-0 flex-1 bg-white">
          {loading ? (
            <LoadingOverlay />
          ) : (
            <>
              <TwinCanvas
                twinState={twinState}
                selectedId={current3DSelectedId}
                isolatedId={isolatedId}
                activeSystemId={activeSystemId}
                activeModelId={activeModelId}
                onSelect={handleSelect3DMesh}
                registerResetHandle={(fn) => (resetHandleRef.current = fn)}
                registerZoomHandle={(fn) => (zoomHandleRef.current = fn)}
                registerFocusHandle={(fn) => (focusHandleRef.current = fn)}
              />

              <TwinControls
                onReset={() => {
                  resetHandleRef.current();
                  setIsolatedId(null);
                }}
                onZoomIn={() => zoomHandleRef.current(-1)}
                onZoomOut={() => zoomHandleRef.current(1)}
                isIsolated={!!isolatedId}
                onClearIsolate={handleClearIsolate}
              />
            </>
          )}
        </div>

        {/* Docked Diagnostic Side Panel */}
        {!isMobile && panelOpen && (
          <div className="w-[380px] xl:w-[400px] shrink-0 h-full border-l border-[#343A42] bg-[#1B1F24]">
            <DiagnosticSidePanel
              component={activeComponent}
              components={components}
              sensors={sensors}
              alerts={alerts}
              timeRange={timeRange}
              onTimeRangeChange={onTimeRangeChange}
              onSelectComponent={onSelectComponent}
              onFocus3D={handleFocusComponent}
              onToggleIsolate3D={handleToggleIsolate}
              isIsolated={isolatedId === mapDashboardTo3DTwinId(activeComponent?.id)}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobile && panelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 h-[65vh] border-t border-[#343A42] bg-[#1B1F24] shadow-2xl rounded-t overflow-hidden">
          <DiagnosticSidePanel
            component={activeComponent}
            components={components}
            sensors={sensors}
            alerts={alerts}
            timeRange={timeRange}
            onTimeRangeChange={onTimeRangeChange}
            onSelectComponent={onSelectComponent}
            onFocus3D={handleFocusComponent}
            onToggleIsolate3D={handleToggleIsolate}
            isIsolated={isolatedId === mapDashboardTo3DTwinId(activeComponent?.id)}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default DigitalTwin;

import React, { useState, useEffect } from "react";
import {
  Activity,
  Sliders,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Thermometer,
  Gauge,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Database,
  ShieldCheck,
  RefreshCw,
  Info,
  Plus,
} from "lucide-react";
import { CalibrationService, INITIAL_CALIBRATION_STATE } from "../../services/CalibrationService.js";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { BaselineInputModal } from "./BaselineInputModal.jsx";

export function CalibrationView({ sensors = [], components = [] }) {
  const [calibState, setCalibState] = useState(INITIAL_CALIBRATION_STATE);
  const [loading, setLoading] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState("metric-acoustic");
  const [expandedMetricId, setExpandedMetricId] = useState("metric-acoustic");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API Interaction States
  const [recalibLoading, setRecalibLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    CalibrationService.getCalibrationState().then((state) => setCalibState(state));
  }, []);

  const handleExecuteRecalibration = async () => {
    setRecalibLoading(true);
    setStatusMessage(null);
    try {
      const res = await CalibrationService.executeRecalibration(
        calibState.environment,
        calibState.drivingState
      );
      setCalibState(res.updatedState);
      setStatusMessage({ type: "success", text: res.message });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Recalibration failed: " + err.message });
    } finally {
      setRecalibLoading(false);
    }
  };

  const handleZeroPointReset = async () => {
    setResetLoading(true);
    setStatusMessage(null);
    try {
      const res = await CalibrationService.zeroPointReset();
      setCalibState(res.updatedState);
      setStatusMessage({ type: "success", text: res.message });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Zero-point reset failed: " + err.message });
    } finally {
      setResetLoading(false);
    }
  };

  const activeMetric =
    calibState.baselines.find((b) => b.id === selectedMetricId) || calibState.baselines[0];

  const renderZScoreBadge = (zScore, status) => {
    const absZ = Math.abs(zScore).toFixed(2);
    let color = "#6EFA5F";
    let bg = "rgba(110, 250, 95, 0.12)";
    let border = "rgba(110, 250, 95, 0.35)";

    if (status === "warning") {
      color = "#FFA000";
      bg = "rgba(255, 160, 0, 0.12)";
      border = "rgba(255, 160, 0, 0.35)";
    } else if (status === "critical") {
      color = "#FF4B4B";
      bg = "rgba(255, 75, 75, 0.12)";
      border = "rgba(255, 75, 75, 0.35)";
    }

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] font-mono text-[10px] font-bold border select-none"
        style={{ color, backgroundColor: bg, borderColor: border }}
      >
        <span>{zScore >= 0 ? `+${absZ}σ` : `-${absZ}σ`}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-8 font-mono text-xs text-white bg-canvas select-none">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#3A3A3A]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#76B900] font-mono">
            AUTOMOTIVE SENSOR TELEMETRY & ADAPTATIONS
          </span>
          <h2 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2 mt-0.5 font-mono">
            <Sliders size={15} className="text-[#76B900]" />
            <span>SENSOR BASELINE CALIBRATION WORKSTATION</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* API Notification Status */}
          {statusMessage && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[11px] font-mono ${
                statusMessage.type === "success"
                  ? "bg-[#6EFA5F]/10 border-[#6EFA5F]/40 text-[#6EFA5F]"
                  : "bg-[#FF4B4B]/10 border-[#FF4B4B]/40 text-[#FF4B4B]"
              }`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Utility Button: Configure / Add Baseline Data */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#76B900] hover:bg-[#6da800] text-[#1A1A1A] font-semibold transition-all shadow-sm active:translate-y-px"
          >
            <Plus size={14} />
            <span>CONFIGURE SENSOR BASELINE</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: LIVE SURFACE & CONTEXT */}
      <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-4 space-y-3 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#3A3A3A]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-wider">
              ACTIVE CALIBRATION PROFILE:
            </span>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#1A1A1A] text-[#76B900] font-bold border border-[#76B900]/30">
              {calibState.activeProfile}
            </span>
          </div>
          <span className="text-[10px] text-[#7A7A7A]">
            LAST SYNCED: {calibState.context.lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A]">
            <span className="text-[9px] text-[#7A7A7A] uppercase block">TERRAIN ENVIRONMENT</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
              <Compass size={13} className="text-[#00BFFF]" />
              <select
                value={calibState.environment}
                onChange={(e) => setCalibState((p) => ({ ...p, environment: e.target.value }))}
                className="bg-transparent border-none text-white font-bold outline-none cursor-pointer text-xs"
              >
                <option value="ASPHALT" className="bg-[#1A1A1A] text-white">ASPHALT</option>
                <option value="GRAVEL" className="bg-[#1A1A1A] text-white">GRAVEL</option>
                <option value="OFF_ROAD" className="bg-[#1A1A1A] text-white">OFF_ROAD</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A]">
            <span className="text-[9px] text-[#7A7A7A] uppercase block">DRIVING STATE</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
              <Gauge size={13} className="text-[#76B900]" />
              <select
                value={calibState.drivingState}
                onChange={(e) => setCalibState((p) => ({ ...p, drivingState: e.target.value }))}
                className="bg-transparent border-none text-white font-bold outline-none cursor-pointer text-xs"
              >
                <option value="CITY_CRUISE" className="bg-[#1A1A1A] text-white">CITY_CRUISE</option>
                <option value="HIGHWAY" className="bg-[#1A1A1A] text-white">HIGHWAY</option>
                <option value="HIGH_LOAD" className="bg-[#1A1A1A] text-white">HIGH_LOAD</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A]">
            <span className="text-[9px] text-[#7A7A7A] uppercase block">AMBIENT TEMP</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
              <Thermometer size={13} className="text-[#FFA000]" />
              <span>{calibState.context.ambientTemp}</span>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A]">
            <span className="text-[9px] text-[#7A7A7A] uppercase block">VEHICLE SPEED</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
              <Activity size={13} className="text-[#6EFA5F]" />
              <span>{calibState.context.vehicleSpeed}</span>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A]">
            <span className="text-[9px] text-[#7A7A7A] uppercase block">TERRAIN ROUGHNESS</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
              <Layers size={13} className="text-[#00BFFF]" />
              <span>{calibState.context.terrainRoughness}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE: BASELINE TABLE & RECALIBRATION CONTROL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): BASELINE THRESHOLDS / Z-SCORE TABLE */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#3A3A3A]">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                  BASELINE THRESHOLDS & GAUSSIAN DISTRIBUTION (Z-SCORE)
                </h3>
                <p className="text-[10px] text-[#BDBDBD] font-mono mt-0.5">
                  Statistical evaluation against adaptive Gaussian reference baselines (μ ± σ)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#6EFA5F]">≤2σ Nominal</span>
                <span className="text-[#FFA000]">&gt;2σ Warning</span>
                <span className="text-[#FF4B4B]">&gt;3σ Critical</span>
              </div>
            </div>

            {/* Dense Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#3A3A3A] bg-[#222222] text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                    <th className="py-3 px-3">METRIC / SUBSYSTEM</th>
                    <th className="py-3 px-3">ORIGINAL (μ ± σ)</th>
                    <th className="py-3 px-3">ACTIVE BASELINE (μ ± σ)</th>
                    <th className="py-3 px-3">CURRENT VALUE</th>
                    <th className="py-3 px-3">Z-SCORE</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-1"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]">
                  {calibState.baselines.map((b) => {
                    const isSelected = selectedMetricId === b.id;
                    const isExpanded = expandedMetricId === b.id;

                    return (
                      <React.Fragment key={b.id}>
                        <tr
                          onClick={() => {
                            setSelectedMetricId(b.id);
                            setExpandedMetricId(isExpanded ? null : b.id);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-[#333333]" : "hover:bg-[#2F2F2F]"
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-white">{b.metric}</td>
                          <td className="py-3 px-3 text-[#BDBDBD]">
                            {b.originalMean} ± {b.originalStdDev} {b.unit}
                          </td>
                          <td className="py-3 px-3 text-white">
                            {b.activeMean} ± {b.activeStdDev} {b.unit}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            {b.currentValue} {b.unit}
                          </td>
                          <td className="py-3 px-3">{renderZScoreBadge(b.zScore, b.status)}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status={b.status} size="sm" />
                          </td>
                          <td className="py-3 px-1 text-right text-[#7A7A7A]">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                        </tr>

                        {/* Inline Expandable Details Row */}
                        {isExpanded && (
                          <tr className="bg-[#1E1E1E]">
                            <td colSpan={7} className="p-3.5 border-l-2 border-[#76B900]">
                              <div className="space-y-1.5 text-[11px] text-[#BDBDBD] font-mono">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <Info size={13} className="text-[#00BFFF]" />
                                  <span>DIAGNOSTIC ADAPTATION CONTEXT</span>
                                </p>
                                <p className="text-[#BDBDBD] leading-relaxed">{b.details}</p>
                                <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] text-[#7A7A7A] font-mono">
                                  <span>GAUSSIAN DIST: N({b.activeMean}, {b.activeStdDev}²)</span>
                                  <span>DELTA MEAN: {(b.activeMean - b.originalMean).toFixed(2)} {b.unit}</span>
                                  <span>DELTA STDDEV: {(b.activeStdDev - b.originalStdDev).toFixed(2)} {b.unit}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: BASELINE DRIFT CHART */}
          <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-4 space-y-3 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#3A3A3A]">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                  ADAPTIVE BASELINE DRIFT & THRESHOLD MOVEMENT
                </h3>
                <p className="text-[10px] text-[#BDBDBD] font-mono mt-0.5">
                  Tracking telemetry value, mean μ, upper (+3σ), and lower (-3σ) boundaries for:{" "}
                  <strong className="text-[#76B900] font-mono">{activeMetric.metric}</strong>
                </p>
              </div>

              {/* Metric Switcher Dropdown */}
              <select
                value={selectedMetricId}
                onChange={(e) => {
                  setSelectedMetricId(e.target.value);
                  setExpandedMetricId(e.target.value);
                }}
                className="bg-[#1A1A1A] text-[11px] font-mono text-white border border-[#3A3A3A] rounded-[6px] px-2.5 py-1 outline-none focus:border-[#76B900] cursor-pointer"
              >
                {calibState.baselines.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#1A1A1A] text-white">
                    {b.metric}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom SVG Drift Chart */}
            <div className="relative w-full h-[180px] bg-[#1A1A1A] rounded-[6px] border border-[#3A3A3A] p-3 overflow-hidden font-mono">
              <svg viewBox="0 0 600 160" className="w-full h-full">
                {/* Upper 3s boundary line (dotted red) */}
                <line x1="40" y1="25" x2="560" y2="25" stroke="#FF4B4B" strokeDasharray="3 3" strokeWidth="1.2" />
                <text x="565" y="28" fill="#FF4B4B" fontSize="9" fontFamily="monospace">+3σ</text>

                {/* Mean line (dashed green) */}
                <line x1="40" y1="80" x2="560" y2="80" stroke="#76B900" strokeDasharray="4 4" strokeWidth="1.2" />
                <text x="565" y="83" fill="#76B900" fontSize="9" fontFamily="monospace">Mean μ</text>

                {/* Lower 3s boundary line (dotted gray) */}
                <line x1="40" y1="135" x2="560" y2="135" stroke="#4A4A4A" strokeDasharray="3 3" strokeWidth="1.2" />
                <text x="565" y="138" fill="#7A7A7A" fontSize="9" fontFamily="monospace">-3σ</text>

                {/* Telemetry points & line */}
                {(() => {
                  const pts = activeMetric.history;
                  if (!pts || pts.length === 0) return null;
                  const vals = pts.map((p) => p.value);
                  const minV = Math.min(...vals, activeMetric.activeMean - activeMetric.activeStdDev * 3.5);
                  const maxV = Math.max(...vals, activeMetric.activeMean + activeMetric.activeStdDev * 3.5);
                  const rangeV = maxV - minV || 1;

                  const mappedPts = pts.map((p, i) => {
                    const x = 40 + (i / (pts.length - 1)) * 520;
                    const y = 140 - ((p.value - minV) / rangeV) * 110;
                    return { x, y, value: p.value, time: p.time };
                  });

                  const pathD = mappedPts.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ""
                  );

                  return (
                    <g>
                      <path d={pathD} fill="none" stroke="#00BFFF" strokeWidth="2" />
                      {mappedPts.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill={activeMetric.status === "critical" ? "#FF4B4B" : "#6EFA5F"}
                          stroke="#1A1A1A"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* Chart Legend Footer */}
              <div className="flex items-center justify-between text-[10px] text-[#7A7A7A] pt-1.5 border-t border-[#3A3A3A] font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#00BFFF]" />Current Telemetry</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#76B900] border-b border-dashed" />Active Mean (μ)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#FF4B4B]" />Threshold (+3σ)</span>
                </div>
                <span>SAMPLING WINDOW: 1-HOUR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): RECALIBRATION CONTROL & FALSE-POSITIVE SUPPRESSION */}
        <div className="space-y-4">
          {/* SECTION 3: RECALIBRATION CONTROL PANEL */}
          <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-4 space-y-3 font-mono shadow-card">
            <div className="pb-2.5 border-b border-[#3A3A3A]">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2 font-mono">
                <RefreshCw size={15} className="text-[#76B900]" />
                <span>RECALIBRATION CONTROLS</span>
              </h3>
              <p className="text-[10px] text-[#BDBDBD] mt-0.5">
                Seasonal and environmental baseline adaptation pipeline
              </p>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] space-y-1">
                <span className="text-[9px] text-[#7A7A7A] uppercase block">NEXT SCHEDULED RECALIBRATION</span>
                <p className="font-bold text-white">{calibState.recalibration.nextScheduled}</p>
                <p className="text-[10px] text-[#7A7A7A]">{calibState.recalibration.schedulePeriod}</p>
              </div>

              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] space-y-1">
                <span className="text-[9px] text-[#7A7A7A] uppercase block">LAST RECALIBRATED</span>
                <p className="font-mono text-[#76B900] font-semibold">{calibState.recalibration.lastRecalibrated}</p>
                <p className="text-[10px] text-[#7A7A7A]">Config: {calibState.recalibration.sourceConfig}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1 font-mono">
              <button
                onClick={handleExecuteRecalibration}
                disabled={recalibLoading || resetLoading}
                className={`flex items-center justify-center gap-2 w-full py-2 px-3.5 rounded-[6px] font-semibold text-xs border transition-all ${
                  recalibLoading
                    ? "bg-[#333333] text-[#7A7A7A] border-[#3A3A3A] cursor-not-allowed"
                    : "bg-[#76B900] text-[#1A1A1A] hover:bg-[#6da800] border-[#76B900] shadow-sm active:translate-y-px"
                }`}
              >
                {recalibLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                <span>{recalibLoading ? "RECALIBRATING..." : "EXECUTE RECALIBRATION"}</span>
              </button>

              <button
                onClick={handleZeroPointReset}
                disabled={recalibLoading || resetLoading}
                className={`flex items-center justify-center gap-2 w-full py-2 px-3.5 rounded-[6px] font-semibold text-xs border transition-all ${
                  resetLoading
                    ? "bg-[#1A1A1A] text-[#7A7A7A] border-[#3A3A3A] cursor-not-allowed"
                    : "bg-[#1A1A1A] text-[#BDBDBD] hover:text-white hover:bg-[#333333] border-[#4A4A4A]"
                }`}
              >
                {resetLoading ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                <span>{resetLoading ? "RESETTING..." : "ZERO-POINT RESET"}</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: FALSE-POSITIVE SUPPRESSION KPI SECTION */}
          <div className="rounded-[8px] border border-[#3A3A3A] bg-[#2A2A2A] p-4 space-y-3 font-mono shadow-card">
            <div className="pb-2.5 border-b border-[#3A3A3A]">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2 font-mono">
                <ShieldCheck size={15} className="text-[#6EFA5F]" />
                <span>FALSE-POSITIVE SUPPRESSION</span>
              </h3>
              <p className="text-[10px] text-[#BDBDBD] mt-0.5">
                Adaptive filtering efficacy & alarm suppression metrics
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#7A7A7A] uppercase block">TELEMETRY FRAMES EVALUATED</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {calibState.suppressionMetrics.framesEvaluated.toLocaleString()}
                  </span>
                </div>
                <Database size={16} className="text-[#00BFFF]" />
              </div>

              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#7A7A7A] uppercase block">RAW ANOMALIES AVOIDED</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {calibState.suppressionMetrics.rawAnomaliesAvoided.toLocaleString()}
                  </span>
                </div>
                <Layers size={16} className="text-[#76B900]" />
              </div>

              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#7A7A7A] uppercase block">FALSE ALARMS SUPPRESSED</span>
                  <span className="font-mono text-sm font-bold text-[#6EFA5F]">
                    {calibState.suppressionMetrics.falseAlarmsSuppressed}%
                  </span>
                </div>
                <ShieldCheck size={16} className="text-[#6EFA5F]" />
              </div>

              <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#7A7A7A] uppercase block">TRUE CRITICAL CONFIRMED</span>
                  <span className="font-mono text-sm font-bold text-[#FF4B4B]">
                    {calibState.suppressionMetrics.trueAnomaliesConfirmed} INCIDENTS
                  </span>
                </div>
                <AlertCircle size={16} className="text-[#FF4B4B]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operator Baseline Input Modal */}
      <BaselineInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sensors={sensors}
        components={components}
        currentEnvironment={calibState.environment}
        currentDrivingState={calibState.drivingState}
        onBaselineSubmitted={(newState) => {
          setCalibState(newState);
          setStatusMessage({ type: "success", text: "New baseline data submitted and recalibrated." });
        }}
      />
    </div>
  );
}

export default CalibrationView;

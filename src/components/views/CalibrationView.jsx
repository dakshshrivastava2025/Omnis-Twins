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
} from "lucide-react";
import { CalibrationService, INITIAL_CALIBRATION_STATE } from "../../services/CalibrationService.js";
import { TOKENS } from "../../theme/tokens.js";
import { StatusBadge } from "../ui/StatusBadge.jsx";

import { BaselineInputModal } from "./BaselineInputModal.jsx";
import { Plus } from "lucide-react";

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
      setCalibState(res.updatedState || prev);
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
    let color = "#3A9B72";
    let bg = "rgba(58, 155, 114, 0.12)";
    let border = "rgba(58, 155, 114, 0.3)";

    if (status === "warning") {
      color = "#C28A32";
      bg = "rgba(194, 138, 50, 0.12)";
      border = "rgba(194, 138, 50, 0.3)";
    } else if (status === "critical") {
      color = "#C94A4A";
      bg = "rgba(201, 74, 74, 0.12)";
      border = "rgba(201, 74, 74, 0.3)";
    }

    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border"
        style={{ color, backgroundColor: bg, borderColor: border }}
      >
        <span>{zScore >= 0 ? `+${absZ}σ` : `-${absZ}σ`}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#343A42]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#969DA6]">
            AUTOMOTIVE SENSOR TELEMETRY & ADAPTATIONS
          </span>
          <h2 className="text-sm font-bold text-[#E2E5E8] tracking-wider uppercase flex items-center gap-2">
            <Sliders size={16} className="text-[#8F969F]" />
            <span>SENSOR BASELINE CALIBRATION WORKSTATION</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* API Notification Status */}
          {statusMessage && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded border text-[11px] font-mono ${
                statusMessage.type === "success"
                  ? "bg-[#3A9B72]/10 border-[#3A9B72]/40 text-[#3A9B72]"
                  : "bg-[#C94A4A]/10 border-[#C94A4A]/40 text-[#C94A4A]"
              }`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Utility Button: Configure / Add Baseline Data */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2A3037] hover:bg-[#343A42] text-[#E2E5E8] font-bold border border-[#5C6470] transition-colors"
          >
            <Plus size={14} className="text-[#3A9B72]" />
            <span>CONFIGURE SENSOR BASELINE</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: LIVE SURFACE & CONTEXT */}
      <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#282E35]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#969DA6] uppercase tracking-wider">
              ACTIVE CALIBRATION PROFILE:
            </span>
            <span className="px-2 py-0.5 rounded bg-[#2A3037] text-[#E2E5E8] font-bold border border-[#343A42]">
              {calibState.activeProfile}
            </span>
          </div>
          <span className="text-[10px] text-[#69717B]">
            LAST SYNCED: {calibState.context.lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-0.5">
          <div className="p-2 rounded bg-[#22272D] border border-[#282E35]">
            <span className="text-[9px] text-[#69717B] uppercase block">TERRAIN ENVIRONMENT</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-[#E2E5E8]">
              <Compass size={13} className="text-[#8F969F]" />
              <select
                value={calibState.environment}
                onChange={(e) => setCalibState((p) => ({ ...p, environment: e.target.value }))}
                className="bg-transparent border-none text-[#E2E5E8] font-bold outline-none cursor-pointer text-xs"
              >
                <option value="ASPHALT" className="bg-[#1B1F24]">ASPHALT</option>
                <option value="GRAVEL" className="bg-[#1B1F24]">GRAVEL</option>
                <option value="OFF_ROAD" className="bg-[#1B1F24]">OFF_ROAD</option>
              </select>
            </div>
          </div>

          <div className="p-2 rounded bg-[#22272D] border border-[#282E35]">
            <span className="text-[9px] text-[#69717B] uppercase block">DRIVING STATE</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-[#E2E5E8]">
              <Gauge size={13} className="text-[#8F969F]" />
              <select
                value={calibState.drivingState}
                onChange={(e) => setCalibState((p) => ({ ...p, drivingState: e.target.value }))}
                className="bg-transparent border-none text-[#E2E5E8] font-bold outline-none cursor-pointer text-xs"
              >
                <option value="CITY_CRUISE" className="bg-[#1B1F24]">CITY_CRUISE</option>
                <option value="HIGHWAY" className="bg-[#1B1F24]">HIGHWAY</option>
                <option value="HIGH_LOAD" className="bg-[#1B1F24]">HIGH_LOAD</option>
              </select>
            </div>
          </div>

          <div className="p-2 rounded bg-[#22272D] border border-[#282E35]">
            <span className="text-[9px] text-[#69717B] uppercase block">AMBIENT TEMP</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-[#E2E5E8]">
              <Thermometer size={13} className="text-[#8F969F]" />
              <span>{calibState.context.ambientTemp}</span>
            </div>
          </div>

          <div className="p-2 rounded bg-[#22272D] border border-[#282E35]">
            <span className="text-[9px] text-[#69717B] uppercase block">VEHICLE SPEED</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-[#E2E5E8]">
              <Activity size={13} className="text-[#8F969F]" />
              <span>{calibState.context.vehicleSpeed}</span>
            </div>
          </div>

          <div className="p-2 rounded bg-[#22272D] border border-[#282E35]">
            <span className="text-[9px] text-[#69717B] uppercase block">TERRAIN ROUGHNESS</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-[#E2E5E8]">
              <Layers size={13} className="text-[#8F969F]" />
              <span>{calibState.context.terrainRoughness}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE: BASELINE TABLE & RECALIBRATION CONTROL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): BASELINE THRESHOLDS / Z-SCORE TABLE */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#282E35]">
              <div>
                <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider uppercase">
                  BASELINE THRESHOLDS & DISTRIBUTION (Z-SCORE EVALUATION)
                </h3>
                <p className="text-[10px] text-[#69717B]">
                  Statistical evaluation of current sensor telemetry against adaptive Gaussian baselines (μ ± σ)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-[#3A9B72]"><span className="w-1.5 h-1.5 rounded-full bg-[#3A9B72]" />≤2σ Nominal</span>
                <span className="flex items-center gap-1 text-[#C28A32]"><span className="w-1.5 h-1.5 rounded-full bg-[#C28A32]" />&gt;2σ Warning</span>
                <span className="flex items-center gap-1 text-[#C94A4A]"><span className="w-1.5 h-1.5 rounded-full bg-[#C94A4A]" />&gt;3σ Critical</span>
              </div>
            </div>

            {/* Dense Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#282E35] text-[10px] text-[#69717B] uppercase">
                    <th className="py-2 px-2">METRIC / SUBSYSTEM</th>
                    <th className="py-2 px-2">ORIGINAL (μ ± σ)</th>
                    <th className="py-2 px-2">ACTIVE BASELINE (μ ± σ)</th>
                    <th className="py-2 px-2">CURRENT VALUE</th>
                    <th className="py-2 px-2">Z-SCORE</th>
                    <th className="py-2 px-2">STATUS</th>
                    <th className="py-2 px-1"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282E35]">
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
                            isSelected ? "bg-[#22272D]" : "hover:bg-[#1E2228]"
                          }`}
                        >
                          <td className="py-2.5 px-2 font-bold text-[#E2E5E8]">{b.metric}</td>
                          <td className="py-2.5 px-2 text-[#969DA6]">
                            {b.originalMean} ± {b.originalStdDev} {b.unit}
                          </td>
                          <td className="py-2.5 px-2 text-[#E2E5E8]">
                            {b.activeMean} ± {b.activeStdDev} {b.unit}
                          </td>
                          <td className="py-2.5 px-2 font-bold text-[#E2E5E8]">
                            {b.currentValue} {b.unit}
                          </td>
                          <td className="py-2.5 px-2">{renderZScoreBadge(b.zScore, b.status)}</td>
                          <td className="py-2.5 px-2">
                            <StatusBadge status={b.status} size="sm" />
                          </td>
                          <td className="py-2.5 px-1 text-right text-[#69717B]">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                        </tr>

                        {/* Inline Expandable Details Row */}
                        {isExpanded && (
                          <tr className="bg-[#14171B]">
                            <td colSpan={7} className="p-3 border-l-2 border-[#5C6470]">
                              <div className="space-y-1.5 text-[11px] text-[#969DA6]">
                                <p className="font-bold text-[#E2E5E8] flex items-center gap-1.5">
                                  <Info size={13} className="text-[#8F969F]" />
                                  <span>STATISTICAL & RECALIBRATION DIAGNOSTIC DETAIL</span>
                                </p>
                                <p className="text-[#969DA6]">{b.details}</p>
                                <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] text-[#69717B] font-mono">
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
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#282E35]">
              <div>
                <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider uppercase">
                  ADAPTIVE BASELINE DRIFT & THRESHOLD MOVEMENT
                </h3>
                <p className="text-[10px] text-[#69717B]">
                  Tracking telemetry value, mean μ, upper (+3σ), and lower (-3σ) boundaries for:{" "}
                  <strong className="text-[#E2E5E8]">{activeMetric.metric}</strong>
                </p>
              </div>

              {/* Metric Switcher Dropdown */}
              <select
                value={selectedMetricId}
                onChange={(e) => {
                  setSelectedMetricId(e.target.value);
                  setExpandedMetricId(e.target.value);
                }}
                className="bg-[#22272D] text-[11px] font-mono text-[#E2E5E8] border border-[#343A42] rounded px-2 py-0.5 outline-none focus:border-[#5C6470]"
              >
                {calibState.baselines.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.metric}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom SVG Drift Chart */}
            <div className="relative w-full h-[180px] bg-[#14171B] rounded border border-[#282E35] p-2 overflow-hidden">
              <svg viewBox="0 0 600 160" className="w-full h-full">
                {/* Upper 3s boundary line (dotted red/amber) */}
                <line x1="40" y1="25" x2="560" y2="25" stroke="#C94A4A" strokeDasharray="3 3" strokeWidth="1.2" />
                <text x="565" y="28" fill="#C94A4A" fontSize="9" fontFamily="monospace">+3σ</text>

                {/* Mean line (dashed gray) */}
                <line x1="40" y1="80" x2="560" y2="80" stroke="#969DA6" strokeDasharray="4 4" strokeWidth="1.2" />
                <text x="565" y="83" fill="#969DA6" fontSize="9" fontFamily="monospace">Mean μ</text>

                {/* Lower 3s boundary line (dotted gray) */}
                <line x1="40" y1="135" x2="560" y2="135" stroke="#69717B" strokeDasharray="3 3" strokeWidth="1.2" />
                <text x="565" y="138" fill="#69717B" fontSize="9" fontFamily="monospace">-3σ</text>

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
                      <path d={pathD} fill="none" stroke="#E2E5E8" strokeWidth="2" />
                      {mappedPts.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill={activeMetric.status === "critical" ? "#C94A4A" : "#3A9B72"}
                          stroke="#14171B"
                          strokeWidth="1"
                        />
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* Chart Legend Footer */}
              <div className="flex items-center justify-between text-[10px] text-[#69717B] pt-1 border-t border-[#282E35]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#E2E5E8]" />Current Telemetry</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#969DA6] border-b border-dashed" strokeDasharray="2 2" />Active Mean (μ)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#C94A4A]" />Threshold (+3σ)</span>
                </div>
                <span>SAMPLING: 1-HOUR WINDOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): RECALIBRATION CONTROL & FALSE-POSITIVE SUPPRESSION */}
        <div className="space-y-4">
          {/* SECTION 3: SEASONAL RECALIBRATION CONTROL PANEL */}
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 space-y-3">
            <div className="pb-2 border-b border-[#282E35]">
              <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider uppercase flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#8F969F]" />
                <span>RECALIBRATION CONTROLS</span>
              </h3>
              <p className="text-[10px] text-[#69717B]">
                Seasonal and environmental baseline adjustment pipeline
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] space-y-1">
                <span className="text-[9px] text-[#69717B] uppercase block">NEXT SCHEDULED RECALIBRATION</span>
                <p className="font-bold text-[#E2E5E8]">{calibState.recalibration.nextScheduled}</p>
                <p className="text-[10px] text-[#969DA6]">{calibState.recalibration.schedulePeriod}</p>
              </div>

              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] space-y-1">
                <span className="text-[9px] text-[#69717B] uppercase block">LAST RECALIBRATED</span>
                <p className="font-mono text-[#E2E5E8]">{calibState.recalibration.lastRecalibrated}</p>
                <p className="text-[10px] text-[#969DA6]">Config: {calibState.recalibration.sourceConfig}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleExecuteRecalibration}
                disabled={recalibLoading || resetLoading}
                className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded font-bold border transition-colors ${
                  recalibLoading
                    ? "bg-[#2A3037] text-[#969DA6] border-[#343A42] cursor-not-allowed"
                    : "bg-[#2A3037] text-[#E2E5E8] hover:bg-[#343A42] border-[#5C6470]"
                }`}
              >
                {recalibLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                <span>{recalibLoading ? "RECALIBRATING..." : "EXECUTE RECALIBRATION"}</span>
              </button>

              <button
                onClick={handleZeroPointReset}
                disabled={recalibLoading || resetLoading}
                className={`flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded font-bold border transition-colors text-[11px] ${
                  resetLoading
                    ? "bg-[#22272D] text-[#969DA6] border-[#282E35] cursor-not-allowed"
                    : "bg-[#22272D] text-[#969DA6] hover:text-[#E2E5E8] hover:bg-[#282E35] border-[#343A42]"
                }`}
              >
                {resetLoading ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                <span>{resetLoading ? "RESETTING..." : "ZERO-POINT RESET"}</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: FALSE-POSITIVE SUPPRESSION KPI SECTION */}
          <div className="rounded border border-[#343A42] bg-[#1B1F24] p-3 space-y-3">
            <div className="pb-2 border-b border-[#282E35]">
              <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#3A9B72]" />
                <span>FALSE-POSITIVE SUPPRESSION</span>
              </h3>
              <p className="text-[10px] text-[#69717B]">
                Adaptive filtering efficacy & false alarm reduction metrics
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#69717B] uppercase block">TELEMETRY FRAMES EVALUATED</span>
                  <span className="font-mono text-sm font-bold text-[#E2E5E8]">
                    {calibState.suppressionMetrics.framesEvaluated.toLocaleString()}
                  </span>
                </div>
                <Database size={16} className="text-[#8F969F]" />
              </div>

              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#69717B] uppercase block">RAW ANOMALIES AVOIDED</span>
                  <span className="font-mono text-sm font-bold text-[#E2E5E8]">
                    {calibState.suppressionMetrics.rawAnomaliesAvoided.toLocaleString()}
                  </span>
                </div>
                <Layers size={16} className="text-[#8F969F]" />
              </div>

              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#69717B] uppercase block">FALSE ALARMS SUPPRESSED</span>
                  <span className="font-mono text-sm font-bold text-[#3A9B72]">
                    {calibState.suppressionMetrics.falseAlarmsSuppressed}%
                  </span>
                </div>
                <ShieldCheck size={16} className="text-[#3A9B72]" />
              </div>

              <div className="p-2 rounded bg-[#22272D] border border-[#282E35] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#69717B] uppercase block">TRUE CRITICAL CONFIRMED</span>
                  <span className="font-mono text-sm font-bold text-[#C94A4A]">
                    {calibState.suppressionMetrics.trueAnomaliesConfirmed} INCIDENTS
                  </span>
                </div>
                <AlertCircle size={16} className="text-[#C94A4A]" />
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

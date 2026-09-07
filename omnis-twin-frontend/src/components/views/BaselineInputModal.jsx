import React, { useState } from "react";
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Database, RefreshCw, Sliders } from "lucide-react";
import { CalibrationService } from "../../services/CalibrationService.js";

export function BaselineInputModal({
  isOpen,
  onClose,
  sensors = [],
  components = [],
  currentEnvironment = "ASPHALT",
  currentDrivingState = "CITY_CRUISE",
  onBaselineSubmitted,
}) {
  if (!isOpen) return null;

  const defaultSensor = sensors[0] || { id: "sensor-vib-fl", name: "High-G Accelerometer #FL", componentId: "brakes", type: "Vibration", unit: "g RMS" };
  const defaultComp = components.find((c) => c.id === defaultSensor.componentId) || components[0] || { id: "brakes", name: "Front Left Brake" };

  const [selectedSensorId, setSelectedSensorId] = useState(defaultSensor.id);
  const [selectedComponentId, setSelectedComponentId] = useState(defaultComp.id);
  const [environment, setEnvironment] = useState(currentEnvironment);
  const [drivingState, setDrivingState] = useState(currentDrivingState);
  const [unit, setUnit] = useState(defaultSensor.unit || "g RMS");

  // Sample observations list
  const [samples, setSamples] = useState(["1.2", "1.4", "1.3", "1.5", "1.1"]);
  const [bulkInput, setBulkInput] = useState("");
  const [useBulkInput, setUseBulkInput] = useState(false);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSensorChange = (sensorId) => {
    setSelectedSensorId(sensorId);
    const matchedSensor = sensors.find((s) => s.id === sensorId);
    if (matchedSensor) {
      if (matchedSensor.unit) setUnit(matchedSensor.unit);
      if (matchedSensor.componentId) setSelectedComponentId(matchedSensor.componentId);
    }
  };

  const handleAddSample = () => {
    setSamples([...samples, ""]);
  };

  const handleRemoveSample = (idx) => {
    setSamples(samples.filter((_, i) => i !== idx));
  };

  const handleSampleChange = (idx, val) => {
    const updated = [...samples];
    updated[idx] = val;
    setSamples(updated);
  };

  const handleClearSamples = () => {
    setSamples([]);
    setBulkInput("");
  };

  const handleApplyBulkInput = () => {
    const parsed = bulkInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s !== "" && !isNaN(Number(s)));
    if (parsed.length > 0) {
      setSamples(parsed);
      setUseBulkInput(false);
      setErrorMsg(null);
    } else {
      setErrorMsg("Validation Error: Please provide valid numeric observations.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate inputs
    let sampleList = samples;
    if (useBulkInput && bulkInput) {
      sampleList = bulkInput.split(/[\s,]+/).map((s) => s.trim()).filter((s) => s !== "");
    }

    const validNumbers = sampleList.map((s) => Number(s)).filter((n) => !isNaN(n));
    if (validNumbers.length === 0) {
      setErrorMsg("Validation Error: Please provide at least one valid numeric reference observation.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sensorId: selectedSensorId,
        componentId: selectedComponentId,
        environment,
        drivingState,
        unit,
        samples: validNumbers,
      };

      const result = await CalibrationService.submitBaselineData(payload);
      setSuccessMsg(result.message);
      if (onBaselineSubmitted) {
        onBaselineSubmitted(result.updatedState);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to persist baseline calibration data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none font-mono text-xs text-white">
      <div className="w-full max-w-lg rounded-[8px] border border-[#4A4A4A] bg-[#2A2A2A] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A3A3A] bg-[#222222]">
          <div className="flex items-center gap-2.5">
            <Sliders size={16} className="text-[#76B900]" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">
              CONFIGURE SENSOR NORMAL BASELINE DATA
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-[6px] text-[#BDBDBD] hover:text-white hover:bg-[#333333] transition-colors"
            title="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Informational Guidance Box */}
          <div className="p-3 rounded-[6px] bg-[#1A1A1A] border border-[#3A3A3A] text-[11px] text-[#BDBDBD] space-y-1.5">
            <p className="font-bold text-white flex items-center gap-2">
              <Database size={13} className="text-[#6EFA5F]" />
              <span>REFERENCE NORMAL DATA COLLECTION</span>
            </p>
            <p className="text-[10px] leading-relaxed text-[#7A7A7A]">
              Enter normal sensor observations under known environmental conditions. The engine recalculates mean (μ) and standard deviation (σ) to establish authoritative Gaussian baseline parameters.
            </p>
          </div>

          {/* Inline Validation Error / Success Messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-[6px] bg-[#FF4B4B]/10 border border-[#FF4B4B]/40 text-[#FF4B4B] text-[11px] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-[6px] bg-[#6EFA5F]/10 border border-[#6EFA5F]/40 text-[#6EFA5F] text-[11px] flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields: Sensor, Component, Context */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#7A7A7A] block font-bold">TARGET SENSOR</label>
              <select
                value={selectedSensorId}
                onChange={(e) => handleSensorChange(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-3 py-2 text-xs text-white outline-none font-mono"
              >
                {sensors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#7A7A7A] block font-bold">COMPONENT</label>
              <select
                value={selectedComponentId}
                onChange={(e) => setSelectedComponentId(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-3 py-2 text-xs text-white outline-none font-mono"
              >
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#7A7A7A] block font-bold">TERRAIN ENVIRONMENT</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-3 py-2 text-xs text-white outline-none font-mono"
              >
                <option value="ASPHALT">ASPHALT (Standard Road)</option>
                <option value="GRAVEL">GRAVEL (Unpaved Surface)</option>
                <option value="OFF_ROAD">OFF_ROAD (Dynamic Severe)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#7A7A7A] block font-bold">DRIVING STATE</label>
              <select
                value={drivingState}
                onChange={(e) => setDrivingState(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-3 py-2 text-xs text-white outline-none font-mono"
              >
                <option value="CITY_CRUISE">CITY_CRUISE</option>
                <option value="HIGHWAY">HIGHWAY</option>
                <option value="HIGH_LOAD">HIGH_LOAD</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-[#7A7A7A] block font-bold">MEASUREMENT UNIT</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={submitting}
              placeholder="e.g. dB, g RMS, °C, Hz"
              className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-3 py-2 text-xs text-white outline-none font-mono"
            />
          </div>

          {/* SAMPLES ENTRY SECTION */}
          <div className="space-y-2.5 pt-3 border-t border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-white font-bold tracking-wide">
                NORMAL SENSOR OBSERVATIONS
              </label>
              <div className="flex items-center gap-3 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseBulkInput(!useBulkInput)}
                  className="text-[#76B900] hover:underline"
                >
                  {useBulkInput ? "Individual Inputs" : "Bulk Paste"}
                </button>
                <button
                  type="button"
                  onClick={handleClearSamples}
                  className="text-[#7A7A7A] hover:text-[#FF4B4B]"
                >
                  Clear All
                </button>
              </div>
            </div>

            {useBulkInput ? (
              <div className="space-y-2">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste comma or space-separated numbers: e.g. 1.2, 1.4, 1.3, 1.5, 1.1"
                  rows={3}
                  disabled={submitting}
                  className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] p-2.5 text-white outline-none text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkInput}
                  className="px-3 py-1.5 rounded-[6px] bg-[#333333] hover:bg-[#444444] text-white border border-[#4A4A4A] font-semibold text-xs"
                >
                  Parse Bulk Observations
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                  {samples.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#7A7A7A] w-5">#{idx + 1}</span>
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleSampleChange(idx, e.target.value)}
                        disabled={submitting}
                        placeholder="Value"
                        className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-[6px] px-2.5 py-1 text-xs text-white outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSample(idx)}
                        disabled={submitting}
                        className="text-[#7A7A7A] hover:text-[#FF4B4B] p-1"
                        title="Remove sample"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddSample}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1A1A1A] text-white hover:bg-[#333333] border border-[#4A4A4A] font-semibold text-[11px]"
                >
                  <Plus size={13} className="text-[#76B900]" />
                  <span>Add Observation Row</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#3A3A3A]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-2 rounded-[6px] bg-[#1A1A1A] text-[#BDBDBD] hover:text-white hover:bg-[#333333] border border-[#4A4A4A] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] font-semibold border transition-all ${
                submitting
                  ? "bg-[#333333] text-[#7A7A7A] border-[#3A3A3A] cursor-not-allowed"
                  : "bg-[#76B900] text-[#1A1A1A] hover:bg-[#6da800] border-[#76B900] shadow-sm active:translate-y-px"
              }`}
            >
              {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>{submitting ? "SUBMITTING TO BACKEND..." : "SUBMIT BASELINE DATA"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

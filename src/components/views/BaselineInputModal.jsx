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
      setErrorMsg("No valid numbers found in bulk input text.");
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
      setErrorMsg("Validation Error: Please provide at least one valid numeric reference sample.");
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
      setErrorMsg(err.message || "Unable to save baseline data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none font-mono text-xs">
      <div className="w-full max-w-lg rounded border border-[#343A42] bg-[#1B1F24] text-[#E2E5E8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#343A42] bg-[#14171B]">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#8F969F]" />
            <h3 className="text-xs font-bold text-[#E2E5E8] tracking-wider uppercase">
              CONFIGURE SENSOR NORMAL BASELINE DATA
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded text-[#8F969F] hover:text-white hover:bg-[#22272D] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Informational Guidance Box */}
          <div className="p-2.5 rounded bg-[#22272D] border border-[#282E35] text-[11px] text-[#969DA6] space-y-1">
            <p className="font-bold text-[#E2E5E8] flex items-center gap-1.5">
              <Database size={13} className="text-[#3A9B72]" />
              <span>REFERENCE NORMAL DATA COLLECTION</span>
            </p>
            <p className="text-[10px]">
              Enter normal/nominal sensor observations under known environmental conditions. The backend will calculate mean (μ) and standard deviation (σ) to form the authoritative Gaussian baseline.
            </p>
          </div>

          {/* Inline Validation Error / Success Messages */}
          {errorMsg && (
            <div className="p-2 rounded bg-[#C94A4A]/10 border border-[#C94A4A]/40 text-[#C94A4A] text-[11px] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2 rounded bg-[#3A9B72]/10 border border-[#3A9B72]/40 text-[#3A9B72] text-[11px] flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields: Sensor, Component, Context */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#69717B] block font-bold">TARGET SENSOR</label>
              <select
                value={selectedSensorId}
                onChange={(e) => handleSensorChange(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-1 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
              >
                {sensors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#69717B] block font-bold">COMPONENT</label>
              <select
                value={selectedComponentId}
                onChange={(e) => setSelectedComponentId(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-1 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
              >
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#69717B] block font-bold">TERRAIN PROFILE</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-1 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
              >
                <option value="ASPHALT">ASPHALT</option>
                <option value="GRAVEL">GRAVEL</option>
                <option value="OFF_ROAD">OFF_ROAD</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#69717B] block font-bold">DRIVING STATE</label>
              <select
                value={drivingState}
                onChange={(e) => setDrivingState(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-1 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
              >
                <option value="CITY_CRUISE">CITY_CRUISE</option>
                <option value="HIGHWAY">HIGHWAY</option>
                <option value="HIGH_LOAD">HIGH_LOAD</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#69717B] block font-bold">MEASUREMENT UNIT</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={submitting}
              placeholder="e.g. dB, g RMS, °C, Hz"
              className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-1 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
            />
          </div>

          {/* SAMPLES ENTRY SECTION */}
          <div className="space-y-2 pt-2 border-t border-[#282E35]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-[#E2E5E8] font-bold">
                NORMAL SENSOR SAMPLES (REFERENCE OBSERVATIONS)
              </label>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseBulkInput(!useBulkInput)}
                  className="text-[#969DA6] hover:text-[#E2E5E8] underline"
                >
                  {useBulkInput ? "Individual Inputs" : "Bulk Paste"}
                </button>
                <button
                  type="button"
                  onClick={handleClearSamples}
                  className="text-[#69717B] hover:text-[#C94A4A]"
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
                  placeholder="Paste comma/space-separated numbers e.g. 1.2, 1.4, 1.3, 1.5, 1.1"
                  rows={3}
                  disabled={submitting}
                  className="w-full bg-[#14171B] border border-[#343A42] rounded p-2 text-[#E2E5E8] outline-none focus:border-[#5C6470] text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkInput}
                  className="px-2.5 py-1 rounded bg-[#282E35] text-[#E2E5E8] hover:bg-[#343A42] border border-[#343A42] font-bold"
                >
                  Parse Bulk Samples
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                  {samples.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-[9px] text-[#69717B] w-4">#{idx + 1}</span>
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleSampleChange(idx, e.target.value)}
                        disabled={submitting}
                        placeholder="Value"
                        className="w-full bg-[#14171B] border border-[#343A42] rounded px-2 py-0.5 text-[#E2E5E8] outline-none focus:border-[#5C6470]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSample(idx)}
                        disabled={submitting}
                        className="text-[#69717B] hover:text-[#C94A4A] p-0.5"
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#22272D] text-[#969DA6] hover:text-[#E2E5E8] hover:bg-[#282E35] border border-[#343A42] font-bold text-[11px]"
                >
                  <Plus size={13} />
                  <span>Add Sample Row</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#343A42]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded bg-[#22272D] text-[#969DA6] hover:text-[#E2E5E8] border border-[#343A42] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-bold border transition-colors ${
                submitting
                  ? "bg-[#2A3037] text-[#969DA6] border-[#343A42] cursor-not-allowed"
                  : "bg-[#2A3037] text-[#E2E5E8] hover:bg-[#343A42] border-[#5C6470]"
              }`}
            >
              {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>{submitting ? "SUBMITTING TO BACKEND..." : "SUBMIT BASELINE DATA"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

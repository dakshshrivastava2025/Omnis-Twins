import React from "react";
import { Settings, Sliders } from "lucide-react";

export function SettingsView() {
  return (
    <div className="space-y-4 pb-6 font-sans text-xs select-none">
      <div className="border-b border-[#2D333B] pb-2">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-100 flex items-center gap-1.5">
          <Settings size={15} className="text-sky-400" />
          <span>DIAGNOSTIC & TELEMETRY PARAMETERS</span>
        </h2>
        <p className="text-[11px] font-mono text-gray-500">Configure alert thresholds, sampling rates, and ML confidence tolerances</p>
      </div>

      <div className="rounded border border-[#2D333B] bg-[#171B21] p-4 space-y-4 font-mono">
        <div>
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <Sliders size={14} className="text-sky-400" />
            <span>Threshold Preferences</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5">
              <div>
                <p className="text-xs font-bold text-gray-200 font-sans">Critical Alert Confidence Threshold</p>
                <p className="text-[10px] text-gray-500">Only dispatch critical alerts when ML model confidence exceeds threshold</p>
              </div>
              <span className="font-mono text-xs text-sky-400 font-bold bg-[#121417] px-2 py-0.5 rounded border border-[#21262D]">85%</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5">
              <div>
                <p className="text-xs font-bold text-gray-200 font-sans">Audio Telemetry Sampling Rate</p>
                <p className="text-[10px] text-gray-500">Continuous acoustic microphone sampling rate for friction detection</p>
              </div>
              <span className="font-mono text-xs text-sky-400 font-bold bg-[#121417] px-2 py-0.5 rounded border border-[#21262D]">44.1 kHz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

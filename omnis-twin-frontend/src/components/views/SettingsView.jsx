import React from "react";
import { Settings, Sliders } from "lucide-react";

export function SettingsView() {
  return (
    <div className="space-y-6 pb-8 font-sans select-none text-[#F0F0F0] bg-canvas">
      <div className="border-b border-[#222222] pb-3 animate-fade-in-up">
        <h2 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2">
          <Settings size={16} className="text-[#C9547A]" /><span>Diagnostic & Telemetry Parameters</span>
        </h2>
        <p className="text-[12px] text-[#B0B0B0] mt-0.5">Configure alert thresholds, sampling rates, and ML inference tolerances</p>
      </div>
      <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 space-y-4 shadow-card-dark animate-fade-in-up stagger-2">
        <h3 className="text-[13px] font-semibold text-[#F0F0F0] flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Sliders size={14} className="text-[#E091A8]" /><span>Threshold & Frequency Configuration</span>
        </h3>
        <div className="space-y-0">
          <div className="flex items-center justify-between border-b border-[#222222] py-4 first:pt-0">
            <div>
              <p className="text-[13px] font-semibold text-[#F0F0F0]">Critical Alert Confidence Threshold</p>
              <p className="text-[11px] text-[#555555]">Only dispatch critical alerts when ML confidence exceeds threshold</p>
            </div>
            <span className="font-mono text-xs text-[#C9547A] font-bold bg-[#C9547A]/10 px-3 py-1.5 rounded-full border border-[#C9547A]/20">85%</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#222222] py-4">
            <div>
              <p className="text-[13px] font-semibold text-[#F0F0F0]">Audio Telemetry Sampling Rate</p>
              <p className="text-[11px] text-[#555555]">Continuous acoustic microphone sampling for friction detection</p>
            </div>
            <span className="font-mono text-xs text-[#E091A8] font-bold bg-[#E091A8]/10 px-3 py-1.5 rounded-full border border-[#E091A8]/20">44.1 kHz</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#222222] py-4">
            <div>
              <p className="text-[13px] font-semibold text-[#F0F0F0]">Vibration FFT Window Size</p>
              <p className="text-[11px] text-[#555555]">High-G accelerometer sample count per Fourier transform slice</p>
            </div>
            <span className="font-mono text-xs text-[#F0F0F0] font-bold bg-[#252525] px-3 py-1.5 rounded-full border border-[#333333]">1024</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13px] font-semibold text-[#F0F0F0]">Stream Ingestion Interval</p>
              <p className="text-[11px] text-[#555555]">Live vehicle polling and state synchronization cycle</p>
            </div>
            <span className="font-mono text-xs text-[#5CB88A] font-bold bg-[#5CB88A]/10 px-3 py-1.5 rounded-full border border-[#5CB88A]/20">100 ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

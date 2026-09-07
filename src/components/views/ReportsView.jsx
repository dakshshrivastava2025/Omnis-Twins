import React from "react";
import { FileText, Download } from "lucide-react";

export function ReportsView() {
  return (
    <div className="space-y-4 pb-6 font-sans text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#343A42] pb-2">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#E2E5E8] flex items-center gap-1.5">
            <FileText size={15} className="text-[#8F969F]" />
            <span>DIAGNOSTIC SUMMARY REPORTS</span>
          </h2>
          <p className="text-[11px] font-mono text-[#69717B]">Automated automotive health audit reports & maintenance logs</p>
        </div>
        <button className="flex items-center gap-1.5 rounded bg-[#E2E5E8] hover:bg-[#FFFFFF] text-[#14171B] px-3 py-1.5 font-mono text-xs font-bold transition-colors">
          <Download size={13} />
          <span>EXPORT PDF REPORT</span>
        </button>
      </div>

      <div className="rounded border border-[#343A42] bg-[#1B1F24] p-4 space-y-3 font-mono">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#8F969F]" />
          <div>
            <h3 className="text-xs font-bold text-[#E2E5E8]">Full Vehicle Diagnostic Audit #2026-09-07</h3>
            <p className="text-[10px] text-[#69717B]">Generated Today at 12:00 PM • Audio, Thermal & Vibration Synthesis</p>
          </div>
        </div>

        <div className="rounded border border-[#343A42] p-3 bg-[#14171B] space-y-1 text-xs text-[#969DA6] font-sans">
          <p className="font-bold text-[#E2E5E8] font-mono text-[11px] uppercase">Executive Health Summary:</p>
          <p>
            Overall vehicle health index is evaluated at <strong className="text-[#C28A32]">74% (Attention Required)</strong>. The primary driver of vehicle degradation is the <strong className="text-[#C94A4A]">Front Left Brake Assembly (35% Health)</strong> due to acoustic squeal peaks and pad wear below 2.5mm minimum threshold.
          </p>
        </div>
      </div>
    </div>
  );
}

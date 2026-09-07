import React from "react";
import { FileText, Download } from "lucide-react";

export function ReportsView() {
  return (
    <div className="space-y-6 pb-8 font-sans select-none text-[#F0F0F0] bg-canvas">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3 animate-fade-in-up">
        <div>
          <h2 className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2">
            <FileText size={16} className="text-[#C9547A]" /><span>Diagnostic Reports</span>
          </h2>
          <p className="text-[12px] text-[#B0B0B0] mt-0.5">Automated health audit reports and maintenance logs</p>
        </div>
        <button className="flex items-center gap-2 rounded-[8px] bg-[#C9547A] hover:bg-[#B54A6C] text-white px-4 py-2 text-[13px] font-semibold transition-all duration-200 shadow-sm active:translate-y-px">
          <Download size={14} /><span>Export PDF</span>
        </button>
      </div>
      <div className="rounded-[12px] border border-[#222222] bg-[#1A1A1A] p-5 space-y-4 shadow-card-dark animate-fade-in-up stagger-2">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-[12px] bg-gradient-to-br from-[#C9547A] to-[#E091A8] flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[#F0F0F0]">Full Vehicle Diagnostic Audit #2026-09-07</h3>
            <p className="text-[11px] text-[#555555]">Generated Today at 12:00 PM</p>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#222222] p-4 bg-[#111111] space-y-2 text-[13px] text-[#B0B0B0]">
          <p className="font-semibold text-[#F0F0F0] text-[11px] uppercase tracking-wider">Executive Summary</p>
          <p className="leading-relaxed">
            Overall vehicle health is evaluated at <strong className="text-[#D4915C]">74% (Attention Required)</strong>. The primary driver of degradation is the <strong className="text-[#E5466B]">Front Left Brake Assembly (35% Health)</strong> due to acoustic friction squeal peaks and pad wear below the 2.5mm minimum threshold.
          </p>
        </div>
      </div>
    </div>
  );
}

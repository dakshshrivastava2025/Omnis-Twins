import React from "react";
import { STATUS_META } from "../../twin/renderer/Materials.js";

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.healthy;
  const Icon = meta.Icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: meta.color + "1F", color: meta.color }}
    >
      <Icon size={13} strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}

import React from "react";
import { STATUS_LOOKUP } from "../../theme/tokens.js";

export function StatusBadge({ status = "healthy", showIcon = false, size = "md" }) {
  const meta = STATUS_LOOKUP[status] || STATUS_LOOKUP.healthy;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-[11px]",
    lg: "px-2.5 py-1 text-xs",
  }[size] || "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider uppercase rounded ${sizeClasses} border`}
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      {meta.label}
    </span>
  );
}

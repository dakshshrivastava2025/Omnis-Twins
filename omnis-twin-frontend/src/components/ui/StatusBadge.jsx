import React from "react";
import { STATUS_LOOKUP } from "../../theme/tokens.js";

export function StatusBadge({ status = "healthy", showDot = true, size = "md" }) {
  const meta = STATUS_LOOKUP[status] || STATUS_LOOKUP.healthy;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-[11px]",
    lg: "px-3 py-1 text-xs",
  }[size] || "px-2.5 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-semibold tracking-wide rounded-full ${sizeClasses} border select-none transition-colors duration-200`}
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      <span>{meta.label}</span>
    </span>
  );
}

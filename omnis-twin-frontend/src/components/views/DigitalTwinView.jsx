import React from "react";
import DigitalTwin from "../digital-twin/DigitalTwin.jsx";

export function DigitalTwinView({
  vehicle,
  components,
  sensors,
  alerts,
  selectedComponentId,
  onSelectComponent,
  timeRange,
  onTimeRangeChange,
}) {
  return (
    <div className="h-full w-full rounded-[12px] overflow-hidden border border-[#222222] bg-[#0D0D0D] font-sans shadow-card-dark">
      <DigitalTwin
        vehicle={vehicle}
        components={components}
        sensors={sensors}
        alerts={alerts}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
      />
    </div>
  );
}

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
    <div className="h-full w-full rounded overflow-hidden border border-[#343A42] bg-[#14171B]">
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

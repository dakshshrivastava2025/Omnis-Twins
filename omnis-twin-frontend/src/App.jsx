import React, { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Header } from "./components/layout/Header.jsx";
import { OverviewView } from "./components/views/OverviewView.jsx";
import { DigitalTwinView } from "./components/views/DigitalTwinView.jsx";
import { ComponentsView } from "./components/views/ComponentsView.jsx";
import { SensorsView } from "./components/views/SensorsView.jsx";
import { AlertsView } from "./components/views/AlertsView.jsx";
import { HistoryView } from "./components/views/HistoryView.jsx";
import { ReportsView } from "./components/views/ReportsView.jsx";
import { SettingsView } from "./components/views/SettingsView.jsx";
import { CalibrationView } from "./components/views/CalibrationView.jsx";
import {
  INITIAL_VEHICLE,
  INITIAL_COMPONENTS,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
} from "./data/vehicleData.js";

export function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24H");
  const [selectedComponentId, setSelectedComponentId] = useState("brakes");

  const activeAlertsCount = INITIAL_ALERTS.length;

  const handleSelectComponent = (comp) => {
    const compId = typeof comp === "string" ? comp : comp?.id;
    setSelectedComponentId(compId);
    setActiveTab("twin");
  };

  const handleSelectAlert = (alert) => {
    if (alert?.componentId) {
      setSelectedComponentId(alert.componentId);
      setActiveTab("twin");
    }
  };

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-screen overflow-hidden text-branco bg-canvas font-sans antialiased select-none">
      {/* Persistent Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} alertsCount={activeAlertsCount} />

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-canvas">
        {/* Persistent Top Header */}
        <Header
          vehicle={INITIAL_VEHICLE}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0 bg-canvas">
          {activeTab === "overview" && (
            <OverviewView
              vehicle={INITIAL_VEHICLE}
              components={INITIAL_COMPONENTS}
              alerts={INITIAL_ALERTS}
              sensors={INITIAL_SENSORS}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onSelectComponent={handleSelectComponent}
              onSelectAlert={handleSelectAlert}
              onNavigateToTwin={() => setActiveTab("twin")}
            />
          )}

          {activeTab === "twin" && (
            <DigitalTwinView
              vehicle={INITIAL_VEHICLE}
              components={INITIAL_COMPONENTS}
              sensors={INITIAL_SENSORS}
              alerts={INITIAL_ALERTS}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(c) => setSelectedComponentId(typeof c === "string" ? c : c.id)}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}

          {activeTab === "components" && (
            <ComponentsView
              components={INITIAL_COMPONENTS}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponent}
              onNavigateToTwin={() => setActiveTab("twin")}
            />
          )}

          {activeTab === "sensors" && (
            <SensorsView
              sensors={INITIAL_SENSORS}
              onSelectSensor={(sensor) => handleSelectComponent(sensor.componentId)}
            />
          )}

          {activeTab === "alerts" && (
            <AlertsView
              alerts={INITIAL_ALERTS}
              onSelectAlert={handleSelectAlert}
              onSelectComponent={handleSelectComponent}
            />
          )}

          {activeTab === "calibration" && (
            <CalibrationView sensors={INITIAL_SENSORS} components={INITIAL_COMPONENTS} />
          )}

          {activeTab === "history" && <HistoryView />}

          {activeTab === "reports" && <ReportsView />}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;

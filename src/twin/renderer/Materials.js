import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export const COLOR = {
  bg: "#14171B",
  panel: "#1B1F24",
  panelRaised: "#22272D",
  border: "#343A42",
  textPrimary: "#E2E5E8",
  textSecondary: "#969DA6",
  textMuted: "#69717B",
  neutralMesh: "#343A42",
  bodyMesh: "#404650",
  glassMesh: "#22272D",
  wheelMesh: "#14171B",
  ground: "#FFFFFF",
  accentSelected: "#E2E5E8",
  healthy: "#3A9B72",
  warning: "#C28A32",
  critical: "#C94A4A",
};

export const STATUS_META = {
  healthy: { label: "Healthy", color: COLOR.healthy, Icon: CheckCircle2 },
  warning: { label: "Warning", color: COLOR.warning, Icon: AlertTriangle },
  critical: { label: "Critical", color: COLOR.critical, Icon: AlertCircle },
};

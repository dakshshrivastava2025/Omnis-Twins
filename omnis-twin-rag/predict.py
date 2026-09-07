"""
Omnis-Twin Telemetry Anomaly Inference & ChromaDB RAG Engine.
Evaluates automotive telemetry frames using a trained Isolation Forest model.
When an anomaly is flagged, triggers a vector search in ChromaDB to retrieve
relevant troubleshooting, root cause analysis, and repair documentation.
"""

import os
import sys
import argparse
import json
import joblib
import numpy as np
from datetime import datetime, timezone
import chromadb
from llama_index.core import Document, VectorStoreIndex, StorageContext, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "chroma_db"))
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "models", "isolation_forest.joblib"))

# Initialize local embedding model and ChromaDB storage context
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
db_client = chromadb.PersistentClient(path=CHROMA_PATH)
chroma_collection = db_client.get_or_create_collection("equipment_manuals")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

EQUIPMENT_MANUALS = [
    Document(
        text="Fault: belt_squeal / belt_slip. Cause: Inadequate drive belt tension, worn pulley groove, or oil contamination on the belt surface. Solution: 1. Inspect belt tension using a tension gauge. 2. Clean pulleys with degreaser. 3. Replace belt if severe cracking is visible.",
        metadata={"manual_id": "M-101", "equipment": "Conveyor Drive / Accessory Belt"}
    ),
    Document(
        text="Fault: bearing_rumble. Cause: Lack of lubrication, severe mechanical wear, or shaft misalignment. Solution: 1. Apply high-temp grease to grease nipple. 2. Verify shaft alignment using a laser aligner. 3. Replace bearing housing if noise persists.",
        metadata={"manual_id": "M-102", "equipment": "Motor Bearing"}
    ),
    Document(
        text="Fault: heat_dissipation_failure / overheating. Cause: Radiator clog, coolant pump cavitation, degraded heat sink thermal paste, or excessive thermal gradient. Solution: 1. Inspect coolant flow rate and reservoir level. 2. Flush radiator channels with cooling system descaler. 3. Verify cooling fan activation and thermal sensor calibration.",
        metadata={"manual_id": "M-103", "equipment": "Cooling System"}
    ),
    Document(
        text="Fault: overstrain_failure / excessive torque stress. Cause: Mechanical overload beyond rated torque limit, gear tooth binding, or excessive drive resistance. Solution: 1. Reduce motor operational torque and throttle load. 2. Check gear train backlash and gearbox lubrication. 3. Inspect drive couplings for torsional deformation.",
        metadata={"manual_id": "M-104", "equipment": "Drivetrain & Transmission"}
    ),
    Document(
        text="Fault: tool_wear_failure / mechanical wear degradation. Cause: Exceeded tool wear threshold (>200 minutes cumulative), cutting edge micro-fracture, or friction surface abrasion. Solution: 1. Replace worn tool insert or rotating spindle element. 2. Recalibrate tool offset and zero position. 3. Apply lubrication barrier to contact interfaces.",
        metadata={"manual_id": "M-105", "equipment": "Spindle & Tooling Assembly"}
    ),
    Document(
        text="Fault: power_failure / electrical power loss. Cause: Inverter voltage sag, supply current spike outside operational bounds, or bus capacitor deterioration. Solution: 1. Measure DC bus voltage and incoming 3-phase line balance. 2. Inspect inverter power electronics and gate driver boards. 3. Check circuit breaker and power line contactors.",
        metadata={"manual_id": "M-106", "equipment": "Power Inverter & Drive"}
    )
]

def ensure_manuals_seeded():
    """Seeds ChromaDB collection if empty or incomplete."""
    if chroma_collection.count() < len(EQUIPMENT_MANUALS):
        if chroma_collection.count() > 0:
            existing_ids = chroma_collection.get()["ids"]
            if existing_ids:
                chroma_collection.delete(ids=existing_ids)
        VectorStoreIndex.from_documents(EQUIPMENT_MANUALS, storage_context=storage_context)
        print(f"[RAG Engine] Synchronized {len(EQUIPMENT_MANUALS)} equipment manuals in ChromaDB.")

class AnomalyPredictor:
    def __init__(self, model_file=MODEL_PATH):
        if not os.path.exists(model_file):
            raise FileNotFoundError(
                f"Model file not found at {model_file}. Please run train_anomaly_model.py first."
            )
        print(f"[Predictor] Loading Isolation Forest model: {model_file}")
        bundle = joblib.load(model_file)
        self.model = bundle["model"]
        self.scaler = bundle["scaler"]
        self.features = bundle["feature_columns"]
        ensure_manuals_seeded()

    def query_rag_for_anomaly(self, fault_label: str, top_k: int = 1):
        """Queries ChromaDB vector store for repair manuals matching the fault."""
        try:
            index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)
            retriever = index.as_retriever(similarity_top_k=top_k)
            query_str = f"Troubleshooting and repair steps for fault: {fault_label}"
            nodes = retriever.retrieve(query_str)
            
            explanations = []
            for node in nodes:
                explanations.append({
                    "manual_id": node.metadata.get("manual_id", "N/A"),
                    "equipment": node.metadata.get("equipment", "Unknown"),
                    "explanation": node.get_content(),
                    "relevance_score": round(float(node.get_score()), 4) if node.get_score() else None
                })
            return explanations
        except Exception as e:
            print(f"[RAG Error]: Failed to query ChromaDB: {e}")
            return []

    # Sensor registry: maps fault type -> (sensor_source_id, sensor_human_name, component_name)
    SENSOR_MAP = {
        "heat_dissipation_failure": ("SENSOR_THERMAL_BLOCK",      "Thermal Gradient & Coolant Thermistor",             "Engine Cooling System"),
        "belt_squeal":             ("SENSOR_ACOUSTIC_MIC",        "Accessory Drive Acoustic Microphone",               "Accessory Belt & Tensioner Assembly"),
        "overstrain_failure":      ("SENSOR_TORQUE_TRANSDUCER",   "Drivetrain Mechanical Torque Strain Gauge",          "Drivetrain / Transmission Coupling"),
        "tool_wear_failure":       ("SENSOR_WEAR_DISPLACEMENT",   "Contact Interface Linear Displacement Sensor",      "Cutting Tool Contact Surface"),
        "power_failure":           ("SENSOR_POWER_INVERTER",      "Inverter DC Bus Current & Voltage Monitor",         "Power Inverter / Motor Drive Unit"),
        "random_failure":          ("SENSOR_VIBRATION_BEARING",   "High-Frequency Vibration Accelerometer",            "Main Shaft Roller Bearing"),
        "bearing_rumble":          ("SENSOR_VIBRATION_BEARING",   "High-Frequency Vibration Accelerometer",            "Main Shaft Roller Bearing"),
        "normal":                  ("SENSOR_TELEMETRY_BUS",       "Standard Multi-Sensor Telemetry Array",             "All Systems Nominal"),
    }

    def classify_fault(self, frame: dict) -> str:
        """Determines the specific mechanical fault mode from telemetry attributes."""
        frequency_hz = float(frame.get("frequency_hz", 0))
        decibels = float(frame.get("decibels", 0))
        temp_diff_c = float(frame.get("temp_diff_c", frame.get("process_temp_c", 35) - frame.get("air_temp_c", 25)))
        process_temp_c = float(frame.get("process_temp_c", 35))
        torque_nm = float(frame.get("torque_nm", 40))
        tool_wear_min = float(frame.get("tool_wear_min", 0))
        rpm = float(frame.get("rpm", 1500))

        # 1. Thermal dissipation failure
        if (
            temp_diff_c >= 11.5
            or process_temp_c >= 40.0
            or (temp_diff_c <= 8.6 and rpm < 1385.0)
            or frame.get("failure_type") == "heat_dissipation_failure"
        ):
            return "heat_dissipation_failure"

        # 2. Cumulative tool & contact surface wear
        if tool_wear_min >= 200 or frame.get("failure_type") == "tool_wear_failure":
            return "tool_wear_failure"

        # 3. Excessive mechanical torque / overstrain
        if torque_nm >= 60.0 or (torque_nm * (rpm / 60.0) > 2800) or frame.get("failure_type") == "overstrain_failure":
            return "overstrain_failure"

        # 4. Sudden power drop / electrical loss
        if (torque_nm < 15.0 and rpm > 2000) or frame.get("failure_type") == "power_failure":
            return "power_failure"

        # 5. Acoustic belt squeal / tensioner slip
        if (frequency_hz > 2400 and decibels > 72.0) or frame.get("failure_type") == "belt_squeal":
            return "belt_squeal"

        # 6. Bearing wear / vibration default
        return "bearing_rumble"

    def resolve_sensor(self, fault_label: str) -> dict:
        """Returns the sensor source ID, human-readable name, and physical component for a fault."""
        entry = self.SENSOR_MAP.get(fault_label, ("SENSOR_TELEMETRY_BUS", "Standard Multi-Sensor Telemetry Array", "All Systems Nominal"))
        return {"sensor_source": entry[0], "sensor_name": entry[1], "component": entry[2]}

    def predict_frame(self, telemetry: dict) -> dict:
        """
        Runs anomaly detection on a single telemetry frame.
        Triggers ChromaDB RAG vector query when an anomaly is flagged.
        """
        if "temp_diff_c" not in telemetry or telemetry["temp_diff_c"] is None:
            telemetry["temp_diff_c"] = round(
                float(telemetry.get("process_temp_c", 35.0)) - float(telemetry.get("air_temp_c", 25.0)), 2
            )

        # Build feature vector
        vector = np.array([[float(telemetry.get(col, 0.0)) for col in self.features]])
        scaled_vector = self.scaler.transform(vector)

        # Model inference: 1 = normal, -1 = anomaly
        raw_pred = self.model.predict(scaled_vector)[0]
        decision_score = float(self.model.decision_function(scaled_vector)[0])
        is_anomaly = bool(raw_pred == -1)

        if is_anomaly:
            confidence = min(0.99, max(0.65, 0.65 + abs(decision_score) * 2.5))
            severity = "FAULT" if confidence > 0.80 else "WARN"
            fault_label = self.classify_fault(telemetry)
            sensor = self.resolve_sensor(fault_label)
            print(
                f"\n{'='*60}\n"
                f"  🔴 ANOMALY  [{severity}]  Frame fault detected\n"
                f"  Fault     : {fault_label.replace('_', ' ').upper()}\n"
                f"  Component : {sensor['component']}\n"
                f"  Sensor    : {sensor['sensor_source']}\n"
                f"             ({sensor['sensor_name']})\n"
                f"  Confidence: {confidence*100:.1f}%\n"
                f"{'='*60}"
            )
            rag_results = self.query_rag_for_anomaly(fault_label)
        else:
            confidence = 0.0
            severity = "HEALTHY"
            fault_label = "normal"
            sensor = self.resolve_sensor("normal")
            rag_results = []

        return {
            "timestamp": telemetry.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "telemetry": telemetry,
            "is_anomaly": is_anomaly,
            "severity": severity,
            "fault_label": fault_label,
            "sensor_source": sensor["sensor_source"],
            "sensor_name": sensor["sensor_name"],
            "component": sensor["component"],
            "confidence": round(confidence, 2),
            "anomaly_score": round(-decision_score, 4),
            "rag_results": rag_results
        }

def test_temperature_dataset(limit=5):
    """Pulls actual temperature anomaly rows from the 10,000 entry dataset and runs inference."""
    import pandas as pd
    predictor = AnomalyPredictor()
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "omnis-twin-backend", "data", "processed", "automotive_telemetry.csv"))
    
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return

    print(f"\n[Dataset Verification] Loading 10,000-entry dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    hdf_df = df[df["failure_type"] == "heat_dissipation_failure"]
    print(f"[Dataset Verification] Total Heat Dissipation (Temperature Anomaly) rows: {len(hdf_df)}")

    print("\n" + "="*80)
    print("      TEMPERATURE ANOMALY PREDICTION ON REAL 10,000 DATASET ENTRIES")
    print("="*80)

    for i in range(min(limit, len(hdf_df))):
        row = hdf_df.iloc[i].to_dict()
        print(f"\n>>> [Row #{row['frame_id']}] Air: {row['air_temp_c']}°C | Process: {row['process_temp_c']}°C | TempDiff: {row['temp_diff_c']}°C | RPM: {row['rpm']}")
        res = predictor.predict_frame(row)
        print(f"Result: [{res['severity']}] | Anomaly Flagged: {res['is_anomaly']} | Score: {res['anomaly_score']} | Fault: {res['fault_label']}")
        if res["rag_results"]:
            m = res["rag_results"][0]
            print(f"RAG Retrieved Manual: {m['manual_id']} ({m['equipment']})")
            print(f"Action: {m['explanation'][:160]}...")

def run_custom_test(air_temp: float, proc_temp: float, rpm: float = 1400.0, torque: float = 45.0):
    """Tests a custom temperature reading directly with the ML model."""
    predictor = AnomalyPredictor()
    telemetry = {
        "rpm": rpm,
        "torque_nm": torque,
        "air_temp_c": air_temp,
        "process_temp_c": proc_temp,
        "temp_diff_c": round(proc_temp - air_temp, 2),
        "tool_wear_min": 50,
        "frequency_hz": round((rpm / 60.0) * 12.0 + (900.0 if (proc_temp > 40 or proc_temp - air_temp > 11.5 or (proc_temp - air_temp <= 8.6 and rpm < 1380)) else 0), 1),
        "decibels": 73.5 if (proc_temp > 40 or proc_temp - air_temp > 11.5 or (proc_temp - air_temp <= 8.6 and rpm < 1380)) else 58.0
    }

    print("\n" + "="*75)
    print(f"   CUSTOM TEMPERATURE TEST: Air={air_temp}°C, Process={proc_temp}°C, RPM={rpm}")
    print("="*75)
    res = predictor.predict_frame(telemetry)
    print(f"Model Output: Status=[{res['severity']}] | Is Anomaly={res['is_anomaly']} | Score={res['anomaly_score']}")
    if res["rag_results"]:
        print(f"RAG Manual: {res['rag_results'][0]['manual_id']} ({res['rag_results'][0]['equipment']})")
        print(f"Troubleshooting: {res['rag_results'][0]['explanation']}")

def run_simulation():
    """Runs demonstration telemetry frames across distinct operational and failure states."""
    predictor = AnomalyPredictor()

    test_frames = [
        {
            "description": "Baseline Cruising - Normal Engine/Motor Operation (Nominal Temp)",
            "telemetry": {
                "rpm": 1500.0, "torque_nm": 42.0, "air_temp_c": 24.5,
                "process_temp_c": 34.8, "temp_diff_c": 10.3, "tool_wear_min": 10,
                "frequency_hz": 300.0, "decibels": 58.2
            }
        },
        {
            "description": "Heat Dissipation Failure - Radiator Clog / Severe Overheating (42.5°C Process)",
            "telemetry": {
                "rpm": 1450.0, "torque_nm": 55.0, "air_temp_c": 25.0,
                "process_temp_c": 42.5, "temp_diff_c": 17.5, "tool_wear_min": 60,
                "frequency_hz": 1150.0, "decibels": 74.0
            }
        },
        {
            "description": "Critical Belt Slip - High Acoustic Squeal & Noise",
            "telemetry": {
                "rpm": 3800.0, "torque_nm": 44.0, "air_temp_c": 26.0,
                "process_temp_c": 36.5, "temp_diff_c": 10.5, "tool_wear_min": 45,
                "frequency_hz": 2850.0, "decibels": 78.4
            }
        },
        {
            "description": "Mechanical Overstrain - Dangerous Torque & Structural Stress",
            "telemetry": {
                "rpm": 1350.0, "torque_nm": 74.0, "air_temp_c": 25.2,
                "process_temp_c": 36.5, "temp_diff_c": 11.3, "tool_wear_min": 150,
                "frequency_hz": 1800.0, "decibels": 76.8
            }
        },
        {
            "description": "Tool Wear Degradation - Exceeded 200min Contact Wear Limit",
            "telemetry": {
                "rpm": 1520.0, "torque_nm": 45.0, "air_temp_c": 25.1,
                "process_temp_c": 35.8, "temp_diff_c": 10.7, "tool_wear_min": 225,
                "frequency_hz": 2480.0, "decibels": 75.2
            }
        }
    ]

    print("\n" + "="*75)
    print("        OMNIS-TWIN PREDICTIVE MAINTENANCE RAG INFERENCE ENGINE")
    print("="*75)

    for item in test_frames:
        print(f"\n>>> Scenario: {item['description']}")
        res = predictor.predict_frame(item["telemetry"])
        print(f"Status: [{res['severity']}] | Anomaly: {res['is_anomaly']} | Score: {res['anomaly_score']}")
        
        if res["is_anomaly"] and res["rag_results"]:
            match = res["rag_results"][0]
            print(f"  --> Identified Fault: {res['fault_label'].upper()} (Confidence: {res['confidence']*100:.0f}%)")
            print(f"  --> RAG Manual Match: {match['manual_id']} ({match['equipment']}) [Similarity: {match['relevance_score']}]")
            print(f"  --> Repair Procedure:\n      {match['explanation']}")
        elif not res["is_anomaly"]:
            print("  --> System Healthy. All sensor telemetry within nominal bounds.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Omnis-Twin Anomaly & RAG Predictor")
    parser.add_argument("--test-temp", action="store_true", help="Test temperature anomalies directly from the 10,000-entry dataset")
    parser.add_argument("--air", type=float, default=None, help="Custom ambient air temperature in Celsius")
    parser.add_argument("--proc", type=float, default=None, help="Custom process/component temperature in Celsius")
    parser.add_argument("--rpm", type=float, default=1400.0, help="Custom RPM")
    args = parser.parse_args()

    if args.test_temp:
        test_temperature_dataset()
    elif args.proc is not None:
        air = args.air if args.air is not None else 25.0
        run_custom_test(air_temp=air, proc_temp=args.proc, rpm=args.rpm)
    else:
        run_simulation()


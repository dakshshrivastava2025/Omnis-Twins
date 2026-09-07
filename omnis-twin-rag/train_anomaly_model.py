"""
Isolation Forest Model Training for Omnis-Twin Predictive Telemetry.
Trains an unsupervised anomaly detection model on automotive telemetry data
and evaluates performance against verified machine failure and acoustic anomaly labels.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

FEATURE_COLUMNS = [
    "rpm",
    "torque_nm",
    "air_temp_c",
    "process_temp_c",
    "temp_diff_c",
    "tool_wear_min",
    "frequency_hz",
    "decibels"
]

def find_telemetry_csv():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(current_dir, "..", "omnis-twin-backend", "data", "processed", "automotive_telemetry.csv")),
        os.path.abspath(os.path.join(current_dir, "data", "processed", "automotive_telemetry.csv")),
        os.path.abspath(os.path.join(current_dir, "automotive_telemetry.csv"))
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"automotive_telemetry.csv not found in candidate paths: {candidates}")

def train_model(dataset_path=None, model_output_path=None, contamination=0.036):
    if dataset_path is None:
        dataset_path = find_telemetry_csv()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if model_output_path is None:
        models_dir = os.path.join(current_dir, "models")
        os.makedirs(models_dir, exist_ok=True)
        model_output_path = os.path.join(models_dir, "isolation_forest.joblib")

    print(f"[Training] Loading telemetry dataset: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"[Training] Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # Validate feature presence
    missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required feature columns: {missing_cols}")

    X = df[FEATURE_COLUMNS].values
    y_ground_truth = df["is_anomaly"].values if "is_anomaly" in df.columns else None

    # Standardize features
    print(f"[Training] Normalizing features: {FEATURE_COLUMNS}")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    print(f"[Training] Fitting Isolation Forest (n_estimators=200, contamination={contamination})...")
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_scaled)

    # Evaluate predictions
    # IsolationForest: 1 for inlier (normal), -1 for outlier (anomaly)
    raw_preds = model.predict(X_scaled)
    # Map to binary 0 = normal, 1 = anomaly
    y_pred = np.where(raw_preds == -1, 1, 0)
    anomaly_scores = -model.decision_function(X_scaled)

    detected_anomalies = np.sum(y_pred == 1)
    print(f"[Training] Detected Anomalies: {detected_anomalies}/{len(df)} ({detected_anomalies/len(df)*100:.2f}%)")

    if y_ground_truth is not None:
        print("\n--- Model Evaluation against Ground Truth Anomaly Labels ---")
        cm = confusion_matrix(y_ground_truth, y_pred)
        print("Confusion Matrix:")
        print(f"  [TN: {cm[0][0]:>5}, FP: {cm[0][1]:>5}]")
        print(f"  [FN: {cm[1][0]:>5}, TP: {cm[1][1]:>5}]")

        precision, recall, f1, _ = precision_recall_fscore_support(y_ground_truth, y_pred, average="binary")
        print(f"\nPrecision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_ground_truth, y_pred, target_names=["Normal", "Anomaly"]))

    # Serialize trained bundle
    bundle = {
        "model": model,
        "scaler": scaler,
        "feature_columns": FEATURE_COLUMNS,
        "contamination": contamination,
        "training_samples": len(df),
        "metrics": {
            "precision": float(precision) if y_ground_truth is not None else None,
            "recall": float(recall) if y_ground_truth is not None else None,
            "f1": float(f1) if y_ground_truth is not None else None
        }
    }

    joblib.dump(bundle, model_output_path)
    print(f"\n[Training] Trained bundle successfully saved to: {model_output_path}")
    return model_output_path

if __name__ == "__main__":
    train_model()

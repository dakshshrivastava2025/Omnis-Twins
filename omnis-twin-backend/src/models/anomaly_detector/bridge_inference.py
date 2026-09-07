import sys
import json
import os

# Import teammate's inference module
try:
    from inference_anomaly import predict_anomaly_score
except ImportError:
    def predict_anomaly_score(frame):
        # Fallback heuristic if weight files aren't loaded yet
        return 0.15

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "Empty input", "anomalyScore": 0.0}))
            return

        frame = json.loads(input_data)
        
        # Execute prediction using teammate's model wrapper
        score = predict_anomaly_score(frame)
        
        print(json.dumps({"anomalyScore": float(score)}))
    except Exception as e:
        print(json.dumps({"error": str(e), "anomalyScore": 0.0}))

if __name__ == '__main__':
    main()
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_index.core import Document, VectorStoreIndex, StorageContext, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import chromadb

# Initialize local embedding model
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Initialize ChromaDB persistent storage
db = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = db.get_or_create_collection("equipment_manuals")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

class ManualIngestPayload(BaseModel):
    equipment_type: str
    manual_content: str

class AnomalyQueryPayload(BaseModel):
    fault_label: str
    confidence: float

def seed_manuals_if_empty():
    """Seeds baseline repair documentation into ChromaDB on startup if empty or missing entries."""
    if chroma_collection.count() < 6:
        sample_manuals = [
            Document(
                text="Fault: belt_squeal / belt_slip. Cause: Inadequate drive belt tension, worn pulley groove, or oil contamination on the belt surface. Solution: 1. Inspect belt tension using a tension gauge. 2. Clean pulleys with degreaser. 3. Replace belt if severe cracking is visible.",
                metadata={"manual_id": "M-101", "equipment": "Conveyor Drive"}
            ),
            Document(
                text="Fault: bearing_rumble. Cause: Lack of lubrication, severe mechanical wear, or shaft misalignment. Solution: 1. Apply high-temp grease to grease nipple. 2. Verify shaft alignment using a laser aligner. 3. Replace bearing housing if noise persists.",
                metadata={"manual_id": "M-102", "equipment": "Motor Bearing"}
            ),
            Document(
                text="Fault: heat_dissipation_failure / overheating. Cause: Radiator clog, coolant pump cavitation, degraded heat sink thermal paste, or high ambient thermal gradient. Solution: 1. Inspect coolant flow rate and reservoir level. 2. Flush radiator channels with cooling system descaler. 3. Verify cooling fan activation and thermal sensor calibration.",
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
        # Clear previous partial collection if small and reseed full catalog
        if chroma_collection.count() > 0:
            existing_ids = chroma_collection.get()["ids"]
            if existing_ids:
                chroma_collection.delete(ids=existing_ids)
        VectorStoreIndex.from_documents(sample_manuals, storage_context=storage_context)
        print("[RAG Startup] Full equipment manuals catalog (6 manuals) seeded into ChromaDB.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_manuals_if_empty()
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/api/rag/ingest-manual")
async def ingest_manual(data: ManualIngestPayload):
    try:
        doc = Document(text=data.manual_content, metadata={"equipment": data.equipment_type})
        VectorStoreIndex.from_documents([doc], storage_context=storage_context)
        return {"status": "success", "message": f"Manual for {data.equipment_type} indexed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/explain")
async def explain_anomaly(data: AnomalyQueryPayload):
    try:
        index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)
        retriever = index.as_retriever(similarity_top_k=1)
        
        # Search manuals for the flagged anomaly label
        query_str = f"Troubleshooting and repair steps for fault: {data.fault_label}"
        nodes = retriever.retrieve(query_str)
        
        explanations = []
        for node in nodes:
            explanations.append({
                "explanation": node.get_content(),
                "manual_id": node.metadata.get("manual_id", "N/A"),
                "equipment": node.metadata.get("equipment", "Unknown"),
                "relevance_score": float(node.get_score()) if node.get_score() else None
            })

        return {
            "fault_label": data.fault_label,
            "confidence": data.confidence,
            "matched_manuals": explanations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TelemetryPayload(BaseModel):
    rpm: float = 1500.0
    torque_nm: float = 40.0
    air_temp_c: float = 25.0
    process_temp_c: float = 35.0
    temp_diff_c: float | None = None
    tool_wear_min: float = 0.0
    frequency_hz: float = 300.0
    decibels: float = 60.0
    # Optional: pre-known sensor source from telemetry frame (e.g. from CSV or hardware tag)
    sensor_source: str | None = None
    sensor_name: str | None = None

predictor_instance = None

def get_predictor():
    global predictor_instance
    if predictor_instance is None:
        from predict import AnomalyPredictor
        predictor_instance = AnomalyPredictor()
    return predictor_instance

@app.post("/api/ml/predict")
async def ml_predict(data: TelemetryPayload):
    """Evaluates telemetry using trained Isolation Forest ML model and ChromaDB RAG."""
    try:
        predictor = get_predictor()
        result = predictor.predict_frame(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
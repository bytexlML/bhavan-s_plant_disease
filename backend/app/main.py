
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
import os
import shutil
from contextlib import asynccontextmanager

from .models.database import SessionLocal, init_db, Prediction
from .models.model_service import model_service
from .utils.image_processor import format_confidence
from .explanations.engine import EXPLANATIONS

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database and uploads exist
    print("Local System: Initializing resources...")
    try:
        init_db()
        
        uploads_dir = os.getenv("UPLOADS_PATH", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            print(f"Verified uploads directory: {uploads_dir}")
    except Exception as e:
        print(f"FASTAPI STARTUP ERROR: {e}")
    
    yield
    # Shutdown logic (if any)
    pass

app = FastAPI(title="Bhavan's Plant Health Detection API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from pydantic import BaseModel

class UserRegister(BaseModel):
    name: str
    email: str
    phone: str

@app.post("/api/register")
async def register(request: UserRegister, db: Session = Depends(get_db)):
    from .models.database import UserRegistration
    new_user = UserRegistration(
        name=request.name,
        email=request.email,
        phone=request.phone
    )
    db.add(new_user)
    db.commit()
    return {"status": "success", "message": "User registered successfully"}

@app.get("/api")
def read_root():
    return {"message": "Bhavan's Plant Health Detection System API is running."}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "plant-diagnosis-backend"}

@app.post("/api/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Save file
        file_content = await file.read()
        
        uploads_dir = os.getenv("UPLOADS_PATH", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            
        file_path = os.path.join(uploads_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Inference using LLM
        llm_result = await model_service.predict_with_llm(file_content)
        
        predicted_class = llm_result.get("predicted_class", "Unknown")
        confidence = llm_result.get("confidence", 0.95)
        analysis = llm_result.get("analysis", "")
        
        # Get local explanation
        explanation = EXPLANATIONS.get(predicted_class, {})
        
        # Save to DB
        new_prediction = Prediction(
            filename=file.filename,
            plant_name=predicted_class.split("___")[0].replace("_", " ") if "___" in predicted_class else "Plant",
            predicted_disease=predicted_class.split("___")[1].replace("_", " ") if "___" in predicted_class else "Condition",
            category=explanation.get("category", "Consult AI Expert"),
            confidence_score=confidence
        )
        db.add(new_prediction)
        db.commit()
        
        return {
            "plant_name": new_prediction.plant_name,
            "predicted_disease": new_prediction.predicted_disease,
            "category": new_prediction.category,
            "confidence_score": format_confidence(confidence),
            "biological_explanation": analysis or explanation.get("scientific_reason", ""),
            "precaution": explanation.get("precaution", ""),
            "recommended_action": llm_result.get("recommendation") or explanation.get("recommended_action", ""),
            "symptoms": explanation.get("symptoms", ""),
            "nutrient_correction": explanation.get("nutrient_correction", "")
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test")
def test_route():
    return {"status": "alive", "message": "FastAPI is responding on Vercel."}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    try:
        total = db.query(Prediction).count()
        return {
            "total_predictions": total,
            "model_accuracy": "95%",
            "common_diseases": ["Tomato Late Blight", "Potato Early Blight", "Apple Scab"],
            "top_plant": "Tomato"
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"total_predictions": 0, "top_plant": "None"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

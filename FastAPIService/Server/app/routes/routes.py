from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from app.controllers.SpeechPredictionController import get_prediction
from app.controllers.EmotionDetectionController import (
    get_emotion_prediction,
    get_activity_analytics,
    send_report,
    # emotion_detection_route
)
from app.controllers.SentenceGenController import generate_sentences
import logging

logger = logging.getLogger(__name__)

health_check_route = APIRouter()
speach_prediction_route = APIRouter()
emotion_detection_route = APIRouter()
sentence_generation_route = APIRouter()

# Health check route
@health_check_route.get("/healthCheck")
def health_check():
    return JSONResponse( 
    content= {"status": "FastAPI server is running"}, 
    status_code = status.HTTP_200_OK
    )

# Define routes here - annotation is the route. 
@speach_prediction_route.post("/v1/predict/speech")
async def predict(req: Request):
    return await get_prediction(req)

@emotion_detection_route.post("/predict")
async def emotion_predict(req: Request):
    student_id = req.headers.get("student-id")
    activity_id = req.headers.get("activity-id")
    return await get_emotion_prediction(req, student_id, activity_id)    

@emotion_detection_route.get("/analytics")
async def analytics(req: Request):
    return await get_activity_analytics(req)  

@emotion_detection_route.post("/send-report")
async def send_report_route(req: Request):
    return await send_report(req)   

@sentence_generation_route.get("/generate")
async def sentence_generation(word_length: int, sentence_count: int):
    return await generate_sentences(word_length, sentence_count)
    

from flask import Blueprint
from src.controllers.SpeechPredictionController import get_prediction
from src.controllers.EmotionDetectionController import (
    get_emotion_prediction,
    get_activity_analytics,
    send_report,
    emotion_detection_route
)
from src.controllers.SentenceGenController import generate_sentences

#Define your routes blueprint here
speach_prediction_route = Blueprint("speechPredictRoute", __name__)
health_check_route = Blueprint("healthCheckRoute", __name__)
sentence_generation_route = Blueprint("sentenceGenRoute", __name__)

# Health check route
@health_check_route.route("/health", methods=["GET"])
def health_check():
    return {"status": "Flask server is running"}, 200

# Define routes here - annotation is the route. Attached function is the one that is executing.
@speach_prediction_route.route("/v1/predict/speech", methods=["POST"])
def predict():
    return get_prediction()

@emotion_detection_route.route("/predict", methods=["POST"])
def emotion_predict():
    return get_emotion_prediction()

@emotion_detection_route.route("/analytics", methods=["GET"])
def analytics():
    return get_activity_analytics()

@emotion_detection_route.route("/send-report", methods=["POST"])
def send_report_route():
    return send_report()

@sentence_generation_route.route("/generate", methods=["GET"])
def sentence_generation():
    return generate_sentences()

#Add a new route

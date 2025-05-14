from flask import Blueprint
from src.controllers.SpeechPredictionController import get_prediction
from src.controllers.EmotionDetectionController import get_emotion_prediction, get_activity_analytics

#Define your routes blueprint here
speach_prediction_route = Blueprint("speechPredictRoute", __name__)
emotion_detection_route = Blueprint("emotionDetectionRoute", __name__)
health_check_route = Blueprint("healthCheckRoute", __name__)

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

@emotion_detection_route.route('/analytics', methods=['GET'])
def analytics():
    return get_activity_analytics()

#Add a new route

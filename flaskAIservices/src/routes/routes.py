from flask import Blueprint
from src.controllers.SpeechPredictionController import get_prediction
from src.controllers.EmotionDetectionController import get_emotion_prediction

#Define your routes blueprint here
speach_prediction_route = Blueprint("speechPredictRoute", __name__)
emotion_detection_route = Blueprint("emotionDetectionRoute", __name__)

# Define routes here - annotation is the route. Attached function is the one that is executing.
@speach_prediction_route.route("/v1/predict/speech", methods=["POST"])
def predict():
    return get_prediction()

@emotion_detection_route.route("/v1/emotion/detection", methods=["POST"])
def emotion_predict():
    return get_emotion_prediction()

#Add a new route

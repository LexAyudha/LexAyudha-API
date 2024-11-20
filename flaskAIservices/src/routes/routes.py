from flask import Blueprint
from src.controllers.SpeechPredictionController import get_prediction

speach_prediction_route = Blueprint("speechPredictRoute", __name__)

# Define route
@speach_prediction_route.route("/v1/predict/speech", methods=["POST"])
def predict():
    return get_prediction()

from flask import Blueprint
from src.controllers.SpeechPredictionController import get_prediction

#Define your routes blueprint here
speach_prediction_route = Blueprint("speechPredictRoute", __name__)

# Define routes here - annotation is the route. Attached function is the one that is executing.
@speach_prediction_route.route("/v1/predict/speech", methods=["POST"])
def predict():
    return get_prediction()

#Add a new route

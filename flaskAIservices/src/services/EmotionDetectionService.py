from src.modelController.EmotionPredictionModel import load_model, predict_with_model

import numpy as np
import os


# Load the model once at service initialization
EmotionPredict_model = load_model()

if isinstance(EmotionPredict_model, dict) and 'error' in EmotionPredict_model:
    print(f"Error loading model: {EmotionPredict_model['error']}")
else:
    print("Model is loaded okay")


def make_emotion_prediction(temp_path):
    
    # Use the model to make predictions
    prediction = predict_with_model(temp_path)

    return prediction

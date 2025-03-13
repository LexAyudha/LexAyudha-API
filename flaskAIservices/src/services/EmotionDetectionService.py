from src.modelController.EmotionPredictionModel import load_model, predict_with_model
import numpy as np
import os
import pymongo
import datetime

# MongoDB client setup
client = pymongo.MongoClient("mongodb+srv://lexayudha:lex123@cluster0.pvr0d.mongodb.net/lexayudha?retryWrites=true&w=majority")
db = client["EmotionDataDB"]
collection = db["history"]

# Load the model once at service initialization
EmotionPredict_model = load_model()

if isinstance(EmotionPredict_model, dict) and 'error' in EmotionPredict_model:
    print(f"Error loading model: {EmotionPredict_model['error']}")
else:
    print("Model is loaded okay")


def make_emotion_prediction(temp_path, student_id, activity_id):
    """
    Makes emotion prediction and saves the result to MongoDB.
    
    :param temp_path: Path to the image for emotion detection
    :param student_id: The ID of the student
    :param activity_id: The ID of the activity being performed
    :return: Predicted emotion
    """
    # Use the model to make predictions and save to MongoDB
    prediction = predict_with_model(temp_path, student_id, activity_id)

    # Check if the prediction is successful
    if prediction:
        print(f"Emotion predicted: {prediction}")
        return prediction
    else:
        print("Failed to predict emotion.")
        return None

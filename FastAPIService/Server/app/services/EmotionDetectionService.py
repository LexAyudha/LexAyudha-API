from app.modelController.EmotionPredictionModel import predict_with_model
import pymongo
from app.core.settings import settings
from app.core.model_registry import model_registry

# MongoDB client setup
client = pymongo.MongoClient(settings.MONGO_EMOTION_SERVICE_URI)
db = client[settings.MONGO_DB_NAME]
collection = db[settings.MONGO_DB_COLLECTION]

# Load the model once at service initialization
EmotionPredict_model = model_registry.get("emotion")

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
    print(f"Making prediction for student_id: {student_id}, activity_id: {activity_id}")
    # Use the model to make predictions and save to MongoDB
    prediction = predict_with_model(temp_path, student_id, activity_id)

    # Check if the prediction is successful
    if prediction:
        print(f"Emotion predicted: {prediction}")
        return prediction
    else:
        print("Failed to predict emotion.")
        return None

import os
import datetime
import tensorflow as tf
from deepface import DeepFace
import pymongo

# Set environment variable to minimize TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# MongoDB client setup
client = pymongo.MongoClient("mongodb+srv://lexayudha:lex123@cluster0.pvr0d.mongodb.net/lexayudha?retryWrites=true&w=majority")
db = client["EmotionDataDB"]
collection = db["history"]

def load_model():
    """
    Load the AI model from a .pth file with error handling.
    """
    try:
        model_emotion = tf.keras.models.load_model('src/assets/emotion_model.h5')
        model_emotion.compile(
                    optimizer=tf.keras.optimizers.Adam(),
                    loss='categorical_crossentropy',
                    metrics=[
                            tf.keras.metrics.CategoricalAccuracy(),
                            tf.keras.metrics.Precision(),
                            tf.keras.metrics.Recall(),
                            tf.keras.metrics.AUC()
                            ]
                    )
        return model_emotion
    except Exception as e:
        # Handle any exception that occurs during loading
        return {"error": f"An error occurred while loading the model: {str(e)}"}

def predict_with_model(img_path, student_id, activity_id):
    """
    Use DeepFace to predict emotion and save the result to MongoDB.
    """
    try:
        # Perform emotion analysis using DeepFace
        objs = DeepFace.analyze(
                            img_path=img_path, 
                            actions=['emotion'],
                            enforce_detection=False
                            )
        
        # Check if any objects were returned by DeepFace
        if len(objs) > 0:
            emotion_dict = objs[0]['emotion']
            emotion = max(emotion_dict, key=emotion_dict.get)
            
            # Capture the current timestamp
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Prepare data to insert into MongoDB
            data = {
                "StudentId": student_id,
                "ActivityId": activity_id,
                "TimeStamp": timestamp,
                "Emotion": emotion
            }

            # Insert data into the MongoDB collection
            collection.insert_one(data)

            # Return the emotion
            return emotion
        else:
            return None
    except Exception as e:
        return {"error": f"An error occurred during prediction: {str(e)}"}

# You can now directly call this method to make predictions
# Example usage:
student_id = "123456"
activity_id = "232455"
img_path = "temp.jpg"  # Path to the image file

emotion = predict_with_model(img_path, student_id, activity_id)

if emotion:
    print(f"Emotion predicted: {emotion}")
else:
    print("Emotion prediction failed.")

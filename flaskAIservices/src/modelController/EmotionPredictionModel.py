import os
import datetime
import tensorflow as tf
from deepface import DeepFace
import pymongo

# Set environment variable to minimize TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# MongoDB client setup
client = pymongo.MongoClient('mongodb+srv://falcon:UM0S1YXk4ZOvulwi@lexayudhacluster.9ufym.mongodb.net/LexAyudhaDB?retryWrites=true&w=majority&appName=LexAyudhaCluster')
db = client["EmotionDataDB"]
collection = db["history"]

# Basic emotion categories
FRUSTRATION_EMOTIONS = ["anger", "sad"]
DISTRACTION_EMOTIONS = ["surprise"]  
ENGAGEMENT_EMOTIONS = ["happy"]   

def calculate_emotion_percentages(student_id, time_window=20):
    """
    Calculate the percentage of frustration, distraction, and engagement 
    based on stored emotion data with more balanced neutral handling.
    
    Args:
        student_id: ID of the student
        time_window: Number of recent emotion entries to consider
    """
    try:
        # Fetch recent emotion entries for the student
        emotion_entries = list(collection.find({"StudentId": student_id}).sort("TimeStamp", -1).limit(time_window))
        
        if not emotion_entries:
            return {"frustration": 0, "distraction": 0, "engagement": 0}
        
        total = len(emotion_entries)
        counts = {"frustration": 0, "distraction": 0, "engagement": 0}
        
        # Count consecutive neutral states
        consecutive_neutral = 0
        neutral_threshold = 3 
        
        for i, entry in enumerate(emotion_entries):
            emotion = entry["Emotion"]
            
            # Basic emotion categorization
            if emotion in FRUSTRATION_EMOTIONS:
                counts["frustration"] += 1
            elif emotion in DISTRACTION_EMOTIONS:
                counts["distraction"] += 1
            elif emotion in ENGAGEMENT_EMOTIONS:
                counts["engagement"] += 1
            
            # Special handling for neutral emotions
            if emotion == "neutral":
                consecutive_neutral += 1
                
                has_nearby_happy = False
                
                # Look at nearby entries for context (up to 2 entries before and after)
                nearby_range = 2
                for j in range(max(0, i-nearby_range), min(total, i+nearby_range+1)):
                    if j != i and emotion_entries[j]["Emotion"] == "happy":
                        has_nearby_happy = True
                        break
                
                if consecutive_neutral >= neutral_threshold:
                    counts["distraction"] += 0.7
                elif has_nearby_happy:
                    counts["engagement"] += 0.5
                else:
                    # In other cases, neutral is slightly more likely to be engagement than distraction
                    counts["engagement"] += 0.3
                    counts["distraction"] += 0.2
            else:
                consecutive_neutral = 0
        
        # Additional engagement boost if there's a good ratio of happy/neutral to sad/anger
        positive_count = sum(1 for entry in emotion_entries if entry["Emotion"] in ["happy", "neutral"])
        negative_count = sum(1 for entry in emotion_entries if entry["Emotion"] in ["sad", "anger"])
        
        if positive_count > negative_count * 2:  # At least 2:1 ratio
            counts["engagement"] += 3
        
        # Convert counts to percentages
        percentages = {
            "frustration": (counts["frustration"] / total) * 100,
            "distraction": (counts["distraction"] / total) * 100,
            "engagement": (counts["engagement"] / total) * 100
        }
        
        # Normalize percentages to sum to 100%
        total_percentage = sum(percentages.values())
        if total_percentage > 0:
            for key in percentages:
                percentages[key] = round((percentages[key] / total_percentage) * 100, 1)
        
        return percentages

    except Exception as e:
        return {"error": f"Error calculating emotion percentages: {str(e)}"}


def load_model():
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

            percentages = calculate_emotion_percentages(student_id)

            alert = None
            if percentages["frustration"] >= 40:
                alert = "Frustrated"
            elif percentages["engagement"] >= 40:
                alert = "Engaged"
            
            return {"emotion": emotion, "percentages": percentages, "alert": alert}
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

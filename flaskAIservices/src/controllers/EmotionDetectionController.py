from flask import request, jsonify
import os
import random
from src.services.EmotionDetectionService import make_emotion_prediction
from src.modelController.EmotionPredictionModel import calculate_emotion_percentages
from datetime import datetime, timedelta
import pymongo
from bson import ObjectId

# MongoDB client setup
client = pymongo.MongoClient('mongodb+srv://falcon:UM0S1YXk4ZOvulwi@lexayudhacluster.9ufym.mongodb.net/LexAyudhaDB?retryWrites=true&w=majority&appName=LexAyudhaCluster')
db = client["EmotionDataDB"]
collection = db["history"]

def convert_to_serializable(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj

def get_emotion_prediction():
    try:
        # Get student ID and activity ID from headers
        student_id = request.headers.get('Student-Id')
        activity_id = request.headers.get('Activity-Id')

        if not student_id or not activity_id:
            return jsonify({"error": "Student ID and Activity ID are required"}), 400

        # Check if a file is part of the request
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        # Retrieve the file
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Generate a random number for a unique file name
        random_number = random.randint(1000, 9999)

        # Define the temp directory dynamically
        base_dir = os.path.dirname(os.path.abspath(__file__))  # Get current script directory
        temp_dir = os.path.join(base_dir, "../assets/temp")  # Adjust path to temp directory

        # Ensure the temp directory exists
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Define temporary file names
        temp_file_path = os.path.join(temp_dir, f"emo_temp_{random_number}.png")

        # Save the uploaded audio file temporarily
        file.save(temp_file_path)

        try:
            # Use the temporary file for prediction with student and activity IDs
            result = make_emotion_prediction(temp_file_path, student_id, activity_id)

            # Return prediction result
            return jsonify({"prediction": result}), 200

        finally:
            # Clean up temporary files
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_activity_analytics():
    try:
        date = request.args.get('date')
        activity_id = request.args.get('activityId')
        student_id = request.args.get('studentId')

        print(f"Received request with params: date={date}, activityId={activity_id}, studentId={student_id}")

        if not all([date, activity_id, student_id]):
            print("Missing required parameters")
            return jsonify({"error": "Date, activity ID, and student ID are required"}), 400

        # Convert date string to datetime
        selected_date = datetime.strptime(date, '%Y-%m-%d')
        next_day = selected_date + timedelta(days=1)

        # Query for specific date and activity
        query = {
            "StudentId": student_id,
            "ActivityId": activity_id,
            "TimeStamp": {
                "$gte": selected_date.strftime("%Y-%m-%d %H:%M:%S"),
                "$lt": next_day.strftime("%Y-%m-%d %H:%M:%S")
            }
        }

        print(f"MongoDB query: {query}")

        # Get all entries for the selected date
        entries = list(collection.find(query).sort("TimeStamp", 1))
        print(f"Found {len(entries)} entries for selected date")

        # Get all-time entries for the activity and student
        all_time_query = {
            "StudentId": student_id,
            "ActivityId": activity_id
        }
        all_time_entries = list(collection.find(all_time_query).sort("TimeStamp", 1))
        print(f"Found {len(all_time_entries)} all-time entries")

        # Calculate all-time emotion distribution
        all_time_emotions = {}
        for entry in all_time_entries:
            emotion = entry["Emotion"]
            all_time_emotions[emotion] = all_time_emotions.get(emotion, 0) + 1

        # Calculate all-time emotion percentages
        total_entries = len(all_time_entries)
        all_time_percentages = {
            "engagement": 0,
            "frustration": 0,
            "distraction": 0
        }

        if total_entries > 0:
            # Calculate percentages based on emotion categories
            for emotion, count in all_time_emotions.items():
                percentage = (count / total_entries) * 100
                if emotion in ["happy", "neutral"]:
                    all_time_percentages["engagement"] += percentage
                elif emotion in ["angry", "sad", "fear"]:
                    all_time_percentages["frustration"] += percentage
                elif emotion in ["surprise", "disgust"]:
                    all_time_percentages["distraction"] += percentage

        # Calculate daily trend for all-time data
        daily_trend = {}
        for entry in all_time_entries:
            date = entry["TimeStamp"].split(" ")[0]
            if date not in daily_trend:
                daily_trend[date] = {}
            emotion = entry["Emotion"]
            daily_trend[date][emotion] = daily_trend[date].get(emotion, 0) + 1

        # Prepare all-time data
        all_time_data = {
            "emotions": all_time_emotions,
            "total": total_entries,
            "engagement": all_time_percentages["engagement"],
            "frustration": all_time_percentages["frustration"],
            "distraction": all_time_percentages["distraction"],
            "dailyTrend": daily_trend
        }

        # Convert MongoDB documents to JSON-serializable format
        serialized_entries = convert_to_serializable(entries)
        
        response_data = {
            "hourlyData": [],  # Keep this for backward compatibility
            "allTimeData": all_time_data,
            "dailyData": serialized_entries
        }
        print(f"Returning response: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error in get_activity_analytics: {str(e)}")
        return jsonify({"error": str(e)}), 500

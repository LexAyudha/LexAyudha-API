from flask import request, jsonify
import os
import random
from src.services.EmotionDetectionService import make_emotion_prediction
from src.modelController.EmotionPredictionModel import calculate_emotion_percentages
from datetime import datetime, timedelta
import pymongo

# MongoDB client setup
client = pymongo.MongoClient('mongodb+srv://falcon:UM0S1YXk4ZOvulwi@lexayudhacluster.9ufym.mongodb.net/LexAyudhaDB?retryWrites=true&w=majority&appName=LexAyudhaCluster')
db = client["EmotionDataDB"]
collection = db["history"]

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

        if not all([date, activity_id, student_id]):
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

        # Get all entries for the selected date
        entries = list(collection.find(query).sort("TimeStamp", 1))

        # Calculate hourly averages
        hourly_data = {}
        for entry in entries:
            hour = datetime.strptime(entry["TimeStamp"], "%Y-%m-%d %H:%M:%S").hour
            if hour not in hourly_data:
                hourly_data[hour] = []
            hourly_data[hour].append(entry)

        # Calculate averages for each hour
        hourly_averages = []
        for hour, entries in hourly_data.items():
            percentages = calculate_emotion_percentages(student_id, len(entries))
            hourly_averages.append({
                "hour": hour,
                "percentages": percentages
            })

        # Get all-time data for comparison
        all_time_query = {
            "StudentId": student_id,
            "ActivityId": activity_id
        }
        all_time_entries = list(collection.find(all_time_query).sort("TimeStamp", 1))

        # Calculate all-time averages
        all_time_percentages = calculate_emotion_percentages(student_id, len(all_time_entries))

        return jsonify({
            "hourlyData": hourly_averages,
            "allTimeData": all_time_percentages,
            "dailyData": entries
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

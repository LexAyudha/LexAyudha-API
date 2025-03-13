

from flask import request, jsonify
import os
import random
from src.services.EmotionDetectionService import make_emotion_prediction

def get_emotion_prediction():
    try:
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
            # Use the temporary file for prediction
            result = make_emotion_prediction(temp_file_path,'343434','53545345')

            # Return prediction result
            return jsonify({"prediction": result}), 200

        finally:
            # Clean up temporary files
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            

    except Exception as e:
        return jsonify({"error": str(e)}), 500

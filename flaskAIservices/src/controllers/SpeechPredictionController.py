from flask import request, jsonify
import os
import random
from src.services.SpeechPredictionService import make_prediction

def get_prediction():
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
        temp_audio_path = os.path.join(temp_dir, f"temp_{random_number}.wav")
        temp_img_name =  f"temp_{random_number}.png"
        temp_audio_name =  f"temp_{random_number}.wav"

        # Save the uploaded audio file temporarily
        file.save(temp_audio_path)

        try:
            # Use the temporary file for prediction
            result = make_prediction(temp_dir, temp_audio_path, temp_img_name, temp_audio_name)

            # Return prediction result
            return jsonify({"prediction": result}), 200

        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            if os.path.exists(temp_img_name):
                os.remove(temp_img_name)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

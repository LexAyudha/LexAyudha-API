from flask import request, jsonify
from src.services.SpeechPredictionService import make_prediction

def get_prediction():
    try:
        # Extract input data from the request
        input_data = request.get_json()
        if not input_data:
            return jsonify({"error": "Invalid input"}), 400

        # Get prediction from the service
        result = make_prediction(input_data)
        return jsonify({"prediction": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

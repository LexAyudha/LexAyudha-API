from flask import Flask
from flask_cors import CORS
from src.routes.routes import speach_prediction_route, emotion_detection_route

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register Blueprints
app.register_blueprint(speach_prediction_route, url_prefix="/api")
app.register_blueprint(emotion_detection_route, url_prefix="/emotion")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8005, debug=True)  # Set debug=False in production

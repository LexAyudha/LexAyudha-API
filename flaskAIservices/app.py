from flask import Flask
from src.routes.routes import speach_prediction_route, emotion_detection_route

app = Flask(__name__)

# Register Blueprints - Add your base API route here
app.register_blueprint(speach_prediction_route, url_prefix="/api")
app.register_blueprint(emotion_detection_route, url_prefix="/api")

if __name__ == "__main__":
    
    app.run(debug=True) #Set debug false in production

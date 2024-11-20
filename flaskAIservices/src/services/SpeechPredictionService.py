from src.models.SpeechPredictionModel import load_model, predict_with_model

# Load the model once at service initialization
speechPredict_model = load_model()

def make_prediction(input_data):
    # Use the model to make predictions
    prediction = predict_with_model(speechPredict_model, input_data)
    return prediction

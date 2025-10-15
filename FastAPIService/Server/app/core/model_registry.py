# app/core/model_registry.py
import logging


# ---model-specific imports ---
from app.modelController.SpeechPredictionModel import SpeechRateModel, load_model as load_speech_model
from app.modelController.EmotionPredictionModel import load_model as load_emotion_model
from app.modelController.SentenceGenModel import get_t5_model


class ModelRegistry:
    """Centralized registry to manage and serve loaded models globally."""

    def __init__(self):
        self.models = {}

    # -------------------- REGISTER METHODS -------------------- #
    def register(self, name: str, model):
        """Register a model under a unique name."""
        self.models[name] = model
        logging.info(f"✅ Registered model: {name}")

    def get(self, name: str):
        """Retrieve a model by name."""
        return self.models.get(name, None)

    # -------------------- LOADERS -------------------- #
    def load_emotion_model(self):
        model = load_emotion_model()
        if isinstance(model, dict) and "error" in model:
            logging.error(f"❌ Emotion model failed to load: {model['error']}")
        else:
            self.register("emotion", model)

    def load_speechrate_model(self):
        model = load_speech_model()
        if isinstance(model, dict) and "error" in model:
            logging.error(f"❌ SpeechRate model failed to load: {model['error']}")
        else:
            self.register("speechrate", model)

    def load_t5_model(self):
        """Load and cache the T5 model/tokenizer pair."""
        t5_tokenizer, t5_model = get_t5_model()
        if isinstance(t5_model, dict) and "error" in t5_model:
            logging.error(t5_model["error"])
        else:
            # Bundle tokenizer and model together
            sentence_gen = {
                "tokenizer": t5_tokenizer,
                "model": t5_model
            }
            self.register("sentenceGen", sentence_gen)
            logging.info("✅ T5 model and tokenizer loaded successfully")


# Singleton-style instance (accessible anywhere)
model_registry = ModelRegistry()

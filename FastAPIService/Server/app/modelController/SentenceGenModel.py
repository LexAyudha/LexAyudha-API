from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    BertTokenizer,
    BertForSequenceClassification,
)
import torch
import torch.nn.functional as F
from functools import lru_cache



class MeaningfulnessPredictor:
    """Predicts whether a sentence is meaningful using a fine-tuned BERT model."""

    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[MeaningfulnessPredictor] Using device: {self.device}")

        try:
            self.model = BertForSequenceClassification.from_pretrained(model_path)
            self.tokenizer = BertTokenizer.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()
            print("[MeaningfulnessPredictor] Model loaded successfully")
        except Exception as e:
            raise RuntimeError(f"Error loading BERT model: {e}")

    def predict(self, sentence: str) -> dict:
        """Return model prediction and confidence."""
        encoding = self.tokenizer.encode_plus(
            sentence,
            add_special_tokens=True,
            max_length=128,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)
        token_type_ids = encoding["token_type_ids"].to(self.device)

        with torch.no_grad():
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids,
            )

        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)
        prediction = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][prediction].item()

        return {
            "sentence": sentence,
            "prediction": prediction,
            "prediction_label": "Meaningful" if prediction == 1 else "Not Meaningful",
            "confidence": confidence,
            "is_meaningful": prediction == 1,
        }


@lru_cache(maxsize=1)
def get_t5_model():
    """Load and cache T5 model and tokenizer."""
    print("[T5] Loading flan-t5-small model...")
    tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
    model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
    print("[T5] Model loaded successfully")
    return tokenizer, model


@lru_cache(maxsize=1)
def get_meaningfulness_predictor(model_path: str):
    """Cache BERT model to prevent reloading every request."""
    return MeaningfulnessPredictor(model_path)



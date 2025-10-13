from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    BertTokenizer,
    BertForSequenceClassification,
)
import re
import random
import torch
import torch.nn.functional as F
import asyncio
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


async def generate_meaningful_sentences(
    prompt: str,
    target_word_count: int = 3,
    num_sentences: int = 10,
    max_attempts: int = 50,
    model_path: str | None = None,
):
    """
    Generate multiple meaningful sentences using T5 for generation
    and BERT for meaningfulness validation.
    """

    tokenizer, model = get_t5_model()
    meaningfulness_predictor = (
        get_meaningfulness_predictor(model_path) if model_path else None
    )

    meaningful_sentences = []
    tried_sentences = set()
    attempts = 0
    strategy_index = 0
    batch_size = 3

    example_prompts = [
        f"Write 10 examples of {target_word_count}-word sentences suitable for children:",
        f"List {target_word_count}-word sentences suitable for children:",
        f"Generate {target_word_count} word sentences suitable for children:",
        f"Complete sentences suitable for children with exactly {target_word_count} words:",
    ]

    seed_phrases = {
        3: ["The dog barks.", "I love you.", "Birds fly high.", "She went home.", "They are happy."],
        4: ["The cat is sleeping.", "They went to school.", "I like the beach.", "She reads good books."],
        5: ["The children play at school.", "I went to the store.", "She likes to read books."],
    }.get(target_word_count, [])

    examples = random.sample(seed_phrases, min(3, len(seed_phrases))) if seed_phrases else []
    examples_text = "\n".join(examples)

    strategies = [
        lambda: f"{random.choice(example_prompts)}\n{examples_text}",
        lambda: f"Complete the following list of {target_word_count}-word sentences suitable for children:\n{examples_text}\n",
        lambda: f"{prompt} Each sentence suitable for children must have exactly {target_word_count} words.\nExamples:\n{examples_text}\n",
    ]

    while len(meaningful_sentences) < num_sentences and attempts < max_attempts:
        strategy = strategies[strategy_index % len(strategies)]
        specific_prompt = strategy()
        strategy_index += 1

        input_ids = tokenizer(specific_prompt, return_tensors="pt").input_ids

        # Run generation asynchronously on a background thread (non-blocking)
        outputs = await asyncio.to_thread(
            model.generate,
            input_ids,
            max_length=150,
            min_length=15,
            temperature=1.0,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            num_return_sequences=batch_size,
            no_repeat_ngram_size=2,
        )

        for output in outputs:
            generated_text = tokenizer.decode(output, skip_special_tokens=True).strip()
            candidates = re.split(r"[.!?]+", generated_text) + generated_text.split("\n")

            for sentence in candidates:
                if len(meaningful_sentences) >= num_sentences:
                    break

                clean_sentence = re.sub(r"^\d+[\.\)]\s*|^[-*•]\s*", "", sentence.strip())
                if not clean_sentence:
                    continue

                if not clean_sentence.endswith(('.', '!', '?')):
                    clean_sentence += '.'

                words = re.findall(r"\b\w+\b", clean_sentence)
                if len(words) != target_word_count:
                    continue

                clean_sentence = clean_sentence[0].upper() + clean_sentence[1:] if clean_sentence[0].islower() else clean_sentence

                if clean_sentence in tried_sentences:
                    continue

                tried_sentences.add(clean_sentence)

                is_meaningful = True
                if meaningfulness_predictor:
                    result = meaningfulness_predictor.predict(clean_sentence)
                    is_meaningful = result["is_meaningful"]

                if is_meaningful:
                    meaningful_sentences.append(clean_sentence)

            if len(meaningful_sentences) >= num_sentences:
                break

        attempts += 1

    # Fallback if not enough sentences
    if len(meaningful_sentences) < num_sentences:
        fallback_templates = {
            3: ["The dog barks.", "I love you.", "Birds fly high."],
            4: ["The cat is sleeping.", "They went to school."],
            5: ["The children play at school.", "I went to the store."],
        }.get(target_word_count, [])

        for sentence in fallback_templates:
            if len(meaningful_sentences) >= num_sentences:
                break
            meaningful_sentences.append(sentence)

    return meaningful_sentences

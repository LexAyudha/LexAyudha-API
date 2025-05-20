from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, BertTokenizer, BertForSequenceClassification
import re
import random
import torch
import torch.nn.functional as F

class MeaningfulnessPredictor:
    def __init__(self, model_path):
        """
        Initialize the predictor with a saved BERT model

        Args:
            model_path (str): Path to the saved model directory
        """
        # Check for GPU availability
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")

        # Load the saved model and tokenizer
        try:
            self.model = BertForSequenceClassification.from_pretrained(model_path)
            self.tokenizer = BertTokenizer.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()  # Set the model to evaluation mode
            print("BERT model and tokenizer loaded successfully!")
        except Exception as e:
            print(f"Error loading BERT model: {e}")
            raise

    def predict(self, sentence, verbose=True):
        """
        Predict if a sentence is meaningful or not

        Args:
            sentence (str): The input sentence
            verbose (bool): Whether to print detailed output

        Returns:
            dict: Dictionary containing prediction results
        """
        # Tokenize the input sentence
        encoding = self.tokenizer.encode_plus(
            sentence,
            add_special_tokens=True,
            max_length=128,
            return_token_type_ids=True,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        # Move tensors to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        token_type_ids = encoding['token_type_ids'].to(self.device)

        # Make prediction
        with torch.no_grad():
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids
            )

        # Process the output
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)
        prediction = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][prediction].item()

        # Create result dictionary
        result = {
            'sentence': sentence,
            'prediction': prediction,
            'prediction_label': "Meaningful" if prediction == 1 else "Not Meaningful",
            'confidence': confidence,
            'is_meaningful': prediction == 1  # Add boolean for easier checking
        }

        # Print results if verbose
        if verbose:
            print(f"\nSentence: '{sentence}'")
            print(f"Prediction: {result['prediction_label']} (Confidence: {confidence:.4f})")

        return result

def generate_meaningful_sentences(prompt, target_word_count=3, num_sentences=10, max_attempts=50, model_path=None):
    """
    Generates multiple meaningful sentences with a specified word count.
    Uses BERT model to validate meaningfulness of sentences.

    Parameters:
        prompt (str): The prompt to guide sentence generation.
        target_word_count (int): Desired number of words in each generated sentence.
        num_sentences (int): Number of sentences to generate.
        max_attempts (int): Maximum number of attempts to get enough meaningful sentences.
        model_path (str): Path to the BERT model for meaningfulness prediction.

    Returns:
        list: A list of generated meaningful sentences with the specified word count.
    """
    # Load the T5 model for sentence generation
    print("Loading T5 model for sentence generation...")
    model_name = "google/flan-t5-small"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    print("T5 model loaded successfully!")

    # Initialize BERT meaningfulness predictor
    if model_path:
        print("Initializing BERT meaningfulness predictor...")
        meaningfulness_predictor = MeaningfulnessPredictor(model_path)
    else:
        print("WARNING: No BERT model path provided. All sentences will be considered meaningful.")
        meaningfulness_predictor = None

    # List to store final meaningful sentences
    meaningful_sentences = []

    # Define explicit example prompts specifically for short sentences
    example_prompts = [
        f"Write 10 examples of {target_word_count}-word sentences suitable for children:",
        f"List {target_word_count}-word sentences suitable for children:",
        f"Generate {target_word_count} word sentences suitable for children. Examples:",
        f"Complete sentences suitable for children with exactly {target_word_count} words:"
    ]

    # Define some seed phrase starts to help guide generation
    seed_phrases = []
    if target_word_count == 3:
        seed_phrases = [
            "The dog barks.",
            "I love you.",
            "Birds fly high.",
            "She went home.",
            "They are happy."
        ]
    elif target_word_count == 4:
        seed_phrases = [
            "The cat is sleeping.",
            "They went to school.",
            "I like the beach.",
            "She reads good books."
        ]
    elif target_word_count == 5:
        seed_phrases = [
            "The children play at school.",
            "I went to the store.",
            "She likes to read books."
        ]

    # Add examples to the prompt
    examples = random.sample(seed_phrases, min(3, len(seed_phrases))) if seed_phrases else []
    examples_text = "\n".join(examples)

    # Try different prompt strategies
    strategies = [
        # Strategy 1: Direct instruction with examples
        lambda: f"{random.choice(example_prompts)}\n{examples_text}",

        # Strategy 2: Completion format
        lambda: f"Complete the following list of {target_word_count}-word sentences suitable for children:\n{examples_text}\n",

        # Strategy 3: Using the provided prompt
        lambda: f"{prompt} Each sentence suitable for children must have exactly {target_word_count} words.\n\nExamples:\n{examples_text}\n"
    ]

    # Keep track of sentences we've already tried to avoid duplicates
    tried_sentences = set()

    # Keep trying until we have enough sentences or reach max attempts
    attempts = 0
    strategy_index = 0
    batch_size = 3  # Number of sentences to generate in each batch

    while len(meaningful_sentences) < num_sentences and attempts < max_attempts:
        # Select and rotate through strategies
        current_strategy = strategies[strategy_index % len(strategies)]
        specific_prompt = current_strategy()
        strategy_index += 1

        # Encode the input prompt
        input_ids = tokenizer(specific_prompt, return_tensors="pt").input_ids

        # Generate text with appropriate settings for short sentences
        outputs = model.generate(
            input_ids,
            max_length=150,
            min_length=15,
            temperature=1.0,  # Higher temperature for more variety
            do_sample=True,
            top_k=50,
            top_p=0.95,
            num_return_sequences=batch_size,  # Generate multiple sequences at once
            no_repeat_ngram_size=2,  # Avoid repetition
        )

        # Process each output
        for output in outputs:
            generated_text = tokenizer.decode(output, skip_special_tokens=True).strip()

            # Extract and clean candidate sentences
            # Look for complete sentences ending with punctuation
            candidate_sentences = re.split(r'[.!?]+', generated_text)

            # Also look for lines that might be formatted as a list
            line_candidates = generated_text.split('\n')
            candidate_sentences.extend(line_candidates)

            # Process each candidate
            for sentence in candidate_sentences:
                if len(meaningful_sentences) >= num_sentences:
                    break

                # Clean up the sentence
                clean_sentence = sentence.strip()

                # Remove any list markers (numbers, bullets, etc.)
                clean_sentence = re.sub(r'^\d+[\.\)]\s*', '', clean_sentence)
                clean_sentence = re.sub(r'^[-*•]\s*', '', clean_sentence)

                if not clean_sentence:
                    continue

                # Make sure it ends with punctuation
                if clean_sentence and not clean_sentence[-1] in '.!?':
                    clean_sentence += '.'

                # Count words (sequences of word characters)
                words = re.findall(r'\b\w+\b', clean_sentence)

                if len(words) == target_word_count:
                    # Capitalize first letter if needed
                    if clean_sentence and clean_sentence[0].islower():
                        clean_sentence = clean_sentence[0].upper() + clean_sentence[1:]

                    # Skip if we've already tried this sentence
                    if clean_sentence in tried_sentences:
                        continue

                    tried_sentences.add(clean_sentence)

                    # Check if the sentence is meaningful
                    is_meaningful = True
                    if meaningfulness_predictor:
                        result = meaningfulness_predictor.predict(clean_sentence, verbose=False)
                        is_meaningful = result['is_meaningful']
                        print(f"Sentence: '{clean_sentence}' - {result['prediction_label']} (Confidence: {result['confidence']:.4f})")

                    # Add to our list if it's meaningful
                    if is_meaningful:
                        meaningful_sentences.append(clean_sentence)
                        print(f"Added meaningful sentence: '{clean_sentence}'")

                    # Stop if we've reached the desired number
                    if len(meaningful_sentences) >= num_sentences:
                        break

            if len(meaningful_sentences) >= num_sentences:
                break

        attempts += 1

    # If we still don't have enough sentences, create some basic ones as fallback
    if len(meaningful_sentences) < num_sentences:


        # Define basic sentence templates based on word count
        if target_word_count == 3:
            templates = [
                ["The", "dog", "barks."],
                ["I", "love", "you."],
                ["Birds", "fly", "high."],
                ["She", "sleeps", "peacefully."],
                ["They", "run", "fast."],
                ["He", "reads", "books."],
                ["Cats", "like", "milk."],
                ["We", "are", "happy."],
                ["Trees", "grow", "tall."],
                ["Children", "play", "outside."]
            ]
        elif target_word_count == 4:
            templates = [
                ["The", "dog", "barks", "loudly."],
                ["I", "love", "my", "job."],
                ["Birds", "fly", "very", "high."],
                ["She", "reads", "good", "books."],
                ["They", "run", "every", "day."]
            ]
        elif target_word_count == 5:
            templates = [
                ["The", "dog", "barks", "at", "night."],
                ["I", "love", "to", "eat", "pizza."],
                ["Birds", "fly", "south", "for", "winter."],
                ["She", "likes", "to", "read", "books."],
                ["They", "go", "to", "school", "daily."]
            ]
        else:
            templates = [[f"Word{i+1}" for i in range(target_word_count-1)] + ["."]]

        # Shuffle the templates
        random.shuffle(templates)

        # Add templates until we have enough sentences
        fallback_count = 0
        for template in templates:
            if len(meaningful_sentences) >= num_sentences:
                break

            sentence = " ".join(template)
            # Remove space before punctuation if needed
            sentence = re.sub(r'\s+([.!?])', r'\1', sentence)

            if sentence not in tried_sentences:
                tried_sentences.add(sentence)

                # Check if the sentence is meaningful
                is_meaningful = True
                if meaningfulness_predictor:
                    result = meaningfulness_predictor.predict(sentence, verbose=False)
                    is_meaningful = result['is_meaningful']


                # Add to our list if it's meaningful
                if is_meaningful:
                    meaningful_sentences.append(sentence)
                    fallback_count += 1

    # Return the results with a status message
    if len(meaningful_sentences) == num_sentences:

        return meaningful_sentences
    else:
        print(f"\nWarning: Could only generate {len(meaningful_sentences)} valid meaningful sentences " +
              f"out of the requested {num_sentences} after {attempts} attempts.")
        return meaningful_sentences

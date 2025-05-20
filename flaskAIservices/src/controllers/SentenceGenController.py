from flask import request, jsonify
from src.modelController.SentenceGenModel import generate_meaningful_sentences
from threading import Lock
import queue
import logging

# Initialize request queue and lock
request_queue = queue.Queue(maxsize=10)  # Limit concurrent requests
model_lock = Lock()  # Ensure model access is thread-safe
logger = logging.getLogger(__name__)

def generate_sentences():
    try:
        # Check if queue is full
        if request_queue.full():
            return jsonify({
                'error': 'Server is busy',
                'message': 'Please try again in a few moments'
            }), 503

        # Get and validate parameters
        word_length = request.args.get('word_length', type=int)
        sentence_count = request.args.get('sentence_count', type=int)

        if not word_length or not sentence_count:
            return jsonify({
                'error': 'Missing required parameters'
            }), 400

        # Add request to queue
        request_queue.put(1)  # Add request marker
        try:
            with model_lock:  # Ensure exclusive model access
                model_path = "src/assets/bert_model"
                prompt = "Generate complete and grammatically correct sentences suitable for children, ensuring it is safe, age-appropriate, engaging and that are meaningful."
                
                result = generate_meaningful_sentences(
                    prompt=prompt,
                    target_word_count=word_length,
                    num_sentences=sentence_count,
                    model_path=model_path
                )

                return jsonify({
                    'success': True,
                    'sentences': result
                }), 200

        finally:
            # Always remove request from queue
            request_queue.get()
            request_queue.task_done()

    except Exception as e:
        logger.error(f"Error generating sentences: {str(e)}")
        return jsonify({
            'error': 'Failed to generate sentences',
            'message': str(e)
        }), 500
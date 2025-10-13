from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from app.modelController.SentenceGenModel import generate_meaningful_sentences
from threading import Lock
import queue
import logging

# Initialize request queue and lock
request_queue = queue.Queue(maxsize=10)  # Limit concurrent requests
model_lock = Lock()  # Ensure model access is thread-safe
logger = logging.getLogger(__name__)

async def generate_sentences(word_length, sentence_count):
    try:
        # Check if queue is full
        if request_queue.full():
            return JSONResponse(
                {
                    "error": "Server is busy",
                    "message": "Please try again in a few moments"
                },
                status_code=503
            )

        # Add request to queue
        request_queue.put(1)
        try:
            # Ensure exclusive model access
            with model_lock:
                model_path = "app/assets/bert_model"
                prompt = (
                    "Generate complete and grammatically correct sentences suitable for children. "
                    "Ensure the output is safe, age-appropriate, engaging, and meaningful."
                )

                result = await generate_meaningful_sentences(
                    prompt=prompt,
                    target_word_count=word_length,
                    num_sentences=sentence_count,
                    model_path=model_path
                )

                logger.info(f"Generated Sentences: {result}")

                return JSONResponse(
                    {"success": True, "sentences": result},
                    status_code=200
                )

        finally:
            # Always remove request marker
            request_queue.get()
            request_queue.task_done()

    except Exception as e:
        logger.error(f"Error generating sentences: {str(e)}")
        return JSONResponse(
            {
                "error": "Failed to generate sentences",
                "message": str(e)
            },
            status_code=500
        )

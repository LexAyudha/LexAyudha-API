from typing import Union
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import logging
import sys
from fastapi.middleware.cors import CORSMiddleware
from app.routes.routes import speach_prediction_route, emotion_detection_route, health_check_route, sentence_generation_route

# FastAPI app initialization with lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code here
    logging.info("Starting up...")
    yield
    # Shutdown code here
    logging.info("Shutting down...")


app = FastAPI(lifespan=lifespan, title="AI API", debug=True)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Gloabal exception handler
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        # Get just the last frame of the traceback
        tb = e.__traceback__
        while tb.tb_next:
            tb = tb.tb_next
            
        error_location = f"{tb.tb_frame.f_code.co_filename}:{tb.tb_lineno} in {tb.tb_frame.f_code.co_name}"
        logger.error(f"Error in {error_location}: {str(e)}")
        
        if app.debug:
            return JSONResponse(
                status_code=500,
                content={
                    "error": str(e),
                    "location": error_location
                }
            )
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )


app.middleware('http')(catch_exceptions_middleware)

# CORS origins
origins = [
    "http://localhost",
    "http://localhost:3000",
]
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_check_route)
app.include_router(speach_prediction_route, prefix="/api")
app.include_router(emotion_detection_route, prefix="/emotion")
app.include_router(sentence_generation_route, prefix="/sentence")
logger.info("Routes registered successfully.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005, reload=True)
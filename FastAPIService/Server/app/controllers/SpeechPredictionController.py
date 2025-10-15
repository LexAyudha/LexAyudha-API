from fastapi import Request, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import random
from app.services.SpeechPredictionService import make_prediction

async def get_prediction(request: Request):
    try:
        # Parse form data (for multipart/form-data uploads)
        form = await request.form()
        file: UploadFile = form.get("file")

        if not file:
            return JSONResponse({"error": "No file part in the request"}, status_code=400)
        if file.filename == "":
            return JSONResponse({"error": "No selected file"}, status_code=400)

        # Generate random number for temp file name
        random_number = random.randint(1000, 9999)

        # Define temp directory dynamically
        base_dir = os.path.dirname(os.path.abspath(__file__))
        temp_dir = os.path.join(base_dir, "../assets/temp")
        os.makedirs(temp_dir, exist_ok=True)

        temp_audio_path = os.path.join(temp_dir, f"temp_{random_number}.wav")
        temp_img_name = f"temp_{random_number}.png"
        temp_audio_name = f"temp_{random_number}.wav"

        # Save uploaded audio
        with open(temp_audio_path, "wb") as buffer:
            buffer.write(await file.read())

        try:
            # Run prediction
            result = make_prediction(temp_dir, temp_audio_path, temp_img_name, temp_audio_name)
            return JSONResponse({"prediction": result}, status_code=200)

        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            img_path = os.path.join(temp_dir, temp_img_name)
            if os.path.exists(img_path):
                os.remove(img_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

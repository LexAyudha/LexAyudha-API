from fastapi import APIRouter, Request, UploadFile, File, HTTPException, Body, Header, Query
from fastapi.responses import JSONResponse
import os
import random
from app.services.EmotionDetectionService import make_emotion_prediction
from app.modelController.EmotionPredictionModel import calculate_emotion_percentages
from datetime import datetime, timedelta
import pymongo
from bson import ObjectId
import google.generativeai as genai
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import base64
from app.core.settings import settings

router = APIRouter(prefix="/v1/emotion", tags=["Emotion Detection"])

# Gemini API setup
GOOGLE_API_KEY = settings.GOOGLE_API_KEY
genai.configure(api_key=GOOGLE_API_KEY)

# Email configuration
SMTP_SERVER = settings.SMTP_SERVER
SMTP_PORT = settings.SMTP_PORT
SMTP_USERNAME = settings.SMTP_USERNAME
SMTP_PASSWORD = settings.SMTP_PASSWORD

# MongoDB
client = pymongo.MongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]
collection = db[settings.MONGO_DB_COLLECTION]


def convert_to_serializable(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj


def generate_student_summary(analytics_data):
    try:
        prompt = f"""
        Analyze this student's emotion data and provide a concise summary of their progress and areas for improvement:
        Activity: {analytics_data.get('activity_name', 'Unknown')}
        Total Sessions: {analytics_data['allTimeData']['total']}
        Emotion Distribution:
        {json.dumps(analytics_data['allTimeData']['emotions'], indent=2)}
        Emotion Class Distribution:
        - Engagement: {analytics_data['allTimeData']['engagement']}%
        - Frustration: {analytics_data['allTimeData']['frustration']}%
        - Distraction: {analytics_data['allTimeData']['distraction']}%
        Daily Trend: {json.dumps(analytics_data['allTimeData']['dailyTrend'], indent=2)}
        Provide:
        1. A brief summary of emotional engagement
        2. Key areas of improvement
        3. Recommendations for better engagement
        """
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Unable to generate summary at this time."


@router.post("/predict")
async def get_emotion_prediction(
    request: Request,
    student_id: str,
    activity_id: str
):
    try:
        print(f"Header - {request.headers}")
        form = await request.form()
        
        file: UploadFile = form.get("file")

        print(f"Received file: {file.filename}, File Size: {file.size}, student_id: {student_id}, activity_id: {activity_id}")
        
        if not student_id or not activity_id:
            return JSONResponse({"error": "Student ID and Activity ID are required"}, status_code=400)

        random_number = random.randint(1000, 9999)
        temp_dir = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "assets", "temp"))
        os.makedirs(temp_dir, exist_ok=True)

        print(f"Temporary directory: {temp_dir}")

        temp_file_path = os.path.join(temp_dir, f"emo_temp_{random_number}.png")

        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())

        try:
            result = make_emotion_prediction(temp_file_path, student_id, activity_id)
            return JSONResponse({"prediction": result}, status_code=200)
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_activity_analytics(
    date: str = Query(...),
    activity_id: str = Query(...),
    student_id: str = Query(...)
):
    try:
        selected_date = datetime.strptime(date, '%Y-%m-%d')
        next_day = selected_date + timedelta(days=1)

        query = {
            "StudentId": student_id,
            "ActivityId": activity_id,
            "TimeStamp": {"$gte": selected_date.strftime("%Y-%m-%d %H:%M:%S"),
                          "$lt": next_day.strftime("%Y-%m-%d %H:%M:%S")}
        }

        entries = list(collection.find(query).sort("TimeStamp", 1))
        all_time_entries = list(collection.find({
            "StudentId": student_id,
            "ActivityId": activity_id
        }).sort("TimeStamp", 1))

        if not all_time_entries:
            return JSONResponse({
                "hourlyData": [],
                "allTimeData": {"emotions": {}, "total": 0, "engagement": 0, "frustration": 0, "distraction": 0, "dailyTrend": {}},
                "dailyData": [],
                "studentSummary": "No data available for analysis."
            }, status_code=200)

        all_time_emotions = {}
        for entry in all_time_entries:
            emotion = entry["Emotion"]
            all_time_emotions[emotion] = all_time_emotions.get(emotion, 0) + 1

        total_entries = len(all_time_entries)
        percentages = {"engagement": 0, "frustration": 0, "distraction": 0}
        if total_entries > 0:
            for emotion, count in all_time_emotions.items():
                pct = (count / total_entries) * 100
                if emotion in ["happy", "neutral"]:
                    percentages["engagement"] += pct
                elif emotion in ["angry", "sad", "fear"]:
                    percentages["frustration"] += pct
                elif emotion in ["surprise", "disgust"]:
                    percentages["distraction"] += pct
        percentages = {k: round(v, 2) for k, v in percentages.items()}

        daily_trend = {}
        for entry in all_time_entries:
            day = entry["TimeStamp"].split(" ")[0]
            if day not in daily_trend:
                daily_trend[day] = {}
            emotion = entry["Emotion"]
            daily_trend[day][emotion] = daily_trend[day].get(emotion, 0) + 1

        all_time_data = {
            "emotions": all_time_emotions,
            "total": total_entries,
            "engagement": percentages["engagement"],
            "frustration": percentages["frustration"],
            "distraction": percentages["distraction"],
            "dailyTrend": daily_trend
        }

        serialized_entries = convert_to_serializable(entries)
        summary_data = {
            "activity_name": "Number Recognition",
            "allTimeData": all_time_data,
            "dailyData": serialized_entries
        }

        student_summary = generate_student_summary(summary_data)
        response_data = {
            "hourlyData": [],
            "allTimeData": all_time_data,
            "dailyData": serialized_entries,
            "studentSummary": student_summary
        }

        return JSONResponse(response_data, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-report")
async def send_report(data: dict = Body(...)):
    try:
        recipient_email = data.get('email')
        report_data = data.get('reportData')
        pdf_base64 = data.get('pdfData')

        if not all([recipient_email, report_data, pdf_base64]):
            return JSONResponse({"error": "Missing required data"}, status_code=400)

        pdf_data = base64.b64decode(pdf_base64.split(',')[1])

        success = send_email_report(recipient_email, report_data, pdf_data)
        if success:
            return JSONResponse({"message": "Report sent successfully"}, status_code=200)
        return JSONResponse({"error": "Failed to send report"}, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def send_email_report(recipient_email, report_data, pdf_data):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = f"Student Emotion Analytics Report - {report_data['date']}"

        body = f"""
        Dear User,
        Please find attached the emotion analytics report.
        Report Details:
        - Date: {report_data['date']}
        - Activity: {report_data['activity_name']}
        - Total Sessions: {report_data['total_sessions']}
        Summary:
        {report_data['summary']}
        Best regards,
        LexAyudha Team
        """
        msg.attach(MIMEText(body, 'plain'))

        pdf_attachment = MIMEApplication(pdf_data, _subtype='pdf')
        pdf_attachment.add_header('Content-Disposition', 'attachment',
                                  filename=f"emotion-analytics-report-{report_data['date']}.pdf")
        msg.attach(pdf_attachment)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


@router.post("/reset")
async def reset_emotion_data(student_id: str = Header(None), activity_id: str = Header(None)):
    try:
        if not student_id or not activity_id:
            return JSONResponse({"error": "Student ID and Activity ID are required"}, status_code=400)

        collection.delete_many({"StudentId": student_id, "ActivityId": activity_id})
        return JSONResponse({
            "message": "Emotion data reset successfully",
            "percentages": {"frustration": 0, "distraction": 0, "engagement": 0}
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-percentages")
async def reset_emotion_percentages(student_id: str = Header(None)):
    try:
        if not student_id:
            return JSONResponse({"error": "Student ID is required"}, status_code=400)

        return JSONResponse({
            "message": "Emotion percentages reset successfully",
            "percentages": {"frustration": 0, "distraction": 0, "engagement": 0},
            "alert": None
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

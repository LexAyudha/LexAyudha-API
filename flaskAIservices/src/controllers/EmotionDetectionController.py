from flask import request, jsonify, Blueprint
import os
import random
from src.services.EmotionDetectionService import make_emotion_prediction
from src.modelController.EmotionPredictionModel import calculate_emotion_percentages
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

# Create blueprint
emotion_detection_route = Blueprint("emotionDetectionRoute", __name__)

# Configure Gemini API
GOOGLE_API_KEY = "AIzaSyCtXOk4Qs3a3L1oOh_5yJbXgz_52r14P_g"  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "lexayudha@gmail.com"  # Replace with your email
SMTP_PASSWORD = "your_app_password"  # Replace with your app password

# MongoDB client setup
client = pymongo.MongoClient('mongodb+srv://falcon:UM0S1YXk4ZOvulwi@lexayudhacluster.9ufym.mongodb.net/LexAyudhaDB?retryWrites=true&w=majority&appName=LexAyudhaCluster')
db = client["EmotionDataDB"]
collection = db["history"]

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
        # Prepare the prompt for Gemini
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
        
        Please provide:
        1. A brief summary of the student's emotional engagement
        2. Key areas of improvement
        3. Recommendations for better engagement
        Keep the response concise and focused on actionable insights.
        """

        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Unable to generate summary at this time."

def get_emotion_prediction():
    try:
        # Get student ID and activity ID from headers
        student_id = request.headers.get('Student-Id')
        activity_id = request.headers.get('Activity-Id')

        if not student_id or not activity_id:
            return jsonify({"error": "Student ID and Activity ID are required"}), 400

        # Check if a file is part of the request
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        # Retrieve the file
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Generate a random number for a unique file name
        random_number = random.randint(1000, 9999)

        # Define the temp directory dynamically
        base_dir = os.path.dirname(os.path.abspath(__file__))  # Get current script directory
        temp_dir = os.path.join(base_dir, "../assets/temp")  # Adjust path to temp directory

        # Ensure the temp directory exists
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Define temporary file names
        temp_file_path = os.path.join(temp_dir, f"emo_temp_{random_number}.png")

        # Save the uploaded audio file temporarily
        file.save(temp_file_path)

        try:
            # Use the temporary file for prediction with student and activity IDs
            result = make_emotion_prediction(temp_file_path, student_id, activity_id)

            # Return prediction result
            return jsonify({"prediction": result}), 200

        finally:
            # Clean up temporary files
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_activity_analytics():
    try:
        date = request.args.get('date')
        activity_id = request.args.get('activityId')
        student_id = request.args.get('studentId')

        print(f"Received request with params: date={date}, activityId={activity_id}, studentId={student_id}")

        if not all([date, activity_id, student_id]):
            print("Missing required parameters")
            return jsonify({"error": "Date, activity ID, and student ID are required"}), 400

        # Convert date string to datetime
        selected_date = datetime.strptime(date, '%Y-%m-%d')
        next_day = selected_date + timedelta(days=1)

        # Query for specific date and activity
        query = {
            "StudentId": student_id,
            "ActivityId": activity_id,
            "TimeStamp": {
                "$gte": selected_date.strftime("%Y-%m-%d %H:%M:%S"),
                "$lt": next_day.strftime("%Y-%m-%d %H:%M:%S")
            }
        }

        print(f"MongoDB query: {query}")

        # Get all entries for the selected date
        entries = list(collection.find(query).sort("TimeStamp", 1))
        print(f"Found {len(entries)} entries for selected date")

        # Get all-time entries for the activity and student
        all_time_query = {
            "StudentId": student_id,
            "ActivityId": activity_id
        }
        all_time_entries = list(collection.find(all_time_query).sort("TimeStamp", 1))
        print(f"Found {len(all_time_entries)} all-time entries")

        # If no data is found, return early with empty data
        if not all_time_entries:
            return jsonify({
                "hourlyData": [],
                "allTimeData": {
                    "emotions": {},
                    "total": 0,
                    "engagement": 0,
                    "frustration": 0,
                    "distraction": 0,
                    "dailyTrend": {}
                },
                "dailyData": [],
                "studentSummary": "No data available for analysis."
            }), 200

        # Calculate all-time emotion distribution
        all_time_emotions = {}
        for entry in all_time_entries:
            emotion = entry["Emotion"]
            all_time_emotions[emotion] = all_time_emotions.get(emotion, 0) + 1

        # Calculate all-time emotion percentages
        total_entries = len(all_time_entries)
        all_time_percentages = {
            "engagement": 0,
            "frustration": 0,
            "distraction": 0
        }

        if total_entries > 0:
            # Calculate percentages based on emotion categories
            for emotion, count in all_time_emotions.items():
                percentage = (count / total_entries) * 100
                if emotion in ["happy", "neutral"]:
                    all_time_percentages["engagement"] += percentage
                elif emotion in ["angry", "sad", "fear"]:
                    all_time_percentages["frustration"] += percentage
                elif emotion in ["surprise", "disgust"]:
                    all_time_percentages["distraction"] += percentage

        # Round all percentages to 2 decimal places
        all_time_percentages = {k: round(v, 2) for k, v in all_time_percentages.items()}

        # Calculate daily trend for all-time data
        daily_trend = {}
        for entry in all_time_entries:
            date = entry["TimeStamp"].split(" ")[0]
            if date not in daily_trend:
                daily_trend[date] = {}
            emotion = entry["Emotion"]
            daily_trend[date][emotion] = daily_trend[date].get(emotion, 0) + 1

        # Prepare all-time data
        all_time_data = {
            "emotions": all_time_emotions,
            "total": total_entries,
            "engagement": all_time_percentages["engagement"],
            "frustration": all_time_percentages["frustration"],
            "distraction": all_time_percentages["distraction"],
            "dailyTrend": daily_trend
        }

        # Convert MongoDB documents to JSON-serializable format
        serialized_entries = convert_to_serializable(entries)
        
        # Only generate summary if we have enough data
        if total_entries > 0:
            # Prepare data for summary generation
            summary_data = {
                "activity_name": "Number Recognition",  # You might want to fetch this from your database
                "allTimeData": all_time_data,
                "dailyData": serialized_entries
            }
            
            # Generate summary using Gemini
            student_summary = generate_student_summary(summary_data)
        else:
            student_summary = "No data available for analysis."
        
        response_data = {
            "hourlyData": [],  # Keep this for backward compatibility
            "allTimeData": all_time_data,
            "dailyData": serialized_entries,
            "studentSummary": student_summary
        }
        print(f"Returning response: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error in get_activity_analytics: {str(e)}")
        return jsonify({"error": str(e)}), 500

def send_email_report(recipient_email, report_data, pdf_data):
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = f"Student Emotion Analytics Report - {report_data['date']}"

        # Add body
        body = f"""
        Dear User,

        Please find attached the emotion analytics report for the student.
        
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

        # Attach PDF
        pdf_attachment = MIMEApplication(pdf_data, _subtype='pdf')
        pdf_attachment.add_header('Content-Disposition', 'attachment', 
                                filename=f"emotion-analytics-report-{report_data['date']}.pdf")
        msg.attach(pdf_attachment)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

@emotion_detection_route.route("/send-report", methods=["POST"])
def send_report():
    try:
        data = request.json
        recipient_email = data.get('email')
        report_data = data.get('reportData')
        pdf_base64 = data.get('pdfData')

        if not all([recipient_email, report_data, pdf_base64]):
            return jsonify({"error": "Missing required data"}), 400

        # Decode base64 PDF data
        pdf_data = base64.b64decode(pdf_base64.split(',')[1])

        # Send email
        success = send_email_report(recipient_email, report_data, pdf_data)

        if success:
            return jsonify({"message": "Report sent successfully"}), 200
        else:
            return jsonify({"error": "Failed to send report"}), 500

    except Exception as e:
        print(f"Error in send_report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@emotion_detection_route.route("/reset", methods=["POST"])
def reset_emotion_data():
    try:
        # Get student ID and activity ID from headers
        student_id = request.headers.get('Student-Id')
        activity_id = request.headers.get('Activity-Id')

        if not student_id or not activity_id:
            return jsonify({"error": "Student ID and Activity ID are required"}), 400

        # Delete all emotion data for this student and activity
        collection.delete_many({
            "StudentId": student_id,
            "ActivityId": activity_id
        })

        return jsonify({
            "message": "Emotion data reset successfully",
            "percentages": {
                "frustration": 0,
                "distraction": 0,
                "engagement": 0
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

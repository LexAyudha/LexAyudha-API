from pydantic import AnyUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Google API Key
    GOOGLE_API_KEY: str = "AIzaSyCtXOk4Qs3a3L1oOh_5yJbXgz_52r14P_g"
    
    # SMTP settings
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT : int = 587
    SMTP_USERNAME : str = "lexayudha@gmail.com"
    SMTP_PASSWORD : str = "your_app_password"

    # MongoDB settings - Emotions - controller
    MONGO_URI: str = "mongodb+srv://falcon:UM0S1YXk4ZOvulwi@lexayudhacluster.9ufym.mongodb.net/LexAyudhaDB?retryWrites=true&w=majority&appName=LexAyudhaCluster"
    MONGO_DB_NAME: str = "EmotionDataDB"
    MONGO_DB_COLLECTION: str = "history"

    # MongoDB settings - emotions - service
    MONGO_EMOTION_SERVICE_URI: str = "mongodb+srv://lexayudha:lex123@cluster0.pvr0d.mongodb.net/lexayudha?retryWrites=true&w=majority"

    # RabbitMQ settings
    RABBITMQ_URL: str = "amqp://falbot:falbot@localhost:5672/" #change back to rabbitmq for docker
    MD_QUEUE: str = "convert_md_queue"
    # security knobs
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

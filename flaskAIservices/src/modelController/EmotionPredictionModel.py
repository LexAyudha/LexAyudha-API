import os

import datetime
import cv2 as cv
import numpy as np
import pandas as pd
import tensorflow as tf
from deepface import DeepFace
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def load_model():
    """
    Load the AI model from a .pth file with error handling.
    """
    try:
        
        model_emotion = tf.keras.models.load_model('src/assets/emotion_model.h5')
        model_emotion.compile(
                    optimizer=tf.keras.optimizers.Adam(),
                    loss='categorical_crossentropy',
                    metrics=[
                            tf.keras.metrics.CategoricalAccuracy(),
                            tf.keras.metrics.Precision(),
                            tf.keras.metrics.Recall(),
                            tf.keras.metrics.AUC()
                            ]
                    )


        return model_emotion
    
    except Exception as e:
        # Handle any exception that occurs during loading
        return {"error": f"An error occurred while loading the model: {str(e)}"}

def predict_with_model(img_path):
    """
    Use the loaded model to predict speech rate.
    """
    try:
       
        objs = DeepFace.analyze(
                            img_path = img_path, 
                            actions = ['emotion'],
                            enforce_detection=False
                            )
        if len(objs) > 0:
            emotion_dict = objs[0]['emotion']
            emotion = max(emotion_dict, key=emotion_dict.get)
            return emotion
        else:
            return None
        

    except Exception as e:
      
        return {"error": f"An error occurred during prediction: {str(e)}"}


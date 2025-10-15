from app.modelController.SpeechPredictionModel import predict_with_model
from app.core.model_registry import model_registry
import librosa
import librosa.display
import matplotlib
matplotlib.use('Agg')  # Use a thread-safe backend
import matplotlib.pyplot as plt
import numpy as np
import os
from pydub import AudioSegment





target_length = 10 * 1000  # 10 seconds in milliseconds

def create_mel_spectrogram(audio_path, output_path, file_name):
    try:
        audio_file_path = os.path.join(audio_path, file_name)
        print(audio_file_path)

        # Load the audio file
        y, sr = librosa.load(audio_file_path, sr=None, duration=10)  # Limit to 10 seconds

        # Generate Mel spectrogram
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=512, n_mels=128)
        S_dB = librosa.power_to_db(S, ref=np.max)

        # Create and save the plot without axes and scales
        plt.figure(figsize=(12, 8))
        librosa.display.specshow(S_dB, sr=sr, hop_length=512, x_axis=None, y_axis=None, cmap='viridis')
        plt.axis('off')  # Remove axes
        
        # Remove margins and save the plot as PNG with the same name as the WAV file
        output_filename = file_name.replace('.wav', '.png')
        output_file_path = os.path.join(output_path, output_filename)
        
        # Overwrite if file already exists
        plt.savefig(output_file_path, 
                    bbox_inches='tight', 
                    pad_inches=0,
                    dpi=300)
        plt.close()  # Close the figure after saving

        print('Mel Spectrogram created successfully!')
        return output_file_path
    
    except Exception as e:
        print(f"Error during spectrogram creation: {e}")
        return False

def preprocess_audio(file_path, target_length=target_length):
    try:
        # Load the audio file
        audio = AudioSegment.from_file(file_path)
        audio_length = len(audio)

        if audio_length > target_length:
            # Trim to the target length
            processed_audio = audio[:target_length]
        else:
            # Loop the audio until it reaches the target length
            repeats = target_length // audio_length + 1
            processed_audio = (audio * repeats)[:target_length]

        # Save the processed audio with a prefix 'preprocessed_'
        directory, filename = os.path.split(file_path)
        new_filename = f"preprocessed_{filename}"
        new_file_path = os.path.join(directory, new_filename)

        processed_audio.export(new_file_path, format="wav")  # Adjust format as needed

        print('Audio preprocessed successfully!')
        print(f"File saved as: {new_file_path}")
        return new_file_path
    
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        return False

def make_prediction(temp_path, temp_audio_path, temp_img_name, temp_audio_name):

    preprocessed_audio_path = preprocess_audio(temp_audio_path)

    if not preprocessed_audio_path:
        return 'Error in audio normalization'
    
    spectrogram_path = create_mel_spectrogram(temp_path, temp_path, temp_audio_name)
    
    if not spectrogram_path:
        return 'Error in spectrogram creation'

    speech_predict_model = model_registry.get("speechrate")

    # Use the model to make predictions
    prediction = predict_with_model(speech_predict_model, spectrogram_path, preprocessed_audio_path)

    return prediction

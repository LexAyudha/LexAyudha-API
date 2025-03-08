#model file
import torch
import os
import torch  # PyTorch library
import torch.nn as nn
import torch.nn.functional as F
import torchvision
import librosa
import torchvision.transforms as transforms
import numpy as np
from torchvision import models
from transformers import Wav2Vec2Model
from torchvision.models.vgg import vgg16
from PIL import Image



class SpeechRateModel(nn.Module):
    def __init__(self, dropout_rate=0.5):
        super(SpeechRateModel, self).__init__()

        # CNN branch with pretrained VGG16 model
        vgg16 = models.vgg16(weights=torchvision.models.VGG16_Weights.IMAGENET1K_V1)

        # Modify VGG16 to include batch normalization after each conv layer
        modified_features = []
        for layer in vgg16.features:
            modified_features.append(layer)
            if isinstance(layer, nn.Conv2d):
                modified_features.append(nn.BatchNorm2d(layer.out_channels))

        self.cnn = nn.Sequential(*modified_features[:-1])

        # Gradually unfreeze later layers of VGG16 for fine-tuning
        for i, param in enumerate(self.cnn.parameters()):
            if i >= len(list(self.cnn.parameters())) - 20:  # Unfreeze last few layers
                param.requires_grad = True
            else:
                param.requires_grad = False

        # RNN branch with Wav2Vec 2.0
        self.rnn = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base")

        # Gradual unfreezing for Wav2Vec
        for name, param in self.rnn.named_parameters():
            if 'encoder.layers.11' in name or 'encoder.layers.10' in name:  # Unfreeze last 2 layers
                param.requires_grad = True
            else:
                param.requires_grad = False

        # Calculate output sizes
        with torch.no_grad():
            dummy_cnn = torch.randn(1, 3, 224, 224)
            cnn_output_size = self.cnn(dummy_cnn).view(1, -1).shape[1]

        # Feature reduction layers
        self.cnn_reduction = nn.Sequential(
            nn.Linear(cnn_output_size, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout_rate/2)
        )

        self.wav2vec_reduction = nn.Sequential(
            nn.Linear(768, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout_rate/2)
        )

        # Multi-layer feature combination network
        self.combined_layers = nn.Sequential(
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout_rate),

            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate/2)
        )

        # Final prediction layers with residual connection
        self.final_layers = nn.Sequential(
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout_rate/4),
            nn.Linear(64, 1)
        )

        # L2 regularization will be applied during training
        self.l2_lambda = 0.01

    def forward(self, cnn_input, rnn_input):
        # CNN forward pass with residual connection
        cnn_out = self.cnn(cnn_input)
        cnn_out = cnn_out.view(cnn_out.size(0), -1)
        cnn_features = self.cnn_reduction(cnn_out)

        # RNN forward pass
        rnn_out = self.rnn(rnn_input).last_hidden_state
        rnn_out = torch.mean(rnn_out, dim=1)  # Global average pooling instead of last state
        wav2vec_features = self.wav2vec_reduction(rnn_out)

        # Combine features
        combined = torch.cat((cnn_features, wav2vec_features), dim=1)

        # Process through combined layers
        features = self.combined_layers(combined)

        # Final prediction with residual connection
        output = self.final_layers(features)

        return output

    def get_l2_regularization(self):
        """Calculate L2 regularization term for the model"""
        l2_reg = torch.tensor(0., requires_grad=True)
        for param in self.parameters():
            if param.requires_grad:
                l2_reg = l2_reg + torch.norm(param, 2)
        return self.l2_lambda * l2_reg


def load_model():
    """
    Load the AI model from a .pth file with error handling.
    """
    model_path = "src/assets/SpeechRateModel.pth"  # Replace with the actual path
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Check if the file exists
    if not os.path.exists(model_path):
        return {"error": f"Model file not found at {model_path}"}
    
    try:
        # Replace with your model's class definition
        model = SpeechRateModel().to(device)  
        
        checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()

        return model
    except Exception as e:
        # Handle any exception that occurs during loading
        return {"error": f"An error occurred while loading the model: {str(e)}"}

def remove_files(spectrogram_file, audio_file):
    """
    Deletes the specified spectrogram and audio files.
    """
    try:
        # Delete spectrogram file
        if os.path.exists(spectrogram_file):
            os.remove(spectrogram_file)
            print("Deleted temp spectrogram file")
        else:
            print(f"Spectrogram file not found: {spectrogram_file}")

        # Delete audio file
        if os.path.exists(audio_file):
            os.remove(audio_file)
            print("Deleted temp audio file")
        else:
            print(f"Audio file not found: {audio_file}")

    except Exception as e:
        print(f"Error deleting files: {str(e)}")


def predict_with_model(model, spectrogram_file, audio_file):
    """
    Use the loaded model to predict speech rate.
    """
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Spectrogram preprocessing
        spectrogram_image = Image.open(spectrogram_file).convert('RGB')
        transform = transforms.Compose([
            transforms.Resize((224, 224)),  # Adjust resize dimensions if necessary
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        spectrogram_tensor = transform(spectrogram_image).unsqueeze(0).to(device)
        print('Image transformations applied!')

        # Audio preprocessing
        signal, sr = librosa.load(audio_file)
        rnn_input = torch.from_numpy(signal).unsqueeze(0).to(device) 
        
        print('Inferencing the model')
        # Inference
        model.eval()  # Setting to evaluation mode before inference
        with torch.no_grad():
            prediction = model(spectrogram_tensor, rnn_input)  # Pass preprocessed inputs
            predicted_number = prediction.item()
        
        remove_files(spectrogram_file,audio_file)
        print(f"Predicted speech pace: {predicted_number}")
        return predicted_number

    except Exception as e:
        remove_files(spectrogram_file,audio_file)
        return {"error": f"An error occurred during prediction: {str(e)}"}


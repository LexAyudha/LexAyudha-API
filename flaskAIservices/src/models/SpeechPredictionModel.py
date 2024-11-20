#model file
import torch  # PyTorch library
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from torchvision import models
from transformers import Wav2Vec2Model
from torchvision.models.vgg import vgg16

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
    Load the AI model from a .pth file.
    """
    model_path = "path_to_your_model/model.pth"  # Replace with the actual path
    model = SpeechRateModel()  # Replace with your model's class definition
    model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
    model.eval()  # Set the model to evaluation mode
    return model

def predict_with_model(model, input_data):
    """
    Use the loaded model to predict results.
    :param model: The loaded PyTorch model.
    :param input_data: A dictionary containing input features.
    :return: The model's prediction.
    """
    # Convert input data to a PyTorch tensor
    features = torch.tensor(input_data["features"], dtype=torch.float32)
    # Add batch dimension if input is not batched
    if features.ndimension() == 1:
        features = features.unsqueeze(0)

    # Perform the prediction
    with torch.no_grad():
        output = model(features)
    
    # Process output (depends on your model's architecture)
    prediction = output.argmax(dim=1).item()  # Example for classification tasks
    return prediction

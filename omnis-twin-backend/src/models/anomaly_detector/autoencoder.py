import torch
import torch.nn as nn

class DynamicSensorAutoencoder(nn.Module):
    def __init__(self, num_sensors, sequence_length=50):
        super().__init__()
        self.num_sensors = num_sensors
        self.sequence_length = sequence_length
        
        # Flattened input size
        input_dim = num_sensors * sequence_length
        
        # Encoder: Compress the data down to a small bottleneck
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 16) # Bottleneck!
        )
        
        # Decoder: Try to reconstruct the original data from the bottleneck
        self.decoder = nn.Sequential(
            nn.Linear(16, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim)
        )
        
    def forward(self, x):
        # x shape: (Batch, sequence_length, num_sensors)
        batch_size = x.size(0)
        
        # Flatten
        x_flat = x.view(batch_size, -1)
        
        # Compress
        encoded = self.encoder(x_flat)
        
        # Decompress
        decoded = self.decoder(encoded)
        
        # Reshape back to original
        out = decoded.view(batch_size, self.sequence_length, self.num_sensors)
        
        return out

import os
import torch
import librosa
import numpy as np
from pathlib import Path
from torch.utils.data import Dataset

class AudioDataset(Dataset):
    def __init__(self, data_dir, sample_rate=32000, duration=1.0, is_train=False):
        self.is_train = is_train
        self.data_dir = Path(data_dir)
        self.sample_rate = sample_rate
        self.duration = duration
        self.max_length = int(self.sample_rate * self.duration)
        
        self.classes = sorted([d.name for d in self.data_dir.iterdir() if d.is_dir()])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        self.filepaths = []
        self.labels = []
        
        for cls_name in self.classes:
            cls_dir = self.data_dir / cls_name
            for file in cls_dir.glob('*.wav'):
                self.filepaths.append(file)
                self.labels.append(self.class_to_idx[cls_name])
                
    def __len__(self):
        return len(self.filepaths)
        
    def __getitem__(self, idx):
        file_path = self.filepaths[idx]
        label = self.labels[idx]
        
        # Load audio using librosa (automatically converts to mono)
        waveform, _ = librosa.load(file_path, sr=self.sample_rate)
        
        # Pad or truncate to max_length (1 second)
        if len(waveform) > self.max_length:
            waveform = waveform[:self.max_length]
        elif len(waveform) < self.max_length:
            padding = self.max_length - len(waveform)
            waveform = np.pad(waveform, (0, padding), 'constant')
            
        waveform_tensor = torch.tensor(waveform, dtype=torch.float32)
        
        # Data Augmentation (only applied to the training set)
        if self.is_train:
            # 1. Random Background Noise (50% chance)
            if torch.rand(1).item() < 0.5:
                noise = torch.randn_like(waveform_tensor) * 0.005 # Tiny static
                waveform_tensor = waveform_tensor + noise
                
            # 2. Random Volume Scaling (50% chance)
            if torch.rand(1).item() < 0.5:
                scale = torch.empty(1).uniform_(0.7, 1.3).item()
                waveform_tensor = waveform_tensor * scale
                
        return waveform_tensor, torch.tensor(label, dtype=torch.long)

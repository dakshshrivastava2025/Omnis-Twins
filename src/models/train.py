import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from panns_inference import AudioTagging
from dataset import AudioDataset
from tqdm import tqdm
import os
import json

# Hyperparameters
BATCH_SIZE = 32
LEARNING_RATE = 0.0001
EPOCHS = 50
NUM_CLASSES = 9
DATA_DIR = r"d:\VIT\hackathon\Code2Create\github\data\audio\split"
MODEL_SAVE_PATH = r"d:\VIT\hackathon\Code2Create\github\models"

class OmnisTwinModel(nn.Module):
    def __init__(self, pretrained_backbone, num_classes):
        super().__init__()
        self.backbone = pretrained_backbone
        
        # We are unfreezing the backbone (CNN14) to allow fine-tuning
        # (Removed the requires_grad = False loop)
            
        # Replace the classifier block according to AI prompt instructions
        self.classifier = nn.Sequential(
            nn.Linear(2048, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        # The backbone returns a dictionary. We extract the 2048-dim 'embedding'
        out_dict = self.backbone(x)
        emb = out_dict['embedding']
        # Pass embedding through our custom classifier
        logits = self.classifier(emb)
        return logits

def train():
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    
    # Setup Datasets
    print("Loading datasets...")
    train_dataset = AudioDataset(os.path.join(DATA_DIR, "train"), is_train=True)
    val_dataset = AudioDataset(os.path.join(DATA_DIR, "val"))
    
    # Save class mapping for later inference
    with open(os.path.join(MODEL_SAVE_PATH, "class_mapping.json"), "w") as f:
        json.dump(train_dataset.class_to_idx, f)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    
    # Load pretrained CNN14 backbone
    print("Loading PANNs CNN14 backbone...")
    at = AudioTagging(checkpoint_path=None, device=device)
    
    model = OmnisTwinModel(at.model, NUM_CLASSES).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    best_val_loss = float('inf')
    
    print("Starting training...")
    for epoch in range(EPOCHS):
        # --- TRAINING ---
        model.train()
        train_loss = 0.0
        correct = 0
        total = 0
        
        train_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Train]")
        for waveforms, labels in train_bar:
            waveforms, labels = waveforms.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(waveforms)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * waveforms.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            train_bar.set_postfix({'loss': loss.item(), 'acc': correct/total})
            
        # --- VALIDATION ---
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for waveforms, labels in val_loader:
                waveforms, labels = waveforms.to(device), labels.to(device)
                outputs = model(waveforms)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * waveforms.size(0)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
                
        avg_val_loss = val_loss / val_total
        val_acc = val_correct / val_total
        print(f"Validation -> Loss: {avg_val_loss:.4f}, Accuracy: {val_acc:.4f}")
        
        # Save best model
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), os.path.join(MODEL_SAVE_PATH, "best_model_v2_aug.pth"))
            print(f"--> Saved new best model (Loss: {best_val_loss:.4f})")

if __name__ == "__main__":
    train()

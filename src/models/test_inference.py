import os
import glob
import torch
import librosa
import numpy as np
import json
from panns_inference import AudioTagging

# Import the model architecture from our train script
from train import OmnisTwinModel

def load_audio(file_path, sample_rate=32000, duration=1.0):
    max_length = int(sample_rate * duration)
    waveform, _ = librosa.load(file_path, sr=sample_rate)
    
    if len(waveform) > max_length:
        waveform = waveform[:max_length]
    elif len(waveform) < max_length:
        padding = max_length - len(waveform)
        waveform = np.pad(waveform, (0, padding), 'constant')
        
    return torch.tensor(waveform, dtype=torch.float32).unsqueeze(0) # Add batch dimension for inference

def main():
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    model_dir = r"d:\VIT\hackathon\Code2Create\github\models"
    test_dir = r"d:\VIT\hackathon\Code2Create\github\data\audio\split\test"
    
    # Load class mappings
    with open(os.path.join(model_dir, "class_mapping.json"), "r") as f:
        class_to_idx = json.load(f)
        
    idx_to_class = {v: k for k, v in class_to_idx.items()}
    
    # Load model architecture
    print("Loading model...")
    at = AudioTagging(checkpoint_path=None, device=device)
    model = OmnisTwinModel(at.model, num_classes=len(class_to_idx)).to(device)
    
    # Load our trained weights
    model.load_state_dict(torch.load(os.path.join(model_dir, "best_model_v2_aug.pth"), map_location=device))
    model.eval()
    
    print("\n--- Running Inference on 2 files per category ---\n")
    
    correct = 0
    total = 0
    
    # Iterate over every class
    for cls_name in class_to_idx.keys():
        cls_dir = os.path.join(test_dir, cls_name)
        # Support both .wav and .mp3 just in case
        files = glob.glob(os.path.join(cls_dir, "*.wav"))
        
        # Take exactly 2 files (or fewer if the folder has less)
        test_files = files[:2]
        
        for file in test_files:
            waveform = load_audio(file).to(device)
            
            with torch.no_grad():
                logits = model(waveform)
                predicted_idx = torch.argmax(logits, dim=1).item()
                predicted_cls = idx_to_class[predicted_idx]
                
                is_correct = (predicted_cls == cls_name)
                if is_correct:
                    correct += 1
                total += 1
                
                status = "✅" if is_correct else "❌"
                print(f"{status} True: {cls_name:<25} | Pred: {predicted_cls:<25} | File: {os.path.basename(file)}")

    print(f"\nAccuracy on this mini-set: {correct}/{total} ({(correct/total)*100:.1f}%)")

if __name__ == "__main__":
    main()

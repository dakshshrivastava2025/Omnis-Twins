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
    
    print("\n--- Running Inference on ALL 'Normal' test files ---\n")
    
    correct = 0
    total = 0
    false_positives = {}
    
    # Iterate over every class
    for cls_name in class_to_idx.keys():
        if "normal" not in cls_name.lower():
            continue # Skip fault classes
            
        cls_dir = os.path.join(test_dir, cls_name)
        files = glob.glob(os.path.join(cls_dir, "*.wav"))
        
        for file in files:
            waveform = load_audio(file).to(device)
            
            with torch.no_grad():
                logits = model(waveform)
                predicted_idx = torch.argmax(logits, dim=1).item()
                predicted_cls = idx_to_class[predicted_idx]
                
                is_correct = (predicted_cls == cls_name)
                
                if is_correct:
                    correct += 1
                    status = "✅"
                elif "normal" in predicted_cls.lower():
                    # It guessed wrong, but it still guessed a 'normal' state
                    status = "⚠️"
                else:
                    # It falsely predicted an actual fault
                    status = "❌"
                    if predicted_cls not in false_positives:
                        false_positives[predicted_cls] = 0
                    false_positives[predicted_cls] += 1
                    
                total += 1
                
                print(f"{status} True: {cls_name:<25} | Pred: {predicted_cls:<25} | File: {os.path.basename(file)}")

    print(f"\nAccuracy on 'Normal' files: {correct}/{total} ({(correct/total)*100:.1f}%)")
    
    if false_positives:
        print("\n⚠️ False Positives Breakdown (Normal car flagged as faulty):")
        for fault, count in false_positives.items():
            print(f"- Falsely predicted '{fault}': {count} times")
    else:
        print("\n✅ Zero False Positives! It perfectly identified all normal operations.")

if __name__ == "__main__":
    main()

import os
import shutil
from pathlib import Path
from sklearn.model_selection import train_test_split

def split_dataset(src_dir, dest_dir, train_ratio=0.7, val_ratio=0.2, test_ratio=0.1):
    src_path = Path(src_dir)
    dest_path = Path(dest_dir)
    
    # Define classes (ignoring the 'state' parent folders to flatten the structure)
    classes = []
    filepaths = []
    labels = []
    
    # Traverse directory and collect all files
    for root, _, files in os.walk(src_path):
        for file in files:
            if file.endswith('.wav') or file.endswith('.mp3'): # Add extensions if needed
                file_path = Path(root) / file
                class_name = Path(root).name
                filepaths.append(file_path)
                labels.append(class_name)
                if class_name not in classes:
                    classes.append(class_name)
                    
    print(f"Found {len(filepaths)} audio files across {len(classes)} classes.")
    
    if len(filepaths) == 0:
        print("No files found! Check the path or file extensions.")
        return

    # First split: Train vs Temp (Val + Test)
    temp_ratio = val_ratio + test_ratio
    X_train, X_temp, y_train, y_temp = train_test_split(
        filepaths, labels, test_size=temp_ratio, stratify=labels, random_state=42
    )
    
    # Second split: Val vs Test
    test_rel_ratio = test_ratio / temp_ratio
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=test_rel_ratio, stratify=y_temp, random_state=42
    )
    
    print(f"Split sizes -> Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # Function to copy files
    def copy_files(files, labels, split_name):
        print(f"Copying {split_name} files...")
        for file, label in zip(files, labels):
            split_dir = dest_path / split_name / label
            split_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file, split_dir / file.name)
            
    # Execute copying
    copy_files(X_train, y_train, 'train')
    copy_files(X_val, y_val, 'val')
    copy_files(X_test, y_test, 'test')
    
    print("Done splitting data!")

if __name__ == "__main__":
    SOURCE_DIRECTORY = r"d:\VIT\hackathon\Code2Create\github\data\audio\car diagnostics dataset"
    DESTINATION_DIRECTORY = r"d:\VIT\hackathon\Code2Create\github\data\audio\split"
    
    split_dataset(SOURCE_DIRECTORY, DESTINATION_DIRECTORY)

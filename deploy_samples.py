import shutil
import os

source_dir = r"C:\Users\satya\.gemini\antigravity\brain\8aa5c058-0f82-4981-8d91-f9d06029cb4b"
dest_dir = r"d:\New folder\Ebook Project\frontend\BookForge\public\samples"

mapping = {
    "shonen_manga_sample_v1_1774465564217.png": "shonen.png",
    "seinen_manga_sample_v1_1774465581556.png": "seinen.png",
    "adventure_manga_sample_v1_1774465598593.png": "adventure.png"
}

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)
    print(f"Created directory: {dest_dir}")

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    try:
        shutil.copy2(src_path, dest_path)
        print(f"Successfully copied {src_name} to {dest_name}")
    except Exception as e:
        print(f"Error copying {src_name}: {e}")

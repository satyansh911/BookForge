import base64
import os
import json

source_dir = r"C:\Users\satya\.gemini\antigravity\brain\8aa5c058-0f82-4981-8d91-f9d06029cb4b"
dest_file = r"d:\New folder\Ebook Project\frontend\BookForge\src\data\mangaAssets.js"

mapping = {
    "shonen": "shonen_manga_sample_v1_1774465564217.png",
    "seinen": "seinen_manga_sample_v1_1774465581556.png",
    "adventure": "adventure_manga_sample_v1_1774465598593.png"
}

assets = {}
for key, filename in mapping.items():
    path = os.path.join(source_dir, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            b64_str = base64.b64encode(f.read()).decode("utf-8")
            assets[key] = f"data:image/png;base64,{b64_str}"
        print(f"Encoded {key}")
    else:
        print(f"File not found: {path}")

os.makedirs(os.path.dirname(dest_file), exist_ok=True)
with open(dest_file, "w") as f:
    f.write("export const mangaAssets = " + json.dumps(assets, indent=2) + ";\n")
print(f"Written to {dest_file}")

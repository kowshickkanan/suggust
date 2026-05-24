import requests
import os

base_dir = r"C:\Users\kowsh\OneDrive\Desktop\anti\ai-recommendation-system\ml_service\scratch"
test_images = ["test_derma.png"]
url = "http://localhost:8000/ocr_search"

for img_name in test_images:
    path = os.path.join(base_dir, img_name)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            files = {'image': f}
            response = requests.post(url, files=files)
            if response.status_code == 200:
                results = response.json()
                for p in results:
                    print(f"Product: {p['name']}")
                    print(f"Explanation: {p.get('explanation')}")
                    print(f"Tags: {p.get('relativityTags')}")

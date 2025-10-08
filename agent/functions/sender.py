# functions/sender.py
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# Base URL of your server
BASE_API_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api")

# functions/sender.py

def send_scan_results(data, endpoint_path="ports"):
    if isinstance(data, str):
        data = json.loads(data)

    # Wrap in 'system' if sending system info
    if endpoint_path == "system":
        payload = {"system": data}
    else:
        payload = {"results": data}

    url = f"{BASE_API_URL}/{endpoint_path}"

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"[+] Scan results successfully sent to {url}")
        print(f"[+] Server response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[!] Failed to send scan results: {e}")

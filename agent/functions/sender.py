# functions/sender.py
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# Default base URL — can be overridden dynamically
BASE_API_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api")

def set_base_api_url(url: str):
    """Allow dynamic override of base API URL (e.g., from GUI config)."""
    global BASE_API_URL
    BASE_API_URL = url.rstrip("/")

def send_scan_results(data, endpoint_path="ports"):
    """
    Sends scan results to the backend API depending on the endpoint.
    """
    if isinstance(data, str):
        data = json.loads(data)

    # Build payload depending on endpoint
    if endpoint_path == "system":
        payload = {"system": data}
    elif endpoint_path == "network-scan":
        payload = {"network": data}
    elif endpoint_path == "tasks":
        payload = data  # Already contains {"applications": [...], "background_processes": [...]}
    elif endpoint_path == "installed-apps":
        payload = {"deviceId": data.get("deviceId"), "applications": data.get("applications")}
    else:
        payload = {"results": data}

    url = f"{BASE_API_URL}/{endpoint_path}"

    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        print(f"[+] Data successfully sent to {url}")
        print(f"[+] Server response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[!] Failed to send data to {url}: {e}")

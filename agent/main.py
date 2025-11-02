# main.py
import json
import threading
import time
import os
from dotenv import load_dotenv

from functions.ports import scan_ports
from functions.sender import send_scan_results
from functions.system import get_system_info
from functions.taskmanager import collect_process_info
from functions.installed_apps import get_installed_apps
from functions.usbMonitor import monitor_usb_devices

load_dotenv()

def run_scans():
    # --- 1. Port Scan ---
    target_ip = "127.0.0.1"
    port_range = "1-1024"
    print("\n[*] Scanning localhost ports...\n")
    port_results = scan_ports(target_ip, port_range)
    print("[*] Port Scan Results:\n", json.dumps(port_results, indent=2))
    send_scan_results(port_results, endpoint_path="ports")

    # --- 2. System Info ---
    print("\n[*] Collecting system information...\n")
    system_data = get_system_info()
    print("[*] System Information:\n", json.dumps(system_data, indent=2))
    send_scan_results(system_data, endpoint_path="system")

    # Extract deviceId
    device_id = system_data.get("machine_id") or system_data.get("hostname") or "unknown-device"

    # --- 3. Installed Apps ---
    print("\n[*] Collecting installed applications...\n")
    apps = get_installed_apps()
    send_scan_results({"deviceId": device_id, "applications": apps}, endpoint_path="installed-apps")

    # --- 4. Task Manager ---
    print("\n[*] Collecting task manager data...\n")
    task_data = collect_process_info()
    task_payload = {
        "deviceId": device_id,
        "applications": task_data.get("applications", []),
        "background_processes": task_data.get("background_processes", [])
    }
    print("[*] Task Manager Data Payload:\n", json.dumps(task_payload, indent=2))
    send_scan_results(task_payload, endpoint_path="tasks")

    print("\n✅ All scan data collected and sent to backend.\n")


def main():
    # --- Run initial scans ---
    run_scans()

    # --- Start USB Monitor Thread ---
    print("[*] Starting strict USB monitor in background...\n")
    usb_thread = threading.Thread(target=monitor_usb_devices, daemon=True)
    usb_thread.start()

    # --- Keep Agent Alive ---
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Shutting down agent.")


if __name__ == "__main__":
    main()
